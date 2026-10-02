import { beforeAll, expect, it } from 'vitest';
import { ENGINE_VERSION, loadEngine, type CubeEngine } from '../../src/cube/engine';
import { auf, QUARTERS, SLOTS } from '../../src/cases/identity';
import { invertMoves } from '../../src/cube/notation';
import { F2L_CASES } from '../../src/data/f2l';
import { createF2L, initializeF2L, rotateGuidance } from '../../src/f2l/model';
import { validateF2L, validateF2LAttempt, validateF2LTraining } from '../../src/f2l/validation';
import { colors, defaultSettings, type AttemptRecord, type PersonalAlgorithmRecord, type SemanticValidator, type TrainerBackupV1 } from '../../src/store/records';
import { decodeBackup, decodeSettings } from '../../src/store/validation';
import { Repository } from '../../src/store/repository';
import { comparisonKey, attemptStatistics } from '../../src/statistics/attempts';
import { freezeSnapshot, TimerController } from '../../src/timer/controller';
import { geometricConjugate } from '../helpers/cube-geometry';
import { indices, llBases, llOrientations, lowerIndices, normalize, oracleKey, replay, solved } from '../helpers/case-oracle';
let engine: CubeEngine;
const firstCase = F2L_CASES[0]; if (!firstCase) throw Error('Missing real F2L case.');
const first = firstCase;
const session = { id: 'f2l-session', trainer: 'f2l' as const, label: 'Actual F2L', createdAt: '2026-10-01T00:00:00.000Z' };
beforeAll(async () => { engine = await loadEngine(); initializeF2L(engine); });
function algorithm(entry = first, slot: PersonalAlgorithmRecord['slot'] = 'canonical'): PersonalAlgorithmRecord {
  const preAuf = slot === 'canonical' ? 1 : 3;
  return { caseId: entry.id, slot, preAuf, moves: [...invertMoves(auf(preAuf)), ...(slot === 'canonical' ? entry.defaultAlgorithm : rotateGuidance(entry.defaultAlgorithm, slot)), ...auf(1)], updatedAt: session.createdAt,
    identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
}
function challenge() { return createF2L(engine, { requestId: 'actual', epoch: 1, caseId: first.id, slot: 'BL', hint: false, mode: 'recognition', preAuf: 2, frame: engine.frame('red') }); }
function record(): AttemptRecord { return freezeSnapshot({ id: 'real-f2l', sessionId: session.id, trainer: 'f2l', challenge: challenge(), settingsSnapshot: { inspectionMode: 'untimed', audibleWarnings: false }, presentedAt: session.createdAt, endedAt: '2026-10-01T00:01:00.000Z', preparationMs: 2000, timing: { status: 'completed', inspectionMs: null, executionMs: 1234 }, penalty: { kind: 'none', source: 'none' } }); }
const validator: SemanticValidator = { validateAttempt: async (value) => validateF2LAttempt(value, engine), validateTrainingData: async (data) => validateF2LTraining(engine, data) };
function backup(attempts = [record()]): TrainerBackupV1 { return { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: session.createdAt, settings: [], sessions: [session], attempts, personalAlgorithms: [], practiceSets: [], runs: [] }; }
function lowerSolved(state: string) { return lowerIndices.every((index) => state[index] === solved[index]); }
it('generates and independently proves all 3,936 real case/slot/pre-U/six-frame defaults', () => {
  let checked = 0;
  for (const entry of F2L_CASES) for (const slot of SLOTS) for (const preAuf of QUARTERS) for (const color of colors) {
    const result = createF2L(engine, { requestId: `${entry.id}/${slot}/${preAuf}/${color}`, epoch: checked, caseId: entry.id, slot, preAuf, hint: false, mode: 'recognition', frame: engine.frame(color) });
    const expected = replay(geometricConjugate(entry.representative.facelets, { FR: 0, FL: 1, BR: 3, BL: 2 }[slot]), auf(preAuf));
    expect(replay(solved, result.scramble)).toBe(expected); expect(result.start.facelets).toBe(expected);
    const normalized = geometricConjugate(replay(expected, invertMoves(auf(preAuf))), { FR: 0, FL: 3, BR: 1, BL: 2 }[slot]);
    expect(oracleKey('f2l', normalized)).toBe(oracleKey('f2l', entry.representative.facelets));
    const preserved = ['DF', 'DR', 'DB', 'DL', ...SLOTS.filter((other) => other !== slot), ...SLOTS.filter((other) => other !== slot).map((other) => ({ FR: 'DRF', FL: 'DFL', BR: 'DBR', BL: 'DLB' }[other]))];
    expect(preserved.flatMap(indices).every((index) => expected[index] === solved[index])).toBe(true);
    expect(lowerSolved(normalize(replay(expected, result.proof.solution)))).toBe(true);
    expect(validateF2L(result, engine)).toEqual(result); expect(result.frame.crossColor).toBe(color); checked++;
  }
  expect(checked).toBe(41 * 4 * 4 * 6);
}, 120000);
it('independently proves 7,872 canonical/slot overrides against actual presentations and source stability', () => {
  const sourceBefore = JSON.stringify(F2L_CASES); let checked = 0;
  for (const entry of F2L_CASES) for (const slot of SLOTS) for (const preAuf of QUARTERS) for (const color of colors) {
    const request = { requestId: 'override-proof', epoch: checked, caseId: entry.id, slot, preAuf, hint: true, mode: 'execution' as const, frame: engine.frame(color) };
    const canonical = algorithm(entry), specific = algorithm(entry, slot), initial = createF2L(engine, request);
    for (const overrides of [[canonical], [canonical, specific]]) {
      const result = createF2L(engine, request, overrides);
      expect(result.scramble).toEqual(initial.scramble); expect(result.start).toEqual(initial.start); expect(result.proof.identityKey).toBe(initial.proof.identityKey);
      expect(lowerSolved(normalize(replay(result.start.facelets, result.proof.solution)))).toBe(true);
      const chosen = overrides.length === 1 ? canonical : specific;
      const expected = [...invertMoves(auf(preAuf)), ...(chosen.slot === 'canonical' ? rotateGuidance([...auf(chosen.preAuf), ...chosen.moves], slot) : [...auf(chosen.preAuf), ...chosen.moves])];
      expect(result.proof.solution).toEqual(expected); checked++;
    }
  }
  expect(checked).toBe(41 * 4 * 4 * 6 * 2); expect(JSON.stringify(F2L_CASES)).toBe(sourceBefore);
}, 120000);
it('preserves isolated target and solves from an arbitrary oriented/permuted LL base, not just solved', () => {
  const permutations = llBases(), orientations = llOrientations(); let checked = 0;
  for (const entry of F2L_CASES) for (const slot of SLOTS) for (const preAuf of QUARTERS) {
    const result = createF2L(engine, { requestId: 'variable-LL', epoch: checked, caseId: entry.id, slot, preAuf, hint: true, mode: 'execution', frame: engine.frame('white') }, [algorithm(entry, slot)]);
    const permutationBase = permutations[checked % permutations.length], orientationBase = orientations[checked % orientations.length];
    if (!permutationBase || !orientationBase) throw Error('Missing independent LL base.');
    // Copy sticker orientations by each occupying cubie's cyclic orientation from the second base.
    const chars = [...permutationBase];
    for (const name of ['UF', 'UR', 'UB', 'UL', 'UFR', 'URB', 'UBL', 'ULF']) {
      const at = indices(name), labels = at.map((i) => orientationBase[i]);
      const turn = labels.indexOf(name[0]);
      if (turn < 0) throw Error('Bad independent orientation.');
      at.forEach((i, n) => { chars[i] = permutationBase[at[(n - turn + at.length) % at.length] ?? -1] ?? ''; });
    }
    const base = chars.join(''); engine.fromState({ format: 'cube3-facelets-v1', facelets: base });
    const actual = replay(base, result.scramble), canonical = geometricConjugate(actual, { FR: 0, FL: 3, BR: 1, BL: 2 }[slot]);
    expect(oracleKey('f2l', canonical)).toBe(oracleKey('f2l', entry.representative.facelets));
    expect(lowerSolved(normalize(replay(actual, result.proof.solution)))).toBe(true); checked++;
  }
  expect(checked).toBe(656);
}, 30000);
it('persists precise backward-compatible preferences without treating actual-slot GoalOptions as slot policy', () => {
  expect(decodeSettings(defaultSettings)).toEqual(defaultSettings);
  const settings = { ...defaultSettings, defaultTrainer: 'f2l' as const, f2lPractice: { caseIds: [first.id], slotMode: 'random' as const, hint: false, mode: 'recognition' as const, preAuf: 3 as const } };
  expect(decodeSettings(settings)).toEqual(settings);
  for (const invalid of [{ ...settings.f2lPractice, caseIds: [] }, { ...settings.f2lPractice, caseIds: ['wrong'] }, { ...settings.f2lPractice, caseIds: [first.id, first.id] }, { ...settings.f2lPractice, slotMode: 'BL' }, { ...settings.f2lPractice, preAuf: 4 }, { ...settings.f2lPractice, hint: 'true' }, { ...settings.f2lPractice, observedRotation: true }]) expect(() => decodeSettings({ ...settings, f2lPractice: invalid })).toThrow();
});
it('accepts and restores genuine attempts/overrides atomically; reset and override changes leave old review frozen', async () => {
  const repository = new Repository('actual-f2l-storage', undefined, validator), attempt = record();
  await repository.saveSession(session); await repository.saveAttempt(attempt);
  const before = await repository.read(), override = algorithm();
  await repository.savePersonalAlgorithm(override, before.revision);
  const saved = await repository.read(); expect(saved.backup.personalAlgorithms).toEqual([override]); expect(saved.backup.attempts).toEqual([attempt]);
  const wrong = F2L_CASES.find((entry) => entry.identityKey !== first.identityKey); if (!wrong) throw Error('Missing wrong case.');
  await expect(repository.savePersonalAlgorithm({ ...override, moves: [...wrong.defaultAlgorithm] }, saved.revision)).rejects.toThrow();
  expect((await repository.read()).backup.personalAlgorithms).toEqual([override]);
  await expect(repository.savePersonalAlgorithm(override, before.revision)).rejects.toThrow('changed');
  await repository.resetPersonalAlgorithm(first.id, 'canonical', saved.revision);
  const reset = await repository.read(); expect(reset.backup.personalAlgorithms).toEqual([]); expect(reset.backup.attempts).toEqual([attempt]);
  await repository.replace(saved.backup, reset.revision); expect((await repository.read()).backup.attempts).toEqual([attempt]);
  await repository.close(); expect(Object.isFrozen(attempt.challenge.proof)).toBe(true);
});
it.each(['case', 'slot', 'identity', 'setup', 'scramble', 'start', 'illegal', 'context', 'solution', 'dataset', 'policy', 'frame', 'representative', 'finalAuf', 'hint', 'extraMove', 'extraAttempt', 'timing', 'date', 'future'] as const)('rejects forged %s without mutating old storage', async (field) => {
  const attempt = structuredClone(record()), c = attempt.challenge; if (c.options.trainer !== 'f2l' || c.proof.kind !== 'case') throw Error('Wrong actual fixture.');
  if (field === 'case') c.options.caseId = 'f2l:lieberkind-v1:999';
  if (field === 'slot') c.options.slot = 'FR';
  if (field === 'identity') c.proof.identityKey = 'wrong';
  if (field === 'setup') c.proof.setup = [];
  if (field === 'scramble') c.scramble = [];
  if (field === 'start') c.start.facelets = solved;
  if (field === 'illegal') c.start.facelets = 'U'.repeat(54);
  if (field === 'context') { c.scramble.push({ family: 'D', amount: 1 }); c.proof.setup = c.scramble; c.start.facelets = replay(solved, c.scramble); }
  if (field === 'solution') c.proof.solution = [...first.defaultAlgorithm];
  if (field === 'dataset') c.versions.dataset = 'future';
  if (field === 'policy') c.versions.tables = 'future';
  if (field === 'frame') c.frame.colorOfFace = { ...c.frame.colorOfFace, D: 'white' };
  if (field === 'representative') c.proof.representative = false;
  if (field === 'finalAuf') c.proof.finalAuf = 1;
  if (field === 'hint') Object.assign(c.options, { hint: 'true' });
  if (field === 'extraMove') Object.assign(c.proof.solution[0] ?? {}, { observed: true });
  if (field === 'extraAttempt') Object.assign(attempt, { selfReport: { executedSlots: ['BL'] } });
  if (field === 'timing') attempt.preparationMs = -1;
  if (field === 'date') attempt.endedAt = 'wrong';
  if (field === 'future') attempt.trainer = 'oll';
  const repository = new Repository(`f2l-reject-${field}`, undefined, validator);
  await repository.saveSession(session); await repository.saveAttempt(record()); const old = await repository.read();
  await expect(repository.replace({ ...old.backup, attempts: [attempt] }, old.revision)).rejects.toThrow();
  const after = await repository.read(); expect(after.revision).toBe(old.revision); expect(after.backup.attempts).toEqual(old.backup.attempts); await repository.close();
});
it('keeps future trainer groups and algorithms closed; rejects malformed algorithm fields/versions atomically', async () => {
  for (const group of ['practiceSets', 'runs']) await expect(decodeBackup({ ...backup(), [group]: [{}] }, validator)).rejects.toThrow();
  const valid = algorithm();
  for (const invalid of [{ ...valid, caseId: 'oll:speeden-v1:001' }, { ...valid, identityPolicyVersion: 'future' }, { ...valid, validatedDatasetVersion: 'future' }, { ...valid, validatedEngineVersion: 'future' }, { ...valid, preAuf: 4 }, { ...valid, slot: 'unknown' }, { ...valid, extra: true }, { ...valid, moves: [{ family: 'R', amount: 1, extra: true }] }]) await expect(decodeBackup({ ...backup(), personalAlgorithms: [invalid] }, validator)).rejects.toThrow();
});
it.each([14999.6, 15000, 16999.6, 17000])('uses real F2L guidance and shared unrounded inspection boundary %f', async (boundary) => {
  let now = 0;
  const controller = new TimerController({ saveAttempt: async (value) => { validateF2LAttempt(value, engine); } }, { now: () => now, id: () => `f2l-${boundary}`, date: () => new Date(Date.UTC(2026, 9, 1) + now).toISOString() }, () => true);
  controller.present({ challenge: challenge(), session, settings: { inspectionMode: '15s', audibleWarnings: false } });
  now = 1000; controller.press('space'); controller.release('space'); now = 1000 + boundary - 300; controller.press('space'); now = 1000 + boundary; controller.release('space'); now += 1000; controller.press('space');
  const saved = controller.getSnapshot().record; if (!saved) throw Error('Missing actual timed record.');
  expect(saved.penalty.kind).toBe(boundary >= 17000 ? 'dnf' : boundary >= 15000 ? 'plus2' : 'none'); expect(saved.timing.inspectionMs).toBe(Math.round(boundary));
  expect(validateF2LAttempt(saved, engine)).toEqual(saved);
});
it('compares only compatible case/slot/hint/mode/inspection/frame/versions and frozen guidance', () => {
  const base = record();
  for (const field of ['caseId', 'slot', 'hint', 'mode', 'inspection', 'frame', 'version', 'guidance', 'preU'] as const) {
    const different = structuredClone(base); if (different.challenge.options.trainer !== 'f2l' || different.challenge.proof.kind !== 'case') throw Error('Wrong fixture.');
    const options = different.challenge.options;
    if (field === 'caseId') options.caseId = 'f2l:lieberkind-v1:002';
    if (field === 'slot') options.slot = 'FR';
    if (field === 'hint') options.hint = true;
    if (field === 'mode') options.mode = 'execution';
    if (field === 'inspection') different.settingsSnapshot.inspectionMode = '15s';
    if (field === 'frame') different.challenge.frame = engine.frame('white');
    if (field === 'version') different.challenge.versions.dataset = 'future';
    if (field === 'guidance') different.challenge.proof.solution.push(...auf(1));
    if (field === 'preU') different.challenge.proof.setup.push(...auf(1));
    expect(comparisonKey(different)).not.toBe(comparisonKey(base)); expect(attemptStatistics([base, different])).toMatchObject({ comparable: false, execution: null });
  }
  expect(base.selfReport).toBeUndefined(); expect(base.challenge.options).toMatchObject({ hint: false, slot: 'BL' });
});
