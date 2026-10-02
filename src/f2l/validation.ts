import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeMoves } from '../cube/notation';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { caseIdentity, isolatedContext, QUARTERS } from '../cases/identity';
import { presentCase, validatePresentedF2LGuidance } from '../cases/validation';
import { validateOverrideImport } from '../cases/overrides';
import { F2L_CASES } from '../data/f2l';
import { attemptFields, decodeAttemptTiming } from '../store/attempt-timing';
import type { AttemptRecord, SemanticValidator } from '../store/records';
import { boundedInput, decodeGoalOptions, integer, object, text } from '../store/validation';
import { f2lEntry, F2L_VERSIONS, type F2LChallenge } from './model';

function exact(input: unknown, fields: string[]): Record<string, unknown> {
  const value = object(input);
  if (Object.keys(value).length !== fields.length || fields.some((key) => !(key in value))) throw Error('Missing or unsupported F2L fields.');
  return value;
}
function moves(input: unknown) {
  if (!Array.isArray(input)) throw Error('Expected F2L move list.');
  input.forEach((item: unknown) => exact(item, ['family', 'amount']));
  return decodeMoves(input);
}
export function validateF2L(input: unknown, engine: CubeEngine): F2LChallenge {
  boundedInput(input);
  const value = exact(input, ['challengeId', 'requestId', 'epoch', 'versions', 'frame', 'scramble', 'start', 'options', 'proof']);
  exact(value.versions, ['contract', 'engine', 'dataset', 'tables']); exact(value.frame, ['crossColor', 'colorOfFace']);
  const versions = decodeVersions(value.versions), frame = decodeFrame(value.frame, engine), options = decodeGoalOptions(value.options);
  if (options.trainer !== 'f2l' || versions.contract !== F2L_VERSIONS.contract || versions.engine !== F2L_VERSIONS.engine || versions.dataset !== F2L_VERSIONS.dataset || versions.tables !== F2L_VERSIONS.tables) throw Error('Unsupported F2L trainer or versions.');
  const entry = f2lEntry(options.caseId), stateValue = exact(value.start, ['format', 'facelets']);
  engine.fromState(stateValue);
  const start = { format: SOLVED.format, facelets: text(stateValue.facelets) }, scramble = moves(value.scramble);
  const proof = exact(value.proof, ['kind', 'caseId', 'identityKey', 'setup', 'solution', 'finalAuf', 'representative']);
  const setup = moves(proof.setup), solution = moves(proof.solution);
  if (proof.kind !== 'case' || proof.caseId !== entry.id || proof.identityKey !== entry.identityKey || proof.finalAuf !== 0 || proof.representative !== true) throw Error('F2L proof identity or representative policy mismatch.');
  if (JSON.stringify(setup) !== JSON.stringify(scramble) || !QUARTERS.some((preAuf) => JSON.stringify(presentCase(engine, entry, { preAuf, slot: options.slot, yaw: 0 }).setup) === JSON.stringify(setup))) throw Error('F2L setup must be the sourced canonical slot/pre-U setup.');
  if (engine.apply(SOLVED, scramble).facelets !== start.facelets || !isolatedContext(engine, start, options.slot) || caseIdentity(engine, 'f2l', start, options.slot) !== entry.identityKey) throw Error('F2L scramble, actual case or isolated context mismatch.');
  validatePresentedF2LGuidance(engine, start, solution);
  return { challengeId: text(value.challengeId), requestId: text(value.requestId), epoch: integer(value.epoch), versions, frame, options, start, scramble,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup, solution, finalAuf: 0, representative: true } };
}
export function validateF2LAttempt(input: unknown, engine: CubeEngine): AttemptRecord {
  const value = attemptFields(input);
  if (value.trainer !== 'f2l') throw Error('Only F2L attempts are supported.');
  return { ...decodeAttemptTiming(value), trainer: 'f2l', challenge: validateF2L(value.challenge, engine) };
}
export function validateF2LTraining(engine: CubeEngine, data: Parameters<SemanticValidator['validateTrainingData']>[0]) {
  if (data.practiceSets.length || data.runs.length) throw Error('Practice sets and runs are not supported until compatible Time Attack integration.');
  return { personalAlgorithms: validateOverrideImport(engine, F2L_CASES, data.personalAlgorithms), practiceSets: [], runs: [] };
}
