import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeMoves } from '../cube/notation';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { caseIdentity, f2lSolved, oriented } from '../cases/identity';
import { presentCase, validatePresentedLLGuidance } from '../cases/validation';
import { decodeAttemptTiming } from '../store/attempt-timing';
import type { AttemptRecord } from '../store/records';
import { boundedInput, decodeGoalOptions, integer, object, text } from '../store/validation';
import { llEntry, LL_VERSIONS, type LLChallenge } from './model';
export function exact(input: unknown, fields: string[], optional: string[] = []): Record<string, unknown> {
  const value = object(input);
  if (fields.some((key) => !(key in value)) || Object.keys(value).some((key) => !fields.includes(key) && !optional.includes(key))) throw Error('Missing or unsupported last-layer fields.');
  return value;
}
export function moves(input: unknown) {
  if (!Array.isArray(input)) throw Error('Expected a move list.');
  input.forEach((item: unknown) => exact(item, ['family', 'amount'])); return decodeMoves(input);
}
const validatedChallenges = new WeakMap<CubeEngine, Map<string, LLChallenge>>();
export function validateLL(input: unknown, engine: CubeEngine): LLChallenge {
  boundedInput(input);
  const key = JSON.stringify(input);
  let cache = validatedChallenges.get(engine);
  if (!cache) { cache = new Map(); validatedChallenges.set(engine, cache); }
  const cached = cache.get(key);
  if (cached) return structuredClone(cached);
  const value = exact(input, ['challengeId', 'requestId', 'epoch', 'versions', 'frame', 'scramble', 'start', 'options', 'proof']);
  exact(value.versions, ['contract', 'engine', 'dataset', 'tables']); exact(value.frame, ['crossColor', 'colorOfFace']);
  const versions = decodeVersions(value.versions), frame = decodeFrame(value.frame, engine), options = decodeGoalOptions(value.options);
  if ((options.trainer !== 'oll' && options.trainer !== 'pll') || versions.contract !== LL_VERSIONS.contract || versions.engine !== LL_VERSIONS.engine || versions.dataset !== LL_VERSIONS.dataset || versions.tables !== LL_VERSIONS.tables) throw Error('Unsupported last-layer trainer or versions.');
  const entry = llEntry(options.trainer, options.caseId), state = exact(value.start, ['format', 'facelets']); engine.fromState(state);
  const start = { format: SOLVED.format, facelets: text(state.facelets) }, scramble = moves(value.scramble);
  const proof = exact(value.proof, ['kind', 'caseId', 'identityKey', 'setup', 'solution', 'finalAuf', 'representative']), setup = moves(proof.setup), solution = moves(proof.solution);
  if (proof.kind !== 'case' || proof.caseId !== entry.id || proof.identityKey !== entry.identityKey || proof.representative !== (options.trainer === 'oll')) throw Error('Last-layer identity or base policy mismatch.');
  const expected = presentCase(engine, entry, { preAuf: options.preAuf, yaw: options.yaw, slot: 'FR' });
  if (JSON.stringify(setup) !== JSON.stringify(scramble) || JSON.stringify(setup) !== JSON.stringify(expected.setup) || engine.apply(SOLVED, scramble).facelets !== start.facelets || !f2lSolved(engine, start) || (options.trainer === 'pll' && !oriented(engine, start)) || caseIdentity(engine, options.trainer, start) !== entry.identityKey) throw Error('Canonical setup, angle, starting context or intended case mismatch.');
  const finalAuf = validatePresentedLLGuidance(engine, options.trainer, start, solution);
  if (proof.finalAuf !== finalAuf) throw Error('Required final AUF mismatch.');
  const result: LLChallenge = { challengeId: text(value.challengeId), requestId: text(value.requestId), epoch: integer(value.epoch), versions, frame, options: { ...options, trainer: options.trainer }, start, scramble,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup, solution, finalAuf, representative: options.trainer === 'oll' } };
  if (cache.size >= 256) cache.clear();
  cache.set(key, structuredClone(result)); return result;
}
export function validateLLAttempt(input: unknown, engine: CubeEngine): AttemptRecord {
  boundedInput(input);
  const value = exact(input, ['id', 'sessionId', 'trainer', 'challenge', 'settingsSnapshot', 'presentedAt', 'endedAt', 'preparationMs', 'timing', 'penalty', 'runId', 'repIndex']);
  if (value.trainer !== 'oll' && value.trainer !== 'pll') throw Error('Unsupported last-layer attempt.');
  const challenge = validateLL(value.challenge, engine);
  if (challenge.options.trainer !== value.trainer) throw Error('Last-layer attempt trainer mismatch.');
  return { ...decodeAttemptTiming(value), trainer: value.trainer, challenge, runId: text(value.runId), repIndex: integer(value.repIndex, 0, 56) };
}
