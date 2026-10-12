import { beforeAll, expect, it } from 'vitest';
import { ENGINE_VERSION, loadEngine, type CubeEngine } from '../../src/cube/engine';
import { auf, QUARTERS } from '../../src/cases/identity';
import { ZBLL_CASES, ZBLL_MANIFEST } from '../../src/data/zbll';
import { F2L_CASES, OLL_CASES, PLL_CASES } from '../../src/data';
import type { CaseEntry } from '../../src/data/types';
import { createZBLL, defaultZBLLPreferences, initializeZBLL, type ZBLLChallenge } from '../../src/zbll/model';
import { validateZBLL, validateZBLLAttempt } from '../../src/zbll/validation';
import { createF2L } from '../../src/f2l/model';
import { validateF2LAttempt } from '../../src/f2l/validation';
import { createRun, closeRep, validateLLTraining } from '../../src/ll/runs';
import { validateLLAttempt } from '../../src/ll/validation';
import { colors, defaultSettings, type AttemptRecord, type PersonalAlgorithmRecord, type SemanticValidator, type TrainerBackupV1 } from '../../src/store/records';
import { decodeBackup, decodeSettings, object } from '../../src/store/validation';
import { Repository } from '../../src/store/repository';
import { TimerController } from '../../src/timer/controller';
import { comparisonKey, attemptStatistics } from '../../src/statistics/attempts';
import { replay, solved } from '../helpers/case-oracle';
let engine: CubeEngine;
const firstCase = ZBLL_CASES[0]; if (!firstCase) throw Error('Missing actual ZBLL case.');
const first = firstCase;
const session = { id: 'zbll-practice', trainer: 'zbll' as const, label: 'ZBLL practice', createdAt: '2026-10-01T00:00:00.000Z' };
beforeAll(async () => { engine = await loadEngine(); initializeZBLL(engine); }, 30000);
function challenge(entry = first): ZBLLChallenge { return createZBLL(engine, { requestId: 'actual', epoch: 4, caseId: entry.id, preAuf: 2, yaw: 3, frame: engine.frame('red'), selection: { ...defaultZBLLPreferences, mode: 'recognition' } }); }
function algorithm(entry: CaseEntry): PersonalAlgorithmRecord { return { caseId: entry.id, slot: 'canonical', moves: [...entry.defaultAlgorithm, ...auf(1), { family: 'x', amount: 1 }], preAuf: 0, updatedAt: session.createdAt, identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION }; }
function record(entry = first): AttemptRecord & { challenge: ZBLLChallenge } { return { id: 'actual-zbll', sessionId: session.id, trainer: 'zbll', challenge: challenge(entry), settingsSnapshot: { inspectionMode: 'untimed', audibleWarnings: false }, presentedAt: session.createdAt, endedAt: session.createdAt, preparationMs: 400, timing: { status: 'completed', executionMs: 1234, inspectionMs: null }, penalty: { kind: 'none', source: 'none' } }; }
const validator: SemanticValidator = { validateAttempt: async (value) => object(value).trainer === 'zbll' ? validateZBLLAttempt(value, engine) : object(value).trainer === 'f2l' ? validateF2LAttempt(value, engine) : validateLLAttempt(value, engine), validateTrainingData: async (data, attempts, sessions) => validateLLTraining(engine, data, attempts, sessions) };
function backup(attempt = record()): TrainerBackupV1 { return { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: session.createdAt, settings: [], sessions: [session], attempts: [attempt], personalAlgorithms: [], practiceSets: [], runs: [] }; }
it('round-trips all 493 canonical memberships and every sourced group at all 16 angles across six frames', () => {
  let checked = 0;
  const representatives = [...new Map(ZBLL_MANIFEST.membership.map((m) => [`${m.family}/${m.subset}`, m.caseId])).values()]; expect(representatives).toHaveLength(43);
  for (const entry of ZBLL_CASES) {
    const c = challenge(entry); expect(validateZBLL(c, engine)).toEqual(c); expect(c.proof.membership.datasetVersion).toBe(entry.datasetVersion); expect(c.proof.membership.identityPolicyVersion).toBe(entry.identityPolicyVersion); checked++;
  }
  for (const id of representatives) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) {
    const color = colors[checked % colors.length]; if (!color) throw Error('Missing frame.');
    const c = createZBLL(engine, { requestId: `${id}/${preAuf}/${yaw}`, epoch: checked, caseId: id, preAuf, yaw, frame: engine.frame(color), selection: { ...defaultZBLLPreferences, caseIds: [id], preAuf, yaw } });
    expect(validateZBLL(c, engine)).toEqual(c); expect(replay(solved, c.scramble)).toBe(c.start.facelets); expect(replay(c.start.facelets, [...c.proof.solution, ...auf(c.proof.finalAuf)])).toBe(solved); checked++;
  }
  expect(checked).toBe(1181);
}, 120000);
it('strict preferences preserve old version-1 settings and reject alias keys, empty pools and unknown fields', () => {
  expect(decodeSettings(defaultSettings)).toEqual(defaultSettings); expect(decodeSettings({ ...defaultSettings, zbllPractice: defaultZBLLPreferences }).zbllPractice).toEqual(defaultZBLLPreferences);
  for (const prefs of [{ ...defaultZBLLPreferences, caseIds: [] }, { ...defaultZBLLPreferences, caseIds: [first.id, first.id] }, { ...defaultZBLLPreferences, caseIds: ['zbll:pll:t'] }, { ...defaultZBLLPreferences, preAuf: 4 }, { ...defaultZBLLPreferences, yaw: 'mirror' }, { ...defaultZBLLPreferences, shuffle: 'true' }, { ...defaultZBLLPreferences, setId: 'unimplemented' }]) expect(() => decodeSettings({ ...defaultSettings, zbllPractice: prefs })).toThrow();
});
it.each(['setup', 'scramble', 'state', 'identity', 'case', 'alias', 'frame', 'solution', 'regrip', 'AUF', 'representative', 'version', 'entryVersion', 'entryPolicy', 'family', 'subset', 'source', 'reference', 'selection', 'mode', 'angle', 'extraProof', 'extraMove', 'run', 'timing', 'comparison'] as const)('rejects warm-import %s forgery atomically', async (field) => {
  const repository = new Repository(`zbll-forgery-${field}`, undefined, validator), actual = record(); await repository.saveSession(session); await repository.saveAttempt(actual); const before = await repository.read();
  const forged = structuredClone(actual), c = forged.challenge;
  if (field === 'setup') c.proof.setup = []; if (field === 'scramble') c.scramble = []; if (field === 'state') c.start.facelets = solved; if (field === 'identity') c.proof.identityKey = 'forged'; if (field === 'case') c.options.caseId = 'unknown'; if (field === 'alias') c.options.caseId = 'zbll:pll:t'; if (field === 'frame') c.frame.colorOfFace = { ...c.frame.colorOfFace, D: 'blue' }; if (field === 'solution') c.proof.solution = []; if (field === 'regrip') c.proof.solution.push({ family: 'x', amount: 1 }); if (field === 'AUF') c.proof.finalAuf = 1; if (field === 'representative') c.proof.representative = true; if (field === 'version') c.versions.dataset = 'future'; if (field === 'entryVersion') c.proof.membership.datasetVersion = 'future'; if (field === 'entryPolicy') c.proof.membership.identityPolicyVersion = 'future'; if (field === 'family') c.proof.membership.family = 'PLL'; if (field === 'subset') c.proof.membership.subset = 'unknown'; if (field === 'source') c.proof.membership.sourceLabel = 'fake'; if (field === 'reference') c.proof.membership.referenceLabel = 'fake'; if (field === 'selection') c.options.selection.caseIds = [PLL_CASES[0]?.id ?? '']; if (field === 'mode') c.options.selection.mode = 'execution'; if (field === 'angle') c.options.selection.preAuf = 0; if (field === 'extraProof') Object.assign(c.proof, { mastery: true }); if (field === 'extraMove') Object.assign(c.proof.solution[0] ?? {}, { observed: true }); if (field === 'run') Object.assign(forged, { runId: 'fake', repIndex: 0 }); if (field === 'timing') forged.preparationMs = -1; if (field === 'comparison') Object.assign(forged, { comparisonKey: 'invented' });
  await expect(repository.replace({ ...before.backup, attempts: [forged] }, before.revision)).rejects.toThrow(); const after = await repository.read(); expect(after.revision).toBe(before.revision); expect(after.backup.attempts).toEqual(before.backup.attempts); await repository.close();
});
it('shares canonical PLL overrides, keeps frozen review and preserves mixed guidance in both directions', async () => {
  const pll = PLL_CASES[0], oll = OLL_CASES[0], f2l = F2L_CASES[0]; if (!pll || !oll || !f2l) throw Error('Missing real old cases.');
  const repository = new Repository('zbll-mixed', undefined, validator); await repository.saveSession(session); await repository.saveAttempt(record());
  for (const entry of [first, pll, oll]) { const current = await repository.read(); await repository.savePersonalAlgorithm(algorithm(entry), current.revision); }
  const before = await repository.read(), personal = before.backup.personalAlgorithms;
  const shared = createZBLL(engine, { requestId: 'shared', epoch: 0, caseId: pll.id, preAuf: 0, yaw: 0, frame: engine.frame('white'), selection: defaultZBLLPreferences }, personal.filter((a) => ZBLL_CASES.some((e) => e.id === a.caseId)));
  expect(shared.options.trainer).toBe('zbll'); expect(shared.proof.membership.datasetVersion).toBe('cfop-libraries-v1'); expect(shared.proof.finalAuf).toBe(3); expect(replay(shared.start.facelets, [...shared.proof.solution, ...auf(3)])).toBe(solved);
  for (const trainer of ['oll', 'pll'] as const) {
    const entry = trainer === 'oll' ? oll : pll, now = new Date().toISOString(), runSession = { ...session, id: trainer, trainer };
    const run = createRun(engine, { id: trainer, trainer, label: trainer, caseIds: [entry.id], createdAt: now, updatedAt: now }, runSession, { mode: 'execution', shuffle: true, preAuf: 0, yaw: 0, frame: engine.frame('white'), settings: { inspectionMode: 'untimed', audibleWarnings: false } }, personal);
    expect(run.snapshot.challenges[0]?.proof.solution.length).toBeGreaterThan(0);
    if (trainer === 'pll') expect(run.snapshot.challenges[0]?.proof.finalAuf).toBe(shared.proof.finalAuf);
  }
  const f2lRecord: PersonalAlgorithmRecord = { ...algorithm(f2l), moves: [...f2l.defaultAlgorithm] }; await repository.savePersonalAlgorithm(f2lRecord, before.revision);
  const mixed = await repository.read(); expect(mixed.backup.personalAlgorithms).toHaveLength(4);
  expect(createF2L(engine, { requestId: 'old', epoch: 0, caseId: f2l.id, slot: 'FR', hint: false, mode: 'execution', preAuf: 0, frame: engine.frame('white') }, mixed.backup.personalAlgorithms.filter((a) => a.caseId.startsWith('f2l:'))).proof.solution).toEqual(f2l.defaultAlgorithm);
  expect(validateZBLL(challenge(), engine).options.trainer).toBe('zbll');
  await repository.resetPersonalAlgorithm(pll.id, 'canonical', mixed.revision); const reset = await repository.read(); expect(reset.backup.personalAlgorithms).toHaveLength(3); expect(reset.backup.attempts).toEqual(before.backup.attempts);
  await expect(decodeBackup({ ...backup(), personalAlgorithms: [{ ...algorithm(pll), caseId: 'zbll:pll:aa' }] }, validator)).rejects.toThrow();
  await repository.replace(before.backup, reset.revision); const restored = await repository.read(); expect(restored.backup.personalAlgorithms).toEqual(personal); await repository.close();
});
it('keeps ZBLL set/run and Cross+2 gates closed while accepting genuine old LL runs in a mixed backup', async () => {
  const oll = OLL_CASES[0]; if (!oll) throw Error('Missing OLL.'); const now = new Date().toISOString(), oldSession = { ...session, id: 'old-oll', trainer: 'oll' as const };
  const initial = { ...createRun(engine, { id: 'oll', trainer: 'oll', label: 'OLL', caseIds: [oll.id], createdAt: now, updatedAt: now }, oldSession, { mode: 'execution', shuffle: false, preAuf: 0, yaw: 0, frame: engine.frame('white'), settings: { inspectionMode: 'untimed', audibleWarnings: false } }, [algorithm(first)]), presented: true };
  const c = initial.snapshot.challenges[0]; if (!c) throw Error('Missing old challenge.');
  const old: AttemptRecord = { ...record(), id: 'old', sessionId: oldSession.id, trainer: 'oll', challenge: c, runId: initial.id, repIndex: 0, presentedAt: initial.createdAt, endedAt: initial.createdAt };
  const mixed = { ...backup(), sessions: [session, oldSession], attempts: [record(), old], runs: [closeRep(initial, old)], personalAlgorithms: [algorithm(first)] };
  expect((await decodeBackup(mixed, validator)).attempts).toHaveLength(2);
  await expect(decodeBackup({ ...mixed, practiceSets: [{ ...initial.setSnapshot, trainer: 'zbll' }] }, validator)).rejects.toThrow();
  await expect(decodeBackup({ ...mixed, runs: [{ ...initial, setSnapshot: { ...initial.setSnapshot, trainer: 'zbll' } }] }, validator)).rejects.toThrow();
  await expect(validator.validateAttempt({ ...record(), trainer: 'cross2' })).rejects.toThrow();
});
it.each([14999.6, 15000, 16999.6, 17000])('uses genuine immutable guidance at inspection boundary %f and shared history Undo', async (boundary) => {
  const repository = new Repository(`zbll-timing-${boundary}`, undefined, validator); await repository.saveSession(session);
  let now = 0; const timer = new TimerController(repository, { now: () => now, id: () => 'actual-timer', date: () => session.createdAt }, () => true);
  const c = challenge(); timer.present({ challenge: c, session, settings: { inspectionMode: '15s', audibleWarnings: false } }); c.proof.solution = [];
  timer.press('space'); timer.release('space'); now = boundary - 300; timer.press('space'); now = boundary; timer.release('space'); now += 100; timer.press('space');
  await new Promise<void>((resolve) => { const unsubscribe = timer.subscribe(() => { if (timer.getSnapshot().phase === 'saved') { unsubscribe(); resolve(); } }); });
  expect(timer.getSnapshot().record?.penalty.kind).toBe(boundary >= 17000 ? 'dnf' : boundary >= 15000 ? 'plus2' : 'none');
  const saved = await repository.read(); expect(saved.backup.attempts[0]?.challenge.proof.kind === 'case' && saved.backup.attempts[0].challenge.proof.solution.length).toBeGreaterThan(0);
  const edit = await repository.editAttempt('actual-timer', 'dnf', saved.revision); await repository.undoAttempt(edit);
  const current = await repository.read(), deletion = await repository.deleteAttempt('actual-timer', current.revision); await repository.undoAttempt(deletion); expect((await repository.read()).backup.attempts).toEqual(saved.backup.attempts); await repository.close();
});
it('separates declaration/mode/angle/frame/inspection/guidance and reports failures without successful-time inflation', () => {
  const base = record(), key = comparisonKey(base);
  for (const field of ['pool', 'shuffle', 'policy', 'mode', 'angle', 'frame', 'inspection', 'guidance', 'entryVersion'] as const) {
    const other = structuredClone(base);
    if (field === 'pool') other.challenge.options.selection.caseIds = [first.id]; if (field === 'shuffle') other.challenge.options.selection.shuffle = false; if (field === 'policy') other.challenge.options.selection.preAuf = 2; if (field === 'mode') other.challenge.options.mode = 'execution'; if (field === 'angle') other.challenge.options.yaw = 0; if (field === 'frame') other.challenge.frame = engine.frame('blue'); if (field === 'inspection') other.settingsSnapshot.inspectionMode = '15s'; if (field === 'guidance') other.challenge.proof.solution.push(...auf(1)); if (field === 'entryVersion') other.challenge.proof.membership.datasetVersion = 'future';
    expect(comparisonKey(other)).not.toBe(key); expect(attemptStatistics([base, other]).execution).toBeNull();
  }
  const dnf = { ...base, penalty: { kind: 'dnf' as const, source: 'manual' as const } }, interrupted = { ...base, timing: { status: 'interrupted' as const, phase: 'preparation' as const, reason: 'background' as const, executionMs: null, inspectionMs: null } };
  expect(attemptStatistics([base, dnf, interrupted])).toMatchObject({ total: 3, successful: 1, dnf: 1, interrupted: 1, execution: { count: 1 }, preparation: { count: 2 } });
});
