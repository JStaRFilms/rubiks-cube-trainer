import type { AttemptRecord } from '../store/records';

// Fixed field construction avoids dependence on imported object property order.
export function comparisonKey(record: AttemptRecord): string {
  const { challenge: { options: o, frame: f, proof: p }, settingsSnapshot: s } = record;
  const options = o.trainer === 'cross' ? [o.K, p.kind === 'cross-optimal' ? p.depth : null]
    : o.trainer === 'cross1' ? [o.K, o.L, o.pair.kind, o.pair.kind === 'slot' ? o.pair.slot : null]
    : o.trainer === 'cross2' ? [o.K, o.L]
    : o.trainer === 'f2l' ? [o.caseId, o.slot, o.hint, o.mode]
    : [o.caseId, o.preAuf, o.yaw, o.mode];
  const metadata = p.kind === 'combined-bound' ? [p.crossDepth, p.cap, [...p.solvedSlots].sort(), p.witness.length]
    : p.kind === 'case' ? [p.caseId, p.identityKey, p.finalAuf, p.representative] : [];
  return JSON.stringify([1, record.trainer, f.crossColor, [f.colorOfFace.U, f.colorOfFace.R, f.colorOfFace.F, f.colorOfFace.D, f.colorOfFace.L, f.colorOfFace.B], s.inspectionMode, options, metadata,
    [record.challenge.versions.contract, record.challenge.versions.engine, record.challenge.versions.dataset, record.challenge.versions.tables],
    (o.trainer === 'f2l' || o.trainer === 'oll' || o.trainer === 'pll') && p.kind === 'case' ? [p.setup.map((m) => [m.family, m.amount]), p.solution.map((m) => [m.family, m.amount])] : null,
    // Guidance snapshots are conservative comparison classes, not observed moves.
    record.review ? [record.review.moves.map((m) => [m.family, m.amount]), record.review.preAuf, record.review.validatedDatasetVersion, record.review.validatedEngineVersion] : null]);
}
export function configurationLabel(record: AttemptRecord): string {
  const { options: o, proof: p, frame: f } = record.challenge;
  const details = o.trainer === 'cross' ? `K ≤ ${o.K}, depth ${p.kind === 'cross-optimal' ? p.depth : '?'}`
    : o.trainer === 'cross1' ? `K ≤ ${o.K}, cap ${o.L}, ${o.pair.kind === 'slot' ? o.pair.slot : 'any pair'}`
    : o.trainer === 'cross2' ? `K ≤ ${o.K}, cap ${o.L}`
    : o.trainer === 'f2l' ? `${o.caseId}, ${o.slot}, hint ${o.hint ? 'shown' : 'hidden'}, ${o.mode}`
    : `${o.caseId}, AUF ${o.preAuf}, yaw ${o.yaw}, ${o.mode}`;
  const witness = p.kind === 'combined-bound' ? `, depth ${p.crossDepth}, generator slots ${p.solvedSlots.join('/')}, witness ${p.witness.length}` : '';
  return `${record.trainer} · ${f.crossColor} · ${record.settingsSnapshot.inspectionMode} · ${details}${witness}`;
}
export function effectiveExecution(record: AttemptRecord): number | null {
  if (record.timing.status !== 'completed' || record.penalty.kind === 'dnf') return null;
  return record.timing.executionMs + (record.penalty.kind === 'plus2' ? 2000 : 0);
}
export function chronological(records: readonly AttemptRecord[]): AttemptRecord[] {
  return [...records].sort((a, b) => a.endedAt.localeCompare(b.endedAt) || a.presentedAt.localeCompare(b.presentedAt) || a.id.localeCompare(b.id));
}
export interface Metrics { count: number; best: number | null; mean: number | null; median: number | null; sd: number | null }
export function metrics(values: readonly number[]): Metrics {
  const sorted = [...values].sort((a, b) => a - b), count = sorted.length;
  if (!count) return { count, best: null, mean: null, median: null, sd: null };
  const mean = sorted.reduce((sum, n) => sum + n, 0) / count;
  const middle = Math.floor(count / 2);
  const median = count % 2 ? sorted[middle] ?? 0 : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  return { count, best: sorted[0] ?? null, mean, median, sd: Math.sqrt(sorted.reduce((sum, n) => sum + (n - mean) ** 2, 0) / count) };
}
export type Average = { kind: 'insufficient' | 'mixed' } | { kind: 'dnf' } | { kind: 'value'; ms: number };
export function trimmedAverage(records: readonly AttemptRecord[], window: 5 | 12): Average {
  if (new Set(records.map(comparisonKey)).size > 1) return { kind: 'mixed' };
  if (records.length < window) return { kind: 'insufficient' };
  const values = chronological(records).slice(-window).map(effectiveExecution).sort((a, b) => (a ?? Infinity) - (b ?? Infinity)).slice(1, -1);
  if (values.some((v) => v === null)) return { kind: 'dnf' };
  return { kind: 'value', ms: values.reduce<number>((sum, n) => sum + (n ?? 0), 0) / values.length };
}
export function attemptStatistics(records: readonly AttemptRecord[]) {
  const comparable = new Set(records.map(comparisonKey)).size <= 1;
  const successful = records.map(effectiveExecution).filter((n): n is number => n !== null);
  const interrupted = records.filter((a) => a.timing.status === 'interrupted').length;
  const dnf = records.filter((a) => a.timing.status === 'completed' && a.penalty.kind === 'dnf').length;
  return { comparable, total: records.length, successful: successful.length, dnf, interrupted,
    plus2: records.filter((a) => a.penalty.kind === 'plus2').length,
    execution: comparable ? metrics(successful) : null,
    // Interruptions have incomplete preparation and are not preparation trend samples.
    preparation: comparable ? metrics(records.filter((a) => a.timing.status === 'completed').map((a) => a.preparationMs)) : null,
    ao5: trimmedAverage(records, 5), ao12: trimmedAverage(records, 12) };
}
export function formatMs(ms: number | null): string {
  if (ms === null) return 'Not available';
  const rounded = Math.round(ms), minutes = Math.floor(rounded / 60000), seconds = Math.floor(rounded / 1000) % 60;
  return minutes ? `${minutes}:${String(seconds).padStart(2, '0')}.${String(rounded % 1000).padStart(3, '0')}` : (rounded / 1000).toFixed(3);
}
