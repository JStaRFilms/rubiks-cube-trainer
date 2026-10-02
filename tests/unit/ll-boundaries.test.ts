import { beforeAll, expect, it } from 'vitest';
import { loadEngine, type CubeEngine } from '../../src/cube/engine';
import { createRun, closeRep, validateLLTraining, runComparisonKey } from '../../src/ll/runs';
import { validateLLAttempt } from '../../src/ll/validation';
import { defaultLLPreferences } from '../../src/ll/model';
import { OLL_CASES } from '../../src/data/oll';
import { colors, defaultSettings, type AttemptRecord, type RunRecord, type SemanticValidator, type SessionRecord } from '../../src/store/records';
import { decodeBackup, decodeSettings } from '../../src/store/validation';
import { TimerController } from '../../src/timer/controller';
import { runStatistics } from '../../src/statistics/runs';
let engine: CubeEngine, initial: RunRecord, attempt: AttemptRecord, complete: RunRecord;
const session: SessionRecord = { id: 'actual-oll', trainer: 'oll', label: 'Actual OLL', createdAt: '2026-10-01T00:00:00.000Z' };
const validator: SemanticValidator = { validateAttempt: async (v) => validateLLAttempt(v, engine), validateTrainingData: async (data, attempts, sessions) => validateLLTraining(engine, data, attempts, sessions) };
beforeAll(async () => {
  engine = await loadEngine(); const entry = OLL_CASES[0]; if (!entry) throw Error('Missing actual case.'); const now = new Date().toISOString();
  initial = { ...createRun(engine, { id: 'actual-set', trainer: 'oll', label: 'One actual case', caseIds: [entry.id], createdAt: now, updatedAt: now }, session, { mode: 'recognition', shuffle: true, preAuf: 'random', yaw: 'random', settings: { inspectionMode: 'untimed', audibleWarnings: false }, frame: engine.frame('blue') }, []), presented: true };
  const c = initial.snapshot?.challenges[0]; if (!c || !initial.snapshot) throw Error('Missing actual snapshot.');
  attempt = { id: 'actual-attempt', trainer: 'oll', sessionId: session.id, runId: initial.id, repIndex: 0, challenge: c, settingsSnapshot: initial.snapshot.settings, presentedAt: initial.createdAt, endedAt: initial.createdAt, preparationMs: 300, timing: { status: 'completed', executionMs: 0, inspectionMs: null }, penalty: { kind: 'none', source: 'none' } }; complete = closeRep(initial, attempt);
});
function backup(run = complete, record = attempt) { return { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: new Date().toISOString(), settings: [], sessions: [session], attempts: [record], personalAlgorithms: [], practiceSets: [], runs: [run] }; }
it.each(['setup', 'scramble', 'state', 'identity', 'case', 'frame', 'guidance', 'regrip', 'finalAuf', 'representative', 'version', 'extra', 'rep', 'run', 'session', 'timing', 'date', 'trainer'] as const)('rejects actual run/attempt %s forgery before import', async (field) => {
  const forged = structuredClone(attempt), c = forged.challenge; if (c.proof.kind !== 'case' || c.options.trainer !== 'oll') throw Error('Wrong actual fixture.');
  if (field === 'setup') c.proof.setup = []; if (field === 'scramble') c.scramble = []; if (field === 'state') c.start.facelets = 'U'.repeat(54); if (field === 'identity') c.proof.identityKey = 'forged'; if (field === 'case') c.options.caseId = 'oll:speeden-v1:999'; if (field === 'frame') c.frame.colorOfFace = { ...c.frame.colorOfFace, D: 'white' }; if (field === 'guidance') c.proof.solution = []; if (field === 'regrip') c.proof.solution.push({ family: 'x', amount: 1 }); if (field === 'finalAuf') c.proof.finalAuf = 1; if (field === 'representative') c.proof.representative = false; if (field === 'version') c.versions.engine = 'future'; if (field === 'extra') Object.assign(forged, { review: {} }); if (field === 'rep') forged.repIndex = 1; if (field === 'run') forged.runId = 'other'; if (field === 'session') forged.sessionId = 'other'; if (field === 'timing') forged.timing = { status: 'interrupted', phase: 'preparation', reason: 'restart', executionMs: 0, inspectionMs: null }; if (field === 'date') forged.endedAt = 'invalid'; if (field === 'trainer') forged.trainer = 'pll';
  await expect(decodeBackup(backup(complete, forged), validator)).rejects.toThrow();
});
it('rejects malformed sets/overrides, unsupported future trainers, duplicates and absent interruption evidence', async () => {
  for (const group of ['practiceSets', 'personalAlgorithms', 'runs'] as const) await expect(decodeBackup({ ...backup(), [group]: [{}] }, validator)).rejects.toThrow();
  for (const field of ['snapshot', 'presented', 'interruptions'] as const) { const missing = structuredClone(complete); delete missing[field]; await expect(decodeBackup(backup(missing), validator)).rejects.toThrow(); }
  for (const trainer of ['zbll', 'cross2'] as const) await expect(validator.validateAttempt({ ...attempt, trainer })).rejects.toThrow();
  await expect(decodeBackup({ ...backup(), runs: [complete, complete] }, validator)).rejects.toThrow();
  const interrupted = closeRep(initial, { ...attempt, timing: { status: 'interrupted', phase: 'preparation', reason: 'background', executionMs: null, inspectionMs: null } });
  await expect(decodeBackup(backup({ ...interrupted, interruptions: [] }, { ...attempt, timing: { status: 'interrupted', phase: 'preparation', reason: 'background', executionMs: null, inspectionMs: null } }), validator)).rejects.toThrow();
  await expect(decodeBackup(backup({ ...complete, outcomes: [...complete.outcomes, ...complete.outcomes] }), validator)).rejects.toThrow();
});
it('precisely decodes optional separate preferences and preserves old settings', () => {
  expect(decodeSettings(defaultSettings)).toEqual(defaultSettings);
  const settings = { ...defaultSettings, llPractice: { oll: defaultLLPreferences('oll'), pll: defaultLLPreferences('pll') } }; expect(decodeSettings(settings)).toEqual(settings);
  for (const value of [{ ...settings.llPractice.oll, caseIds: [] }, { ...settings.llPractice.oll, caseIds: ['wrong'] }, { ...settings.llPractice.oll, caseIds: ['oll:speeden-v1:001', 'oll:speeden-v1:001'] }, { ...settings.llPractice.oll, preAuf: 4 }, { ...settings.llPractice.oll, yaw: 'mirror' }, { ...settings.llPractice.oll, extra: true }]) expect(() => decodeSettings({ ...settings, llPractice: { oll: value } })).toThrow();
});
it.each([14999.6, 15000, 16999.6, 17000])('strict fractional LL inspection %f uses the actual controller and linked outcome', async (boundary) => {
  let now = Date.parse(initial.createdAt), saved: AttemptRecord | undefined, outcome: RunRecord | undefined;
  const frozen = { ...initial, snapshot: initial.snapshot ? { ...initial.snapshot, settings: { inspectionMode: '15s' as const, audibleWarnings: false } } : undefined };
  frozen.comparisonKey = runComparisonKey(frozen);
  const timer = new TimerController({ saveAttempt: async (record, run) => { saved = validateLLAttempt(record, engine); if (!run) throw Error('Missing linked outcome.'); validateLLTraining(engine, { personalAlgorithms: [], practiceSets: [], runs: [run] }, [saved], [session]); outcome = run; } }, { now: () => now, date: () => new Date(now).toISOString(), id: () => `actual-boundary-${boundary}` }, () => true);
  const challenge = frozen.snapshot?.challenges[0]; if (!challenge || !frozen.snapshot) throw Error('Missing actual challenge.'); timer.present({ challenge, settings: frozen.snapshot.settings, session, run: { id: initial.id, repIndex: 0, outcome: (record) => closeRep(frozen, record) } }); timer.press('space'); timer.release('space'); now += boundary - 300; timer.press('space'); now += 300; timer.release('space'); now += 100; timer.press('space'); await Promise.resolve(); await Promise.resolve();
  expect(timer.getSnapshot()).toMatchObject({ phase: 'saved', error: '' }); expect(saved?.penalty.kind).toBe(boundary >= 17000 ? 'dnf' : boundary >= 15000 ? 'plus2' : 'none'); expect(outcome && saved && runStatistics(outcome, [saved]).eligible).toBe(boundary < 17000);
});
it('comparison includes relevant settings/frame/guidance, not set labels or shuffled actual ordering', () => {
  const key = runComparisonKey(initial), renamed = { ...initial, setSnapshot: { ...initial.setSnapshot, label: 'Renamed later' } }; expect(runComparisonKey(renamed)).toBe(key);
  for (const field of ['mode', 'shuffle', 'preAuf', 'yaw', 'inspection', 'version', 'guidance'] as const) {
    const other = structuredClone(initial); if (!other.snapshot) throw Error('Missing snapshot.');
    if (field === 'mode') other.snapshot.mode = 'execution'; if (field === 'shuffle') other.snapshot.shuffle = false; if (field === 'preAuf') other.snapshot.preAuf = 0; if (field === 'yaw') other.snapshot.yaw = 0; if (field === 'inspection') other.snapshot.settings.inspectionMode = '15s'; if (field === 'version') other.snapshot.versions.dataset = 'future'; if (field === 'guidance') other.snapshot.guidance[0]?.moves.push({ family: 'U', amount: 1 }); expect(runComparisonKey(other)).not.toBe(key);
  }
  for (const color of colors.filter((color) => color !== 'blue')) { const other = structuredClone(initial); if (!other.snapshot) throw Error('Missing snapshot.'); other.snapshot.frame = engine.frame(color); expect(runComparisonKey(other)).not.toBe(key); }
  expect(runStatistics({ ...complete, status: 'abandoned' }, [attempt]).eligible).toBe(false);
});
