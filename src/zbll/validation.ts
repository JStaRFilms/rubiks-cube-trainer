import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { caseIdentity, edgesOriented, f2lSolved } from '../cases/identity';
import { zbllEntry } from '../cases/zbll';
import { presentCase, validatePresentedLLGuidance } from '../cases/validation';
import { exact, moves } from '../ll/validation';
import { attemptFields, decodeAttemptTiming } from '../store/attempt-timing';
import { boundedInput, decodeGoalOptions, integer, text } from '../store/validation';
import type { AttemptRecord } from '../store/records';
import { zbllMembership, ZBLL_VERSIONS, type ZBLLChallenge } from './model';
export function validateZBLL(input: unknown, engine: CubeEngine): ZBLLChallenge {
  boundedInput(input);
  const value = exact(input, ['challengeId', 'requestId', 'epoch', 'versions', 'frame', 'scramble', 'start', 'options', 'proof']);
  exact(value.versions, ['contract', 'engine', 'dataset', 'tables']); exact(value.frame, ['crossColor', 'colorOfFace']);
  const versions = decodeVersions(value.versions), frame = decodeFrame(value.frame, engine), options = decodeGoalOptions(value.options);
  if (options.trainer !== 'zbll' || JSON.stringify(versions) !== JSON.stringify(ZBLL_VERSIONS)) throw Error('Unsupported ZBLL trainer or collection versions.');
  const member = zbllMembership(options.caseId), entry = zbllEntry(member.caseId);
  const state = exact(value.start, ['format', 'facelets']); engine.fromState(state);
  const start = { format: SOLVED.format, facelets: text(state.facelets) }, scramble = moves(value.scramble);
  const proof = exact(value.proof, ['kind', 'caseId', 'identityKey', 'setup', 'solution', 'finalAuf', 'representative', 'membership']);
  const m = exact(proof.membership, ['family', 'subset', 'sourceLabel', 'referenceLabel', 'datasetVersion', 'identityPolicyVersion']);
  const membership = { family: member.family, subset: member.subset, sourceLabel: member.sourceLabel, referenceLabel: member.referenceLabel, datasetVersion: entry.datasetVersion, identityPolicyVersion: entry.identityPolicyVersion };
  if (Object.entries(membership).some(([key, expected]) => m[key] !== expected) || proof.kind !== 'case' || proof.caseId !== entry.id || proof.identityKey !== entry.identityKey || proof.representative !== false) throw Error('ZBLL canonical identity or membership mismatch.');
  const setup = moves(proof.setup), solution = moves(proof.solution), expected = presentCase(engine, entry, { preAuf: options.preAuf, yaw: options.yaw, slot: 'FR' });
  if (JSON.stringify(setup) !== JSON.stringify(scramble) || JSON.stringify(setup) !== JSON.stringify(expected.setup) || engine.apply(SOLVED, scramble).facelets !== start.facelets || !f2lSolved(engine, start) || !edgesOriented(engine, start) || caseIdentity(engine, entry.trainer, start) !== entry.identityKey) throw Error('ZBLL setup, actual case, angle or starting context mismatch.');
  const finalAuf = validatePresentedLLGuidance(engine, 'zbll', start, solution);
  if (proof.finalAuf !== finalAuf) throw Error('ZBLL required final AUF mismatch.');
  return { challengeId: text(value.challengeId), requestId: text(value.requestId), epoch: integer(value.epoch), versions, frame, options, start, scramble,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup, solution, finalAuf, representative: false, membership } };
}
export function validateZBLLAttempt(input: unknown, engine: CubeEngine): AttemptRecord {
  const value = attemptFields(input);
  if (value.trainer !== 'zbll') throw Error('Unsupported ZBLL attempt.');
  return { ...decodeAttemptTiming(value), trainer: 'zbll', challenge: validateZBLL(value.challenge, engine) };
}
