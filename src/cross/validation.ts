import { SOLVED, type CubeEngine } from '../cube/engine';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { decodeGoalOptions, boundedInput, DataError, integer, object, text, validateAttemptDurations } from '../store/validation';
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
      boundedInput(input);
      const v = exact(input, ['id', 'sessionId', 'trainer', 'challenge', 'settingsSnapshot', 'presentedAt', 'endedAt', 'preparationMs', 'timing', 'penalty']);
      if (v.trainer !== 'cross') throw new DataError('Only Cross attempts are supported.');
      validateAttemptDurations(v);
      const settings = exact(v.settingsSnapshot, ['inspectionMode', 'audibleWarnings']);
      if (settings.inspectionMode !== 'untimed' && settings.inspectionMode !== '15s') throw new DataError('Unsupported inspection.');
      if (typeof settings.audibleWarnings !== 'boolean') throw new DataError('Invalid audible-warning setting.');
      const t = object(v.timing), p = exact(v.penalty, ['kind', 'source']);
      exact(t, t.status === 'completed' ? ['status', 'executionMs', 'inspectionMs'] : ['status', 'executionMs', 'inspectionMs', 'phase', 'reason']);
      const inspectionMs = t.inspectionMs === null ? null : integer(t.inspectionMs);
      const executionMs = t.executionMs === null ? null : integer(t.executionMs);
      const preparationMs = integer(v.preparationMs);
      if (inspectionMs !== null && inspectionMs > preparationMs) throw new DataError('Inspection cannot exceed preparation.');
      let timing: AttemptRecord['timing'];
      if (t.status === 'completed') { if (executionMs === null) throw new DataError('Completed Cross needs execution duration.'); timing = { status: 'completed', executionMs, inspectionMs }; }
      else {
        if (t.phase !== 'preparation' && t.phase !== 'inspection' && t.phase !== 'arming' && t.phase !== 'execution') throw new DataError('Invalid interrupted phase.');
        if (t.reason !== 'background' && t.reason !== 'restart' && t.reason !== 'cancelled') throw new DataError('Invalid interruption reason.');
        if ((t.phase === 'execution') !== (executionMs !== null) || (t.phase === 'preparation' && inspectionMs !== null) || ((t.phase === 'inspection' || (t.phase === 'arming' && settings.inspectionMode === '15s')) && inspectionMs === null)) throw new DataError('Interrupted durations do not match phase.');
        timing = { status: 'interrupted', executionMs, inspectionMs, phase: t.phase, reason: t.reason };
      }
      if (p.kind !== 'none' && p.kind !== 'plus2' && p.kind !== 'dnf') throw new DataError('Invalid penalty.');
      if (p.source !== 'none' && p.source !== 'inspection' && p.source !== 'manual') throw new DataError('Invalid penalty source.');
      // Rounded 15000/17000 each straddle the threshold. Never overwrite the unrounded decision.
      if (p.source !== 'manual' && (timing.status === 'completed' || timing.phase === 'execution') && inspectionMs !== null) {
        const valid = p.kind === 'none' ? inspectionMs <= 15000 : p.kind === 'plus2' ? inspectionMs >= 15000 && inspectionMs <= 17000 : inspectionMs >= 17000;
        if (!valid || (p.kind !== 'none' && p.source !== 'inspection')) throw new DataError('Inspection penalty is inconsistent with duration.');
      }
      if (p.source === 'inspection' && (timing.status === 'interrupted' && timing.phase !== 'execution')) throw new DataError('Inspection penalty requires execution start.');
      return { id: text(v.id), sessionId: text(v.sessionId), trainer: 'cross', challenge: validateChallenge(v.challenge, engine, table),
        settingsSnapshot: { inspectionMode: settings.inspectionMode, audibleWarnings: settings.audibleWarnings }, presentedAt: text(v.presentedAt), endedAt: text(v.endedAt), preparationMs, timing, penalty: { kind: p.kind, source: p.source } };
    },
    async validateTrainingData(data) {
      if (Object.values(data).some((records) => records.length)) throw new DataError('Cases, algorithms, sets and runs require an unavailable compatible dataset validator.');
      return { personalAlgorithms: [], practiceSets: [], runs: [] };
    },
  };
}
