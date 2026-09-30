import type { Move, TrainingFrame } from '../store/records';
import { boundedInput, object, text } from '../store/validation';
import { type CubeEngine, type CubeStateV1, SOLVED } from '../cube/engine';
import { ENGINE_VERSION } from '../cube/version';
import { decodeMoves } from '../cube/notation';
import { decodeFrame } from '../cube/validation';
export interface TimeInterval { earliestMs: number; latestMs: number }
export type ReconstructionEvent =
  | { kind: 'move'; id: string; move: Move; time: TimeInterval | null; origin: 'detected' | 'manual'; supersedes: readonly string[]; score: { value: number; model: string; calibrated: false } | null }
  | { kind: 'gap'; id: string; time: TimeInterval; reason: 'occlusion' | 'blur' | 'rotation-ambiguity' | 'unobserved' };
export interface ReconstructionV1 {
  format: 'cube-reconstruction'; version: 1; cubeContract: 'cube3-facelets-v1'; engineVersion: string;
  initial: { scramble: readonly Move[]; state: CubeStateV1; frame: TrainingFrame };
  media: { durationMs: number; timeOrigin: 'video-start'; sourceId: string };
  events: readonly ReconstructionEvent[];
  revisions: readonly { id: string; action: 'insert' | 'delete' | 'replace'; removed: readonly ReconstructionEvent[]; addedIds: readonly string[] }[];
  validation: { transitions: 'valid' | 'invalid' | 'incomplete'; finalState: CubeStateV1 | null; solved: boolean | null; exactSequence: 'unchecked' | 'matched' | 'mismatched'; groundTruthId: string | null; issues: readonly string[] };
}
function finite(value: unknown): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('Expected finite nonnegative milliseconds.'); return value; }
function array(value: unknown): unknown[] { if (!Array.isArray(value) || value.length > 10000) throw new Error('Interchange list exceeds 10,000 entries or is not an array.'); return value; }
function strings(value: unknown): string[] { const result = array(value).map((v) => text(v)); if (new Set(result).size !== result.length) throw new Error('Duplicate interchange IDs.'); return result; }
function interval(value: unknown, duration: number): TimeInterval {
  const v = object(value), earliestMs = finite(v.earliestMs), latestMs = finite(v.latestMs);
  if (earliestMs > latestMs || latestMs > duration) throw new Error('Move interval lies outside the video duration.');
  return { earliestMs, latestMs };
}
function event(value: unknown, duration: number): ReconstructionEvent {
  const v = object(value), id = text(v.id);
  if (v.kind === 'gap') {
    const reason = ['occlusion', 'blur', 'rotation-ambiguity', 'unobserved'] as const;
    const selected = reason.find((r) => r === v.reason); if (!selected) throw new Error('Invalid gap reason.');
    return { kind: 'gap', id, time: interval(v.time, duration), reason: selected };
  }
  if (v.kind !== 'move' || (v.origin !== 'manual' && v.origin !== 'detected')) throw new Error('Invalid reconstruction event.');
  const [move] = decodeMoves([v.move]); if (!move) throw new Error('Missing move.');
  let score: Extract<ReconstructionEvent, { kind: 'move' }>['score'] = null;
  if (v.score !== null) {
    const raw = object(v.score);
    if (typeof raw.value !== 'number' || !Number.isFinite(raw.value) || raw.calibrated !== false || v.origin !== 'detected') throw new Error('Only uncalibrated finite detected rankings are supported.');
    score = { value: raw.value, model: text(raw.model), calibrated: false };
  }
  const supersedes = strings(v.supersedes);
  if (v.origin === 'detected' && supersedes.length) throw new Error('Corrections must be manual.');
  return { kind: 'move', id, move, time: v.time === null ? null : interval(v.time, duration), origin: v.origin, supersedes, score };
}
export function decodeReconstruction(value: unknown, engine: CubeEngine): ReconstructionV1 {
  boundedInput(value);
  const v = object(value);
  if (v.format !== 'cube-reconstruction' || v.version !== 1 || v.cubeContract !== SOLVED.format || v.engineVersion !== ENGINE_VERSION) throw new Error('Unsupported reconstruction/engine version.');
  const media = object(v.media), durationMs = finite(media.durationMs), sourceId = text(media.sourceId);
  if (media.timeOrigin !== 'video-start' || /:\/\//.test(sourceId)) throw new Error('Media must use video-relative time and a local opaque source ID.');
  const raw = object(v.initial), scramble = decodeMoves(raw.scramble), state = engine.toState(engine.fromState(raw.state)), frame = decodeFrame(raw.frame, engine);
  if (engine.apply(SOLVED, scramble).facelets !== state.facelets) throw new Error('Initial scramble does not match the supplied state.');
  const events = array(v.events).map((e) => event(e, durationMs));
  if (new Set(events.map((e) => e.id)).size !== events.length) throw new Error('Duplicate event IDs.');
  const revisions = array(v.revisions).map((value): ReconstructionV1['revisions'][number] => {
    const r = object(value), action = r.action;
    if (action !== 'insert' && action !== 'delete' && action !== 'replace') throw new Error('Invalid correction action.');
    const removed = array(r.removed).map((e) => event(e, durationMs)), addedIds = strings(r.addedIds);
    if ((action === 'insert' && (removed.length || !addedIds.length)) || (action === 'delete' && (!removed.length || addedIds.length)) || (action === 'replace' && (!removed.length || !addedIds.length))) throw new Error('Correction action does not match removed/added events.');
    return { id: text(r.id), action, removed, addedIds };
  });
  if (new Set(revisions.map((r) => r.id)).size !== revisions.length) throw new Error('Duplicate revision IDs.');
  const removed = revisions.flatMap((r) => r.removed), all = [...events, ...removed];
  if (new Set(all.map((e) => e.id)).size !== all.length) throw new Error('Removed events must retain distinct IDs.');
  for (const revision of revisions) {
    for (const id of revision.addedIds) {
      const added = all.find((e) => e.id === id);
      if (!added || (added.kind === 'move' && added.origin !== 'manual')) throw new Error('Added correction IDs must reference retained manual events.');
      if (revision.action === 'replace' && added.kind === 'move' && revision.removed.some((e) => !added.supersedes.includes(e.id))) throw new Error('Replacement must retain supersedes links.');
    }
  }
  for (const e of all) if (e.kind === 'move' && e.supersedes.some((id) => !removed.some((old) => old.id === id))) throw new Error('Supersedes references a missing removed event.');
  let pattern = engine.fromState(state), gap = false;
  for (const e of events) { if (e.kind === 'gap') gap = true; else if (!gap) pattern = pattern.applyMove(`${e.move.family}${e.move.amount === -1 ? "'" : e.move.amount === 2 ? '2' : ''}`); }
  const finalState = gap ? null : engine.toState(pattern);
  // Imported flags never prove observations. Independent sequence comparison belongs to R01.
  const validation: ReconstructionV1['validation'] = { transitions: gap ? 'incomplete' : 'valid', finalState, solved: finalState ? engine.normalize(finalState).facelets === SOLVED.facelets : null, exactSequence: 'unchecked', groundTruthId: null, issues: gap ? ['Uncorrected gap prevents downstream state inference.'] : [] };
  return { format: 'cube-reconstruction', version: 1, cubeContract: SOLVED.format, engineVersion: ENGINE_VERSION, initial: { scramble, state, frame }, media: { durationMs, timeOrigin: 'video-start', sourceId }, events, revisions, validation };
}
