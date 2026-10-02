import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { loadEngine, ENGINE_VERSION, type CubeEngine } from '../../src/cube/engine';
import { auf, QUARTERS } from '../../src/cases/identity';
import { invertMoves } from '../../src/cube/notation';
import { createLL, initializeLL, LL_CASES, llLibrary } from '../../src/ll/model';
import { validateLL, validateLLAttempt } from '../../src/ll/validation';
import { closeRep, createRun, recoverRun, runComparisonKey, validateLLTraining } from '../../src/ll/runs';
import { Repository } from '../../src/store/repository';
import { decodeBackup } from '../../src/store/validation';
import { colors, type AttemptRecord, type PersonalAlgorithmRecord, type PracticeSetRecord, type RunRecord, type SemanticValidator, type SessionRecord, type TrainerBackupV1 } from '../../src/store/records';
import { TimerController } from '../../src/timer/controller';
import { runStatistics, compatibleRunPB } from '../../src/statistics/runs';
import { llBases, llIndices, lowerIndices, normalizedPermutation, oracleKey, replay, solved } from '../helpers/case-oracle';
let engine: CubeEngine;
const origin = '2026-10-01T00:00:00.000Z';
const repositories: Repository[] = [];
const validator: SemanticValidator = { validateAttempt: async (input) => validateLLAttempt(input, engine), validateTrainingData: async (data, attempts, sessions) => validateLLTraining(engine, data, attempts, sessions) };
beforeAll(async () => { engine = await loadEngine(); initializeLL(engine); });
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(repositories.splice(0).map((repo) => repo.close())); });
function repo(name = crypto.randomUUID()) { const result = new Repository(name, undefined, validator); repositories.push(result); return result; }
function session(trainer: 'oll' | 'pll' = 'oll'): SessionRecord { return { id: `session-${trainer}`, trainer, label: trainer, createdAt: origin }; }
function set(trainer: 'oll' | 'pll' = 'oll', count?: number): PracticeSetRecord { return { id: `set-${trainer}`, trainer, label: trainer, caseIds: llLibrary(trainer).slice(0, count).map((entry) => entry.id), createdAt: origin, updatedAt: origin }; }
function run(trainer: 'oll' | 'pll' = 'oll', count?: number, algorithms: PersonalAlgorithmRecord[] = []): RunRecord {
  return createRun(engine, set(trainer, count), session(trainer), { mode: 'recognition', shuffle: false, preAuf: 0, yaw: 0, settings: { inspectionMode: 'untimed', audibleWarnings: false }, frame: engine.frame('white') }, algorithms);
}
function override(caseId: string, suffix = auf(1)): PersonalAlgorithmRecord {
  const entry = LL_CASES.find((entry) => entry.id === caseId); if (!entry) throw Error('Missing actual LL case.');
  return { caseId, slot: 'canonical', preAuf: 1, moves: [...invertMoves(auf(1)), ...entry.defaultAlgorithm, ...suffix], updatedAt: origin, identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
}
function timed(run: RunRecord, index = run.cursor): AttemptRecord {
  const challenge = run.snapshot?.challenges[index]; if (!challenge || !run.snapshot) throw Error('Missing actual plan.');
  const presentedAt = new Date(Date.parse(run.createdAt) + index * 10000 + 100).toISOString();
  return { id: `${run.id}/${index}`, sessionId: run.sessionId, trainer: run.setSnapshot.trainer, challenge, settingsSnapshot: run.snapshot.settings, runId: run.id, repIndex: index, presentedAt, endedAt: new Date(Date.parse(presentedAt) + 3000).toISOString(), preparationMs: 1000, timing: { status: 'completed', executionMs: 2000, inspectionMs: null }, penalty: { kind: 'none', source: 'none' } };
}
function backup(runs: RunRecord[], attempts: AttemptRecord[] = []): TrainerBackupV1 { return { format: 'cube-trainer-backup', version: 1, exportedAt: origin, cubeContract: 'cube3-facelets-v1', settings: [], sessions: [session(), session('pll')], attempts, personalAlgorithms: [], practiceSets: [], runs }; }
it('independently proves actual generated 7,488 LL defaults for every case/angle/six-frame', () => {
  let checked = 0;
  for (const entry of LL_CASES) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) for (const color of colors) {
    const trainer = entry.trainer === 'oll' ? 'oll' : 'pll', result = createLL(engine, { trainer, caseId: entry.id, preAuf, yaw, mode: 'recognition', frame: engine.frame(color), requestId: 'actual', epoch: checked });
    const start = replay(solved, result.scramble), final = replay(start, [...result.proof.solution, ...auf(result.proof.finalAuf)]);
    if (start !== result.start.facelets || oracleKey(trainer, start) !== oracleKey(trainer, entry.representative.facelets) || !lowerIndices.every((i) => final[i] === solved[i]) || ![0, 1, 2, 3, 5, 6, 7, 8].every((i) => final[i] === 'U') || (trainer === 'pll' && final !== solved)) throw Error(`Actual generated case failed ${entry.id}/${preAuf}/${yaw}/${color}`);
    expect(validateLL(result, engine)).toEqual(result); checked++;
  }
  expect(checked).toBe(78 * 16 * 6);
}, 180000);
it('actual OLL setups/guidance tolerate all 288 bases, every angle and permutation-changing personal guidance', () => {
  const bases = llBases(), t = llLibrary('pll').find((entry) => entry.label === 'T'); if (!t) throw Error('Missing sourced T permutation.'); let checked = 0;
  for (const entry of llLibrary('oll')) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) for (const color of colors) {
    const result = createLL(engine, { trainer: 'oll', caseId: entry.id, preAuf, yaw, mode: 'execution', frame: engine.frame(color), requestId: 'actual', epoch: checked }, [override(entry.id, [...t.defaultAlgorithm])]);
    const setup = normalizedPermutation(result.scramble), solution = normalizedPermutation(result.proof.solution);
    for (const base of bases) {
      const start = setup.map((from) => base[from]).join(''), final = solution.map((from) => start[from]).join('');
      if (final === base || !lowerIndices.every((i) => start[i] === solved[i] && final[i] === solved[i]) || !llIndices.every((i) => (start[i] === 'U') === (result.start.facelets[i] === 'U')) || ![0, 1, 2, 3, 5, 6, 7, 8].every((i) => final[i] === 'U')) throw Error(`Variable base proof failed ${entry.id}/${preAuf}/${yaw}/${base}`); checked++;
    }
  }
  expect(checked).toBe(57 * 16 * 6 * 288);
}, 120000);
it('PLL personal pre-AUF and final AUF solve actual generated angles while setup/identity stay fixed', () => {
  let checked = 0;
  for (const entry of llLibrary('pll')) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) for (const color of colors) {
    const request = { trainer: 'pll' as const, caseId: entry.id, preAuf, yaw, mode: 'execution' as const, frame: engine.frame(color), requestId: 'actual', epoch: 1 };
    const initial = createLL(engine, request), result = createLL(engine, request, [override(entry.id)]);
    expect(result.scramble).toEqual(initial.scramble); expect(result.proof.finalAuf).toBe(3);
    expect(replay(result.start.facelets, [...result.proof.solution, ...auf(result.proof.finalAuf)])).toBe(solved); checked++;
  }
  expect(checked).toBe(21 * 16 * 6);
}, 60000);
it('returns regripped personal PLL guidance to the held frame before final AUF', () => {
  const entry = llLibrary('pll')[0]; if (!entry) throw Error('Missing actual PLL.'); let checked = 0;
  for (const rotation of engine.orientations) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) for (const color of colors) {
    const personal = override(entry.id, [...auf(1), ...rotation.moves]), result = createLL(engine, { trainer: 'pll', caseId: entry.id, preAuf, yaw, mode: 'execution', frame: engine.frame(color), requestId: 'regripped', epoch: checked }, [personal]);
    expect(result.proof.finalAuf).toBe(3); expect(replay(result.start.facelets, [...result.proof.solution, ...auf(result.proof.finalAuf)])).toBe(solved); checked++;
  }
  expect(checked).toBe(24 * 16 * 6);
}, 60000);
it.each(['oll', 'pll'] as const)('saves complete real %s plans and controller-timed runs atomically with unique links', async (trainer) => {
  const r = repo(); await r.saveSession(session(trainer)); let current = run(trainer); await r.saveRun(current, (await r.read()).revision);
  let now = Date.parse(current.createdAt) + 100; let id = 0;
  const timer = new TimerController(r, { now: () => now, date: () => new Date(now).toISOString(), id: () => `${current.id}/timed-${id++}` }, () => true);
  const count = trainer === 'oll' ? 57 : 21;
  for (let index = 0; index < count; index++) {
    current = { ...current, presented: true }; await r.saveRun(current, (await r.read()).revision);
    const challenge = current.snapshot?.challenges[index]; if (!challenge || !current.snapshot) throw Error('Missing actual challenge.');
    const frozen = structuredClone(current);
    expect(timer.present({ challenge, session: session(trainer), settings: current.snapshot.settings, run: { id: current.id, repIndex: index, outcome: (attempt) => closeRep(frozen, attempt) } })).toBe(true);
    timer.press('space'); now += 300; timer.release('space'); now += 1234; timer.press('space'); timer.release('space');
    await vi.waitFor(() => expect(timer.getSnapshot()).toMatchObject({ phase: 'saved', error: '' }), { timeout: 10000 });
    const stored = await r.read(), next = stored.backup.runs[0]; if (!next) throw Error('Run missing.'); current = next; now += 300;
    expect(current.cursor).toBe(index + 1); expect(stored.backup.attempts).toHaveLength(index + 1);
  }
  const stored = await r.read(), summary = runStatistics(current, stored.backup.attempts);
  expect(current.status).toBe('complete'); expect(summary).toMatchObject({ completed: count, successful: count, eligible: true, setMean: { kind: 'value', ms: 1234 } });
  expect(new Set(stored.backup.attempts.map((a) => a.repIndex)).size).toBe(count);
  expect((await decodeBackup(stored.backup, validator)).runs).toEqual([current]);
}, 60000);
it('rolls back outcome/attempt on quota, retries idempotently and rejects competing cursor writes', async () => {
  const name = crypto.randomUUID(), r = repo(name), other = repo(name); await r.saveSession(session()); const initial = run('oll', 2), beforeStart = await r.read(), startPut = IDBObjectStore.prototype.put;
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, input: unknown, key?: IDBValidKey) { if (this.name === 'runs') throw new DOMException('Start quota', 'QuotaExceededError'); return key === undefined ? startPut.call(this, input) : startPut.call(this, input, key); });
  await expect(r.saveRun(initial, beforeStart.revision)).rejects.toThrow(); expect((await r.read()).backup.runs).toEqual([]); expect((await r.read()).revision).toBe(beforeStart.revision); vi.restoreAllMocks();
  await r.saveRun(initial, beforeStart.revision); await expect(other.saveRun(run('oll', 2), beforeStart.revision)).rejects.toThrow('changed');
  const active = { ...initial, presented: true }; await r.saveRun(active, (await r.read()).revision); const attempt = timed(active), next = closeRep(active, attempt), before = await r.read();
  const put = IDBObjectStore.prototype.put; vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, input: unknown, key?: IDBValidKey) { if (this.name === 'runs') throw new DOMException('Quota', 'QuotaExceededError'); return key === undefined ? put.call(this, input) : put.call(this, input, key); });
  await expect(r.saveAttempt(attempt, next)).rejects.toThrow(); expect((await r.read()).backup.attempts).toEqual([]); expect((await r.read()).revision).toBe(before.revision);
  vi.restoreAllMocks(); await r.saveAttempt(attempt, next); const committed = await r.read(); await r.saveAttempt(attempt, next); expect((await r.read()).revision).toBe(committed.revision);
  await expect(other.saveAttempt({ ...attempt, id: 'competing' }, { ...next, outcomes: [{ kind: 'attempt', repIndex: 0, attemptId: 'competing' }] })).rejects.toThrow();
  await expect(r.saveRun({ ...next, presented: true }, before.revision)).rejects.toThrow('changed');
});
it('recovery/restore, skip/abandon, linked deletion/Undo and DNF never fabricate a successful PB', async () => {
  const r = repo(); await r.saveSession(session()); let current = run('oll', 2); await r.saveRun(current, (await r.read()).revision); current = { ...current, presented: true }; await r.saveRun(current, (await r.read()).revision);
  const attempt = timed(current); current = closeRep(current, attempt); await r.saveAttempt(attempt, current);
  expect(runStatistics(current, [attempt]).eligible).toBe(false);
  const revision = (await r.read()).revision, dnf = await r.editAttempt(attempt.id, 'dnf', revision); expect(runStatistics(current, (await r.read()).backup.attempts).setMean.kind).toBe('dnf'); await r.undoAttempt(dnf);
  const deletion = await r.deleteAttempt(attempt.id, (await r.read()).revision); const deleted = await r.read(); expect(deleted.backup.runs[0]?.interruptions).toEqual([0]); await r.undoAttempt(deletion);
  current = { ...current, presented: true }; await r.saveRun(current, (await r.read()).revision);
  const snapshot = await r.read(); await r.replace(snapshot.backup, snapshot.revision); const restored = await r.read(), recovered = restored.backup.runs[0]; if (!recovered) throw Error('Missing recovered run.');
  expect(recovered).toMatchObject({ cursor: 2, status: 'complete', presented: false, interruptions: [1], outcomes: [{ kind: 'attempt', repIndex: 0 }, { kind: 'interrupted', repIndex: 1, attemptId: null }] }); expect(restored.backup.attempts).toHaveLength(1); expect(runStatistics(recovered, restored.backup.attempts).eligible).toBe(false);
  const fresh = run('oll', 2); await r.saveRun(fresh, restored.revision); const skipped = { ...fresh, cursor: 1, outcomes: [{ kind: 'skipped' as const, repIndex: 0, caseId: fresh.repPlan[0]?.caseId ?? '' }] }; await r.saveRun(skipped, (await r.read()).revision);
  const abandoned = { ...skipped, status: 'abandoned' as const, endedAt: new Date().toISOString() }; await r.saveRun(abandoned, (await r.read()).revision); expect(runStatistics(abandoned, []).eligible).toBe(false);
});
it('validates strict snapshots/references and recomputes comparison keys without changing old data', async () => {
  const original = run('pll', 2), r = repo(); await r.saveSession(session('pll')); await r.saveRun(original, (await r.read()).revision); const before = await r.read();
  const variants: RunRecord[] = [];
  function forged(change: (run: RunRecord) => void) { const copy = structuredClone(original); change(copy); variants.push(copy); }
  forged((r) => { r.comparisonKey = 'trusted-import'; }); forged((r) => { r.setSnapshot.caseIds.push(r.setSnapshot.caseIds[0] ?? ''); }); forged((r) => { r.repPlan.reverse(); }); forged((r) => { r.sessionId = session().id; }); forged((r) => { r.cursor = 1; }); forged((r) => { r.status = 'complete'; });
  forged((r) => { const c = r.snapshot?.challenges[0]; if (c) c.epoch++; }); forged((r) => { const c = r.snapshot?.challenges[0]; if (c && c.options.trainer !== 'cross' && c.options.trainer !== 'cross1' && c.options.trainer !== 'cross2' && c.options.trainer !== 'f2l') c.options.yaw = 1; });
  forged((r) => { if (r.snapshot) r.snapshot.guidance[0]?.moves.push(...auf(1)); }); forged((r) => { if (r.snapshot) r.snapshot.versions.dataset = 'future'; }); forged((r) => { Object.assign(r, { extra: true }); });
  for (const value of variants) await expect(r.replace(backup([value]), before.revision)).rejects.toThrow(); expect((await r.read()).revision).toBe(before.revision);
  const active = { ...original, presented: true }, attempt = timed(active), complete = closeRep(active, attempt);
  await expect(decodeBackup(backup([complete], [{ ...attempt, repIndex: 1 }]), validator)).rejects.toThrow();
  await expect(decodeBackup(backup([], [attempt]), validator)).rejects.toThrow();
  expect(recoverRun(original).presented).toBe(false);
});
it('comparison separates subset/trainer/frame/mode/angle/guidance policies and set edits cannot rewrite history', async () => {
  const original = run('oll', 2), reordered = structuredClone(original); reordered.setSnapshot.caseIds.reverse(); reordered.snapshot?.guidance.reverse();
  expect(runComparisonKey(reordered)).toBe(runComparisonKey(original));
  for (const different of [run('oll', 1), run('pll', 2), run('oll', 2, [override(original.repPlan[0]?.caseId ?? '')])]) expect(runComparisonKey(different)).not.toBe(runComparisonKey(original));
  const r = repo(); await r.saveSession(session()); await r.savePracticeSet(original.setSnapshot, original.setSnapshot.id, (await r.read()).revision); await r.saveRun(original, (await r.read()).revision);
  await r.savePracticeSet({ ...original.setSnapshot, caseIds: original.setSnapshot.caseIds.slice(0, 1) }, original.setSnapshot.id, (await r.read()).revision); await r.savePracticeSet(null, original.setSnapshot.id, (await r.read()).revision);
  expect((await r.read()).backup.runs[0]?.setSnapshot).toEqual(original.setSnapshot); expect(compatibleRunPB(original, [original], [])).toBeNull();
});
