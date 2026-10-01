import type { AttemptRecord } from './records';
import { boundedInput, DataError, date, integer, object, text, validateAttemptDurations } from './validation';

export function attemptFields(input: unknown): Record<string, unknown> {
  boundedInput(input);
  const v = object(input);
  const fields = ['id', 'sessionId', 'trainer', 'challenge', 'settingsSnapshot', 'presentedAt', 'endedAt', 'preparationMs', 'timing', 'penalty'];
  if (Object.keys(v).length !== fields.length || fields.some((key) => !(key in v))) throw new DataError('Missing or unsupported attempt fields.');
  return v;
}
function exact(input: unknown, fields: string[]): Record<string, unknown> {
  const v = object(input);
  if (Object.keys(v).length !== fields.length || fields.some((key) => !(key in v))) throw new DataError('Missing or unsupported timing fields.');
  return v;
}
export function decodeAttemptTiming(v: Record<string, unknown>): Pick<AttemptRecord, 'id' | 'sessionId' | 'settingsSnapshot' | 'presentedAt' | 'endedAt' | 'preparationMs' | 'timing' | 'penalty'> {
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
  if (t.status === 'completed') {
    if (executionMs === null) throw new DataError('Completed attempt needs execution duration.');
    timing = { status: 'completed', executionMs, inspectionMs };
  } else {
    if (t.phase !== 'preparation' && t.phase !== 'inspection' && t.phase !== 'arming' && t.phase !== 'execution') throw new DataError('Invalid interrupted phase.');
    if (t.reason !== 'background' && t.reason !== 'restart' && t.reason !== 'cancelled') throw new DataError('Invalid interruption reason.');
    if ((t.phase === 'execution') !== (executionMs !== null) || (t.phase === 'preparation' && inspectionMs !== null) || ((t.phase === 'inspection' || (t.phase === 'arming' && settings.inspectionMode === '15s')) && inspectionMs === null)) throw new DataError('Interrupted durations do not match phase.');
    timing = { status: 'interrupted', executionMs, inspectionMs, phase: t.phase, reason: t.reason };
  }
  if (p.kind !== 'none' && p.kind !== 'plus2' && p.kind !== 'dnf') throw new DataError('Invalid penalty.');
  if (p.source !== 'none' && p.source !== 'inspection' && p.source !== 'manual') throw new DataError('Invalid penalty source.');
  // Rounded 15000/17000 straddle the unrounded thresholds. Preserve that decision.
  if (p.source !== 'manual' && (timing.status === 'completed' || timing.phase === 'execution') && inspectionMs !== null) {
    const valid = p.kind === 'none' ? inspectionMs <= 15000 : p.kind === 'plus2' ? inspectionMs >= 15000 && inspectionMs <= 17000 : inspectionMs >= 17000;
    if (!valid || (p.kind !== 'none' && p.source !== 'inspection')) throw new DataError('Inspection penalty is inconsistent with duration.');
  }
  if (p.source === 'inspection' && timing.status === 'interrupted' && timing.phase !== 'execution') throw new DataError('Inspection penalty requires execution start.');
  return { id: text(v.id), sessionId: text(v.sessionId), settingsSnapshot: { inspectionMode: settings.inspectionMode, audibleWarnings: settings.audibleWarnings }, presentedAt: date(v.presentedAt), endedAt: date(v.endedAt), preparationMs, timing, penalty: { kind: p.kind, source: p.source } };
}
