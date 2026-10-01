import { beforeAll, expect, it } from 'vitest';
import { loadEngine } from '../../src/cube/engine';
import { CrossTable } from '../../src/cross/table';
import { OneModel, ONE_VERSIONS } from '../../src/cross-one/model';
import { generateOne } from '../../src/cross-one/generate';
import { WorkBudget } from '../../src/cross-one/search';
import { validateOneAttempt } from '../../src/cross-one/validation';
import { crossValidator } from '../../src/cross/validation';
import { Repository } from '../../src/store/repository';
import { decodeBackup } from '../../src/store/validation';
import { freezeSnapshot, TimerController } from '../../src/timer/controller';
import { attemptStatistics, comparisonKey } from '../../src/statistics/attempts';
import type { AttemptRecord, SemanticValidator, TrainerBackupV1 } from '../../src/store/records';
import { oracleCross, oraclePair, oracleReplay, oracleSolved } from '../helpers/cross-one-oracle';

let model: OneModel, record: AttemptRecord, validator: SemanticValidator, backup: TrainerBackupV1;
beforeAll(async () => {
  const engine = await loadEngine(), cross = new CrossTable(engine); await cross.build(() => {}, () => {});
  model = new OneModel(engine, cross); await model.initialize(() => {});
  const result = await generateOne({ kind: 'generate', protocol: 1, requestId: 'storage', epoch: 1, workerInstance: 'real', versions: ONE_VERSIONS, frame: engine.frame('red'), options: { trainer: 'cross1', K: 3, L: 8, pair: { kind: 'any' } }, seed: 'storage', budget: { timeMs: 5000, maxNodes: 10000 } }, model, new WorkBudget(5000, 10000));
  record = freezeSnapshot({ id: 'one', sessionId: 'one-session', trainer: 'cross1', challenge: result.challenge, presentedAt: '2026-10-01T00:00:00.000Z', endedAt: '2026-10-01T00:01:00.000Z', settingsSnapshot: { inspectionMode: '15s', audibleWarnings: false }, preparationMs: 20000, timing: { status: 'completed', inspectionMs: 15000, executionMs: 1234 }, penalty: { kind: 'none', source: 'none' } });
  validator = { validateAttempt: async (value) => validateOneAttempt(value, engine, model), validateTrainingData: crossValidator(engine, cross).validateTrainingData };
  backup = { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: '2026-10-01T00:01:00.000Z', settings: [], sessions: [{ id: 'one-session', trainer: 'cross1', label: 'Actual Cross+1', createdAt: '2026-10-01T00:00:00.000Z' }], attempts: [record], personalAlgorithms: [], practiceSets: [], runs: [] };
}, 60000);
it('persists real full-state-verified Cross+1, backs up and atomically restores without mutating frozen input', async () => {
  const c = record.challenge; if (c.proof.kind !== 'combined-bound') throw new Error('Wrong fixture');
  expect(oracleReplay(oracleSolved, c.scramble)).toBe(c.start.facelets);
  const final = oracleReplay(c.start.facelets, c.proof.witness);
  expect(oracleCross(final)).toBe(true); expect(c.proof.solvedSlots.every((s) => oraclePair(final, s))).toBe(true);
  const repository = new Repository('one-storage', undefined, validator);
  const session = backup.sessions[0]; if (!session) throw new Error('Missing session');
  await repository.saveSession(session); await repository.saveAttempt(record);
  const saved = await repository.read(); expect(saved.backup.attempts).toEqual([record]);
  await repository.replace(saved.backup, saved.revision); expect((await repository.read()).backup.attempts).toEqual([record]);
  expect(Object.isFrozen(record.challenge.proof)).toBe(true); await repository.close();
});
it.each(['state', 'frame', 'version', 'K', 'L', 'witness', 'slots', 'date', 'timing', 'unsupported', 'cross2'] as const)('rejects forged %s before replacement', async (field) => {
  const forged = structuredClone(record), c = forged.challenge;
  if (c.proof.kind !== 'combined-bound' || c.options.trainer !== 'cross1') throw new Error('Wrong fixture');
  if (field === 'state') c.start.facelets = oracleSolved;
  if (field === 'frame') c.frame.colorOfFace = { ...c.frame.colorOfFace, F: 'red' };
  if (field === 'version') c.versions.tables = 'wrong';
  if (field === 'K') { c.options.K = 1; c.proof.crossDepth = 8; }
  if (field === 'L') c.options.L = 13;
  if (field === 'witness') c.proof.witness = [];
  if (field === 'slots') c.proof.solvedSlots = [];
  if (field === 'date') forged.endedAt = 'not-a-date';
  if (field === 'timing') forged.timing.inspectionMs = 20001;
  if (field === 'unsupported') Object.assign(forged, { selfReport: { executedSlots: ['FR'] } });
  if (field === 'cross2') forged.trainer = 'cross2';
  await expect(decodeBackup({ ...backup, attempts: [forged] }, validator)).rejects.toThrow();
});
it.each([['none', 14999, true], ['none', 15000, true], ['none', 15001, false], ['plus2', 14999, false], ['plus2', 15000, true], ['plus2', 17000, true], ['plus2', 17001, false], ['dnf', 16999, false], ['dnf', 17000, true]] as const)('preserves rounded boundary %s at %i', async (kind, inspectionMs, valid) => {
  const value = { ...record, timing: { ...record.timing, inspectionMs }, penalty: { kind, source: kind === 'none' ? 'none' : 'inspection' } };
  if (valid) expect(await validator.validateAttempt(value)).toMatchObject({ penalty: value.penalty });
  else await expect(validator.validateAttempt(value)).rejects.toThrow();
});
it.each([14999.6, 15000, 16999.6, 17000])('times a real immutable Cross+1 at the unrounded %f boundary', async (boundary) => {
  let now = 0;
  const clock = { now: () => now, date: () => new Date(Date.UTC(2026, 9, 1) + now).toISOString(), id: () => `boundary-${boundary}` };
  const controller = new TimerController({ saveAttempt: async (value) => { await validator.validateAttempt(value); } }, clock, () => true);
  const challenge = structuredClone(record.challenge), settings = { inspectionMode: '15s' as const, audibleWarnings: false };
  const session = backup.sessions[0]; if (!session) throw new Error('Missing session');
  expect(controller.present({ challenge, settings, session })).toBe(true);
  now = 1000; controller.press('space'); controller.release('space');
  expect(controller.getSnapshot().phase).toBe('inspection');
  Object.assign(challenge.options, { K: 1, L: 1, pair: { kind: 'slot', slot: 'BL' } }); settings.audibleWarnings = true;
  now = 1000 + boundary - 300; controller.press('space'); now = 1000 + boundary; controller.release('space');
  expect(controller.getSnapshot().phase).toBe('execution'); now += 500; controller.press('space');
  const stopped = controller.getSnapshot().record; if (!stopped) throw new Error('No stopped record');
  expect(stopped.challenge).toEqual(record.challenge); expect(stopped.settingsSnapshot.audibleWarnings).toBe(false);
  expect(stopped.penalty.kind).toBe(boundary >= 17000 ? 'dnf' : boundary >= 15000 ? 'plus2' : 'none'); expect(stopped.timing.inspectionMs).toBe(Math.round(boundary));
  expect(Object.isFrozen(stopped.challenge.options)).toBe(true); expect(controller.canPresent).toBe(false);
  await validator.validateAttempt(stopped);
});
it('keeps unsupported training groups closed and comparison scopes based on actual metadata', async () => {
  for (const group of ['personalAlgorithms', 'practiceSets', 'runs']) await expect(decodeBackup({ ...backup, [group]: [{}] }, validator)).rejects.toThrow();
  const changed = structuredClone(record); if (changed.challenge.options.trainer !== 'cross1') throw new Error('Wrong fixture'); changed.challenge.options.L = 12;
  expect(comparisonKey(changed)).not.toBe(comparisonKey(record));
  expect(attemptStatistics([record, changed])).toMatchObject({ total: 2, comparable: false, execution: null });
  expect(record.selfReport).toBeUndefined();
});
