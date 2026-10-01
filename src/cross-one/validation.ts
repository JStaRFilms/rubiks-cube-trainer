import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeFrame, decodeVersions } from '../cube/validation';
import type { Challenge, GoalOptions, Move, Slot } from '../store/records';
import { boundedInput, decodeGoalOptions, integer, object, text } from '../store/validation';
import { OUTER_MOVES } from '../cross/table';
import type { GenerateRequest } from '../workers/protocol';
import { ONE_VERSIONS, OneModel, SLOTS } from './model';
import { OneFailure } from './search';

export type OneOptions = Extract<GoalOptions, { trainer: 'cross1' }>;
export type OneChallenge = Extract<Challenge, { proof: { kind: 'combined-bound' } }> & { options: OneOptions };
export const MAX_L = 12;
export function supportedOptions(options: GoalOptions): asserts options is OneOptions {
  if (options.trainer !== 'cross1' || !Number.isInteger(options.K) || options.K < 1 || options.K > 8 || !Number.isInteger(options.L) || options.L < 1 || options.L > MAX_L || (options.pair.kind !== 'any' && (options.pair.kind !== 'slot' || !SLOTS.includes(options.pair.slot)))) throw new OneFailure('unsupported-options', 'Prototype supports Cross+1 K1..8 and L1..12 only. No options were changed.');
}
export function checkRequest(request: GenerateRequest): void {
  supportedOptions(request.options);
  if (JSON.stringify(request.versions) !== JSON.stringify(ONE_VERSIONS)) throw new OneFailure('version-mismatch', 'Cross+1 prototype versions do not match.');
}
function exact(input: unknown, fields: string[]): Record<string, unknown> {
  const v = object(input);
  if (Object.keys(v).length !== fields.length || fields.some((key) => !(key in v))) throw new Error('Missing or unsupported Cross+1 fields.');
  return v;
}
function moves(input: unknown): Move[] {
  if (!Array.isArray(input) || input.length > 10000) throw new Error('Invalid Cross+1 moves.');
  return input.map((item: unknown) => {
    const v = exact(item, ['family', 'amount']), move = OUTER_MOVES.find((m) => m.family === v.family && m.amount === v.amount);
    if (!move) throw new Error('Cross+1 uses outer-turn HTM only.');
    return { ...move };
  });
}
export function validateOne(input: unknown, engine: CubeEngine, model: OneModel): OneChallenge {
  boundedInput(input);
  const v = exact(input, ['challengeId', 'requestId', 'epoch', 'versions', 'frame', 'scramble', 'start', 'options', 'proof']);
  const versions = decodeVersions(v.versions), frame = decodeFrame(v.frame, engine), options = decodeGoalOptions(v.options);
  supportedOptions(options);
  if (JSON.stringify(versions) !== JSON.stringify(ONE_VERSIONS)) throw new Error('Unsupported Cross+1 prototype versions.');
  const startValue = exact(v.start, ['format', 'facelets']); engine.fromState(startValue);
  const start = { format: SOLVED.format, facelets: text(startValue.facelets) }, scramble = moves(v.scramble);
  if (engine.centerKey(start) !== engine.centerKey(SOLVED) || engine.apply(SOLVED, scramble).facelets !== start.facelets) throw new Error('Cross+1 scramble/state/frame mismatch. Fully solved base required.');
  const p = exact(v.proof, ['kind', 'crossDepth', 'cap', 'witness', 'solvedSlots']);
  if (p.kind !== 'combined-bound' || p.cap !== options.L) throw new Error('Cross+1 proof/cap mismatch.');
  const crossDepth = integer(p.crossDepth, 0, options.K), witness = moves(p.witness);
  if (!witness.length || witness.length > options.L || model.cross.distances[model.cross.coordinate(engine, start)] !== crossDepth) throw new Error('Invalid Cross+1 independent depth or witness length.');
  const permitted = options.pair.kind === 'any' ? SLOTS : [options.pair.slot];
  if (engine.crossSolved(start) && permitted.some((slot) => engine.pairSolved(start, slot))) throw new Error('Cross+1 candidate already satisfies the requested goal.');
  const final = engine.apply(start, witness), actual = SLOTS.filter((slot) => engine.pairSolved(final, slot));
  if (!engine.crossSolved(final) || !permitted.some((slot) => actual.includes(slot)) || !Array.isArray(p.solvedSlots) || JSON.stringify(p.solvedSlots) !== JSON.stringify(actual)) throw new Error('Cross+1 full-state final goal or slots are invalid.');
  return { challengeId: text(v.challengeId), requestId: text(v.requestId), epoch: integer(v.epoch), versions, frame, options, scramble, start,
    proof: { kind: 'combined-bound', cap: options.L, crossDepth, witness, solvedSlots: actual } };
}
export function verifyWitnessSlot(challenge: OneChallenge, slot: Slot): void {
  if (!challenge.proof.solvedSlots.includes(slot) || (challenge.options.pair.kind === 'slot' && challenge.options.pair.slot !== slot)) throw new Error('Cross+1 witness slot does not match the requested goal.');
}
