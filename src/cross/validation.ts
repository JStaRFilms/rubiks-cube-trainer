import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { decodeGoalOptions, boundedInput, DataError, integer, object, text } from '../store/validation';
import { attemptFields, decodeAttemptTiming } from '../store/attempt-timing';
import type { AttemptRecord, Challenge, CrossDepth, Move, SemanticValidator } from '../store/records';
import { CROSS_VERSIONS, OUTER_MOVES, type CrossTable } from './table';

function exact(input: unknown, fields: string[]): Record<string, unknown> {
  const value = object(input);
  if (Object.keys(value).length !== fields.length || fields.some((key) => !(key in value))) throw new DataError('Missing or unsupported Cross fields.');
  return value;
}
function moves(input: unknown): Move[] {
  if (!Array.isArray(input) || input.length > 10000) throw new DataError('Invalid Cross move list.');
  return input.map((item: unknown) => {
    const v = exact(item, ['family', 'amount']);
    const move = OUTER_MOVES.find((m) => m.family === v.family && m.amount === v.amount);
    if (!move) throw new DataError('Cross proofs and scrambles use only 18 outer turns, HTM.');
    return { ...move };
  });
}
export function validateChallenge(input: unknown, engine: CubeEngine, table: CrossTable): Extract<Challenge, { options: { trainer: 'cross' } }> {
  boundedInput(input);
  const v = exact(input, ['challengeId', 'requestId', 'epoch', 'versions', 'frame', 'scramble', 'start', 'options', 'proof']);
  exact(v.versions, ['contract', 'engine', 'dataset', 'tables']);
  const versions = decodeVersions(v.versions);
  if (JSON.stringify(versions) !== JSON.stringify(CROSS_VERSIONS)) throw new DataError('Unsupported Cross engine/table/HTM/frame identity.');
  exact(v.frame, ['crossColor', 'colorOfFace']);
  const frame = decodeFrame(v.frame, engine), options = decodeGoalOptions(v.options);
  if (options.trainer !== 'cross') throw new DataError('Only Cross is supported.');
  const proof = exact(v.proof, ['kind', 'depth', 'solution']);
  if (proof.kind !== 'cross-optimal') throw new DataError('Only optimal Cross proofs are supported.');
  const depth = integer(proof.depth, 1, options.K) as CrossDepth, solution = moves(proof.solution), scramble = moves(v.scramble);
  const startValue = exact(v.start, ['format', 'facelets']); engine.fromState(startValue);
  const start = { format: SOLVED.format, facelets: text(startValue.facelets) };
  if (engine.centerKey(start) !== engine.centerKey(SOLVED) || engine.apply(SOLVED, scramble).facelets !== start.facelets) throw new DataError('Cross scramble does not match its legal starting state/frame.');
  if (table.distances[table.coordinate(engine, start)] !== depth || solution.length !== depth || !engine.crossSolved(engine.apply(start, solution))) throw new DataError('Cross depth or optimal reveal is invalid.');
  return { challengeId: text(v.challengeId), requestId: text(v.requestId), epoch: integer(v.epoch), versions, frame, scramble, start, options, proof: { kind: 'cross-optimal', depth, solution } };
}
export function crossValidator(engine: CubeEngine, table: CrossTable): SemanticValidator {
  return {
    async validateAttempt(input): Promise<AttemptRecord> {
      const v = attemptFields(input);
      if (v.trainer !== 'cross') throw new DataError('Only Cross attempts are supported.');
      return { ...decodeAttemptTiming(v), trainer: 'cross', challenge: validateChallenge(v.challenge, engine, table) };
    },
    async validateTrainingData(data) {
      if (Object.values(data).some((records) => records.length)) throw new DataError('Cases, algorithms, sets and runs require an unavailable compatible dataset validator.');
      return { personalAlgorithms: [], practiceSets: [], runs: [] };
    },
  };
}
