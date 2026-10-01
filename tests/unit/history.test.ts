import { afterEach, describe, expect, it, vi } from 'vitest';
import { Repository } from '../../src/store/repository';
import { defaultSettings, type AttemptRecord, type RunRecord, type SemanticValidator } from '../../src/store/records';
import { parseBackup } from '../../src/store/validation';
import { attempt, session } from './fixtures';
import { timerFixtureValidator } from '../helpers/timer-fixtures';
import { TimerController } from '../../src/timer/controller';
const repositories: Repository[] = [];
function repo(name = crypto.randomUUID(), validator: SemanticValidator = timerFixtureValidator) {
  const result = new Repository(name, () => {}, validator); repositories.push(result); return result;
}
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(repositories.splice(0).map((r) => r.close())); });
describe('acknowledged attempt edits/delete/undo', () => {
  it('round-trips stopped real controller records, settings, durations and penalty separately', async () => {
    const r = repo(); await r.saveSession(session); let now = 0;
    const timer = new TimerController(r, { now: () => now, date: () => new Date(Date.parse(session.createdAt) + now).toISOString(), id: () => 'stopped-real-controller' }, () => true);
    timer.present({ challenge: attempt.challenge, session, settings: { inspectionMode: '15s', audibleWarnings: true } }); now = 2000; timer.action(); now = 16700; timer.press('space'); now = 17000; timer.release('space'); now = 21382; timer.action();
    await vi.waitFor(() => expect(timer.getSnapshot().phase).toBe('saved'));
    const data = await r.read(); const row = data.backup.attempts[0]; expect(row).toMatchObject({ preparationMs: 17000, timing: { inspectionMs: 15000, executionMs: 4382 }, penalty: { kind: 'plus2', source: 'inspection' }, settingsSnapshot: { inspectionMode: '15s', audibleWarnings: true } });
    const restored = await parseBackup(JSON.stringify(data.backup), timerFixtureValidator); expect(restored.attempts).toEqual([row]);
    const undo = await r.editAttempt('stopped-real-controller', 'dnf', data.revision); const changed = (await r.read()).backup.attempts[0];
    expect(changed?.timing).toEqual(row?.timing); expect(changed?.challenge).toEqual(row?.challenge); expect(changed?.preparationMs).toBe(row?.preparationMs); await r.undoAttempt(undo); expect((await r.read()).backup.attempts[0]).toEqual(row);
  });
  it('rejects stale cross-tab edits and undo, then restores only the latest deletion', async () => {
    const name = crypto.randomUUID(), first = repo(name), second = repo(name); await first.saveSession(session); await first.saveAttempt(attempt);
    const revision = (await first.read()).revision; const edited = await second.editAttempt(attempt.id, 'plus2', revision);
    await expect(first.deleteAttempt(attempt.id, revision)).rejects.toThrow('changed'); await first.saveSettings(defaultSettings);
    await expect(second.undoAttempt(edited)).rejects.toThrow('expired');
    const deletion = await first.deleteAttempt(attempt.id, (await first.read()).revision); expect((await first.read()).backup.attempts).toEqual([]);
    await first.undoAttempt(deletion); expect((await first.read()).backup.attempts[0]?.penalty.kind).toBe('plus2'); await expect(first.undoAttempt(deletion)).rejects.toThrow('expired');
  });
  it('rejects modified undo snapshots so challenge and duration changes cannot hide in undo', async () => {
    const r = repo(); await r.saveSession(session); await r.saveAttempt(attempt);
    const undo = await r.editAttempt(attempt.id, 'plus2', (await r.read()).revision); undo.before.preparationMs = 9000;
    await expect(r.undoAttempt(undo)).rejects.toThrow('expired or changed'); expect((await r.read()).backup.attempts[0]?.preparationMs).toBe(attempt.preparationMs);
  });
  it('interrupted raw times and challenges stay immutable after removing a DNF', async () => {
    const r = repo(); await r.saveSession(session);
    const interrupted: AttemptRecord = { ...structuredClone(attempt), timing: { status: 'interrupted', executionMs: 1234, inspectionMs: null, phase: 'execution', reason: 'background' }, penalty: { kind: 'dnf', source: 'manual' } };
    await r.saveAttempt(interrupted); await r.editAttempt(attempt.id, 'none', (await r.read()).revision);
    expect((await r.read()).backup.attempts[0]).toEqual({ ...interrupted, penalty: { kind: 'none', source: 'manual' } });
    await expect(r.saveAttempt({ ...interrupted, timing: { status: 'completed', executionMs: 1234, inspectionMs: null } })).rejects.toThrow('different record');
  });
  it('does not acknowledge quota-failed mutations and leaves the previous record intact', async () => {
    const r = repo(); await r.saveSession(session); await r.saveAttempt(attempt); const revision = (await r.read()).revision;
    const original = IDBObjectStore.prototype.put; vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
      if (this.name === 'attempts') throw new DOMException('Injected quota', 'QuotaExceededError');
      return key === undefined ? original.call(this, value) : original.call(this, value, key);
    });
    await expect(r.editAttempt(attempt.id, 'dnf', revision)).rejects.toMatchObject({ name: 'QuotaExceededError' });
    expect((await r.read()).backup.attempts).toEqual([attempt]); expect((await r.read()).revision).toBe(revision);
  });
  it('requires validation for all writes and makes run-linked deletion/undo atomic using only injected run capabilities', async () => {
    const run: RunRecord = { id: 'test-run', sessionId: session.id, setId: null, setSnapshot: { id: 'test-set', label: 'Test-only', trainer: 'oll', caseIds: ['test-case'], createdAt: session.createdAt, updatedAt: session.createdAt }, comparisonKey: 'test-only', repPlan: [{ caseId: 'test-case', preAuf: 0, yaw: 0 }], status: 'complete', cursor: 1, outcomes: [{ kind: 'attempt', repIndex: 0, attemptId: attempt.id }], createdAt: session.createdAt, endedAt: attempt.endedAt };
    // Explicit transaction fixture, not a claim of Cross runs or real OLL catalog support.
    const validator: SemanticValidator = { ...timerFixtureValidator, async validateTrainingData(data, attempts) {
      if (data.personalAlgorithms.length || data.practiceSets.length) throw new Error('Unsupported test training data');
      const checked = data.runs.map((input) => {
        const known = run.status === 'complete' && JSON.stringify(input) === JSON.stringify(run) ? run
          : { ...run, status: 'interrupted' as const, outcomes: [{ kind: 'interrupted' as const, repIndex: 0, attemptId: null }] };
        if (JSON.stringify(input) !== JSON.stringify(known)) throw new Error('Unexpected test run');
        if (known.status === 'complete' && !attempts.some((a) => a.id === attempt.id)) throw new Error('Dangling run attempt'); return structuredClone(known);
      });
      return { personalAlgorithms: [], practiceSets: [], runs: checked };
    } };
    const r = repo(undefined, validator); await r.saveSession(session); await r.saveAttempt({ ...attempt, runId: run.id, repIndex: 0 }, run);
    const undo = await r.deleteAttempt(attempt.id, (await r.read()).revision); const data = await r.read(); expect(data.backup.attempts).toEqual([]); expect(data.backup.runs[0]).toMatchObject({ status: 'interrupted', outcomes: [{ kind: 'interrupted', attemptId: null }] });
    await r.undoAttempt(undo); expect((await r.read()).backup.runs).toEqual([run]);
    const revision = (await r.read()).revision, put = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
      if (this.name === 'runs') throw new DOMException('Injected run quota', 'QuotaExceededError');
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    });
    await expect(r.deleteAttempt(attempt.id, revision)).rejects.toMatchObject({ name: 'QuotaExceededError' });
    expect((await r.read()).backup.attempts).toHaveLength(1); expect((await r.read()).backup.runs).toEqual([run]); expect((await r.read()).revision).toBe(revision);
    vi.restoreAllMocks();
    const gate = repo(crypto.randomUUID(), { ...timerFixtureValidator, validateTrainingData: async () => { throw new Error('No compatible run validator'); } });
    await expect(gate.saveAttempt({ ...attempt, runId: run.id, repIndex: 0 }, run)).rejects.toThrow('No compatible run validator');
  });
});
