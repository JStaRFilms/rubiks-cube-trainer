import { describe, expect, it, vi } from 'vitest';
import { TimerController, emergencyExport, type Presentation } from '../../src/timer/controller';
import type { AttemptRecord } from '../../src/store/records';
import { fixturePresentation } from '../helpers/timer-fixtures';
import { activityStore, enterActivity, lockUpdate, releaseUpdate } from '../../src/pwa/activity';
import { parseBackup } from '../../src/store/validation';
function harness(mode: 'untimed' | '15s' = 'untimed') {
  let now = 900;
  const records: AttemptRecord[] = [], phases: string[] = [], warnings: number[] = [];
  const save = vi.fn(async (record: AttemptRecord) => { records.push(record); });
  const controller = new TimerController({ saveAttempt: save }, { now: () => now, date: () => new Date(1790726400000 + now).toISOString(), id: () => `id-${now}` }, (phase) => { phases.push(phase); return true; }, (second) => warnings.push(second));
  const presentation: Presentation = { ...structuredClone(fixturePresentation), settings: { inspectionMode: mode, audibleWarnings: false } };
  const advance = (ms: number) => { now += ms; controller.tick(); };
  return { controller, records, phases, warnings, save, presentation, advance };
}
async function settled() { await Promise.resolve(); await Promise.resolve(); }
describe('physical timer', () => {
  it('counts only committed presentation, holds 300ms and starts on release, then stops on press', async () => {
    const h = harness(); h.advance(10000); h.controller.present(h.presentation); h.advance(4000);
    h.controller.press('space'); h.advance(299.9); expect(h.controller.getSnapshot().armed).toBe(false); h.controller.release('space');
    expect(h.controller.getSnapshot().phase).toBe('preparation');
    h.controller.press('space'); h.advance(300); expect(h.controller.getSnapshot().armed).toBe(true);
    expect(h.controller.getSnapshot().phase).toBe('arming'); h.controller.release('space'); h.advance(4382.4); h.controller.press('space');
    expect(h.controller.getSnapshot().phase).toBe('save-pending'); h.controller.release('space'); await settled();
    expect(h.controller.getSnapshot().phase).toBe('saved');
    expect(h.records[0]).toMatchObject({ preparationMs: 4600, timing: { status: 'completed', executionMs: 4382, inspectionMs: null }, penalty: { kind: 'none' } });
    expect(h.phases).toEqual(['preparation', 'arming', 'preparation', 'arming', 'execution', 'save-pending', 'idle']);
  });
  it('strict first gesture cannot arm even after a long hold, then a separate hold includes arming in inspection', async () => {
    const h = harness('15s'); h.controller.present(h.presentation); h.advance(5000);
    h.controller.press('pointer:1'); h.advance(1000); expect(h.controller.getSnapshot().phase).toBe('inspection');
    h.controller.press('pointer:1'); h.controller.press('pointer:2'); h.controller.release('pointer:2');
    expect(h.controller.getSnapshot().phase).toBe('inspection'); h.controller.release('pointer:1');
    h.controller.press('pointer:1'); h.advance(300); h.controller.release('pointer:1'); h.advance(400); h.controller.press('space'); await settled();
    expect(h.records[0]).toMatchObject({ preparationMs: 6300, settingsSnapshot: { inspectionMode: '15s' }, timing: { executionMs: 400, inspectionMs: 1300 } });
  });
  it.each([[14999.6, 'none'], [15000, 'plus2'], [16999.6, 'plus2'], [17000, 'dnf']] as const)('uses unrounded elapsed inspection %s for %s', async (edge, kind) => {
    const h = harness('15s'); h.controller.present(h.presentation); h.controller.action(); h.advance(edge - 300);
    h.controller.press('space'); h.advance(300); h.controller.release('space'); h.advance(999.6); h.controller.action(); await settled();
    expect(h.records[0]?.penalty.kind).toBe(kind); expect(h.records[0]?.timing).toMatchObject({ executionMs: 1000, inspectionMs: Math.round(edge) });
  });
  it('announces 8/12 warnings once and keeps inspection on cancelled holds', () => {
    const h = harness('15s'); h.controller.present(h.presentation); h.controller.action(); h.advance(7999.9); expect(h.warnings).toEqual([]);
    h.advance(0.1); h.controller.press('pointer:1'); h.advance(300); h.controller.cancelInput('pointer:2'); expect(h.controller.getSnapshot().armed).toBe(true);
    h.controller.cancelInput('pointer:1'); h.controller.release('pointer:1'); expect(h.controller.getSnapshot().phase).toBe('inspection');
    h.advance(3700); h.controller.tick(); h.controller.tick(); expect(h.warnings).toEqual([8, 12]);
  });
  it('ignores repeats/extra owners, cancellation, early release and discrete untimed clicks', () => {
    const h = harness(); h.controller.present(h.presentation); h.controller.action(); expect(h.controller.getSnapshot().phase).toBe('preparation');
    h.controller.press('space'); h.advance(200); expect(h.controller.press('space')).toBe(false); expect(h.controller.press('pointer:2')).toBe(false);
    h.controller.release('pointer:2'); h.controller.cancelInput(); h.advance(300); h.controller.release('space'); expect(h.controller.getSnapshot().phase).toBe('preparation');
    h.controller.press('pointer:1'); h.advance(299); h.controller.release('pointer:1'); expect(h.controller.getSnapshot().phase).toBe('preparation');
  });
  it('cannot advance during writes, post-stop guard or save failure; retry uses the identical frozen record', async () => {
    const h = harness(); let resolve: (() => void) | undefined;
    h.save.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
    h.controller.present(h.presentation); h.controller.press('space'); h.advance(300); h.controller.release('space'); h.advance(100); h.controller.press('space');
    const record = h.controller.getSnapshot().record; expect(Object.isFrozen(record)).toBe(true);
    expect(h.controller.present(h.presentation)).toBe(false); h.controller.release('space'); resolve?.(); await settled();
    expect(h.controller.present(h.presentation)).toBe(false); h.advance(249.9); expect(h.controller.present(h.presentation)).toBe(false); h.advance(0.1); expect(h.controller.present(h.presentation)).toBe(true);
    h.save.mockRejectedValueOnce(new DOMException('Injected', 'QuotaExceededError')); h.controller.press('space'); h.advance(300); h.controller.release('space'); h.advance(123); h.controller.press('space'); await settled();
    const unsaved = h.controller.getSnapshot().record; expect(h.controller.getSnapshot().phase).toBe('save-failed'); expect(h.controller.present(h.presentation)).toBe(false);
    h.advance(500); await h.controller.retry(); expect(h.save.mock.calls.at(-1)?.[0]).toBe(unsaved); expect(h.controller.getSnapshot().record).toBe(unsaved);
  });
  it.each(['preparation', 'inspection', 'arming', 'execution'] as const)('background in %s saves an interruption, never resumes', async (phase) => {
    const h = harness('15s'); h.controller.present(h.presentation); h.advance(500);
    if (phase !== 'preparation') { h.controller.action(); h.advance(1000); }
    if (phase === 'arming' || phase === 'execution') { h.controller.press('space'); h.advance(300); }
    if (phase === 'execution') { h.controller.release('space'); h.advance(100); }
    h.controller.interrupt(); h.controller.release('space'); await settled();
    expect(h.records[0]?.timing).toMatchObject({ status: 'interrupted', phase, reason: 'background', executionMs: phase === 'execution' ? 100 : null });
    h.controller.action(); expect(h.records).toHaveLength(1); expect(h.controller.active).toBe(false);
  });
  it('freezes challenge/session/settings without mutating the caller', async () => {
    const h = harness(); h.controller.present(h.presentation);
    h.presentation.session.id = 'changed'; if (h.presentation.challenge.options.trainer === 'cross') h.presentation.challenge.options.K = 8; h.presentation.settings.inspectionMode = '15s';
    expect(h.controller.present(h.presentation)).toBe(false); h.controller.press('space'); h.advance(300); h.controller.release('space'); h.controller.action(); await settled();
    expect(h.records[0]).toMatchObject({ sessionId: 'session-fixture', challenge: { options: { K: 1 } }, settingsSnapshot: { inspectionMode: 'untimed' } });
  });
  it('emergency file is explicitly unsaved and rejected as a normal backup', async () => {
    const h = harness(); h.controller.present(h.presentation); h.controller.interrupt(); await settled();
    const record = h.records[0]; if (!record) throw new Error('Missing test record');
    const file = emergencyExport(record); expect(file.unsaved).toBe(true); expect(file.attempt).toBe(record);
    await expect(parseBackup(JSON.stringify(file))).rejects.toThrow('not a Cube Trainer backup');
  });
  it('uses the real activity/update lock for deferred presentation and all timing/save phases', async () => {
    enterActivity('idle'); expect(lockUpdate('timer-test')).toBe(true);
    const h = harness(), timer = new TimerController({ saveAttempt: async () => {} }, undefined, enterActivity);
    expect(timer.present(h.presentation)).toBe(false); releaseUpdate('timer-test'); expect(timer.present(h.presentation)).toBe(true);
    expect(activityStore.getState().phase).toBe('preparation'); expect(lockUpdate('timer-test')).toBe(false);
    timer.interrupt(); expect(activityStore.getState().phase).toBe('save-pending'); await settled(); expect(activityStore.getState().phase).toBe('idle');
  });
});
