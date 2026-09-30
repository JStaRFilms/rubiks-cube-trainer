import { describe, expect, it } from 'vitest';
import { attemptStatistics, comparisonKey, effectiveExecution, metrics, trimmedAverage } from '../../src/statistics/attempts';
import { attempt } from './fixtures';
import type { AttemptRecord } from '../../src/store/records';
function rows(values: (number | 'dnf')[]): AttemptRecord[] {
  return values.map((value, i) => ({ ...structuredClone(attempt), id: `stats-${i}`, endedAt: new Date(Date.parse(attempt.endedAt) + i * 1000).toISOString(),
    timing: { status: 'completed', executionMs: value === 'dnf' ? 10000 : value, inspectionMs: null }, penalty: { kind: value === 'dnf' ? 'dnf' : 'none', source: value === 'dnf' ? 'manual' : 'none' } }));
}
describe('compatible execution and preparation statistics', () => {
  it('uses +2 effective times, successful count, median and population SD without changing raw', () => {
    const input = rows([1000, 1000, 5000, 'dnf']); const plus = input[1]; if (!plus) throw new Error('Missing row'); plus.penalty = { kind: 'plus2', source: 'manual' };
    const stats = attemptStatistics(input);
    expect(stats).toMatchObject({ total: 4, successful: 3, dnf: 1, interrupted: 0, plus2: 1 });
    expect(stats.execution).toMatchObject({ count: 3, best: 1000, mean: 3000, median: 3000 }); expect(stats.execution?.sd).toBeCloseTo(Math.sqrt(8e6 / 3));
    expect(stats.preparation).toMatchObject({ count: 4, mean: 5000 }); expect(plus.timing.executionMs).toBe(1000);
  });
  it.each([
    [[1000, 2000, 3000, 4000, 5000], 3000],
    [[1000, 2000, 3000, 4000, 'dnf'], 3000],
    [[1000, 2000, 3000, 'dnf', 'dnf'], 'dnf'],
  ] as const)('ao5 trims a best and a worst: %j', (values, expected) => {
    const result = trimmedAverage(rows([...values]), 5); expect(result).toEqual(expected === 'dnf' ? { kind: 'dnf' } : { kind: 'value', ms: expected });
  });
  it('ao12 is chronological, includes penalties, and rejects an untrimmed failure', () => {
    const input = rows([99999, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 'dnf']);
    expect(trimmedAverage([...input].reverse(), 12)).toEqual({ kind: 'value', ms: 6500 });
    const row = input[12]; if (!row) throw new Error('Missing row'); row.penalty = { kind: 'none', source: 'none' };
    row.timing = { status: 'interrupted', executionMs: 12000, inspectionMs: null, reason: 'background', phase: 'execution' };
    expect(effectiveExecution(row)).toBeNull(); input[11] = { ...row, id: 'other', endedAt: input[11]?.endedAt ?? row.endedAt };
    expect(trimmedAverage(input, 12)).toEqual({ kind: 'dnf' });
  });
  it('does not turn interruption into success through penalty edit or use incomplete preparation as a sample', () => {
    const row = rows([1000])[0]; if (!row) throw new Error('Missing row');
    row.timing = { status: 'interrupted', executionMs: null, inspectionMs: null, phase: 'preparation', reason: 'restart' };
    expect(attemptStatistics([row])).toMatchObject({ successful: 0, interrupted: 1, execution: { count: 0 }, preparation: { count: 0 } });
  });
  it('freezes comparison from actual options/frame/inspection/depth, not current preferences or property order', () => {
    const row = structuredClone(attempt), key = comparisonKey(row);
    row.challenge.options = { K: 1, trainer: 'cross' }; expect(comparisonKey(row)).toBe(key);
    row.challenge.options.K = 2; expect(comparisonKey(row)).not.toBe(key); expect(attemptStatistics([attempt, row])).toMatchObject({ comparable: false, execution: null, preparation: null, ao5: { kind: 'mixed' } });
    row.challenge.options.K = 1; row.settingsSnapshot.inspectionMode = '15s'; expect(comparisonKey(row)).not.toBe(key);
    row.settingsSnapshot.inspectionMode = 'untimed'; if (row.challenge.proof.kind === 'cross-optimal') row.challenge.proof.depth = 2; expect(comparisonKey(row)).not.toBe(key);
    expect(trimmedAverage(rows([1000, 2000]), 5)).toEqual({ kind: 'insufficient' });
  });
  it('case modes, slots, hints and angle settings form distinct classes; run IDs never merge whole runs into reps', () => {
    const f2l: AttemptRecord = { ...structuredClone(attempt), trainer: 'f2l', challenge: { ...structuredClone(attempt.challenge), options: { trainer: 'f2l', caseId: 'test-only', slot: 'FR', hint: false, mode: 'execution' }, proof: { kind: 'case', caseId: 'test-only', identityKey: 'test-only', setup: [], solution: [], finalAuf: 0, representative: true } } };
    const other = structuredClone(f2l); if (other.challenge.options.trainer === 'f2l') other.challenge.options.hint = true;
    expect(comparisonKey(other)).not.toBe(comparisonKey(f2l)); other.challenge.options = { trainer: 'oll', caseId: 'test-only', preAuf: 0, yaw: 0, mode: 'recognition' }; other.trainer = 'oll';
    expect(comparisonKey(other)).not.toBe(comparisonKey(f2l));
    const rep = { ...f2l, runId: 'one-run', repIndex: 0 }; expect(comparisonKey(rep)).toBe(comparisonKey(f2l));
    // The selector accepts AttemptRecord only. RunRecord has no execution time here.
  });
  it('handles empty/even samples without invented zero records', () => {
    expect(metrics([])).toEqual({ count: 0, best: null, mean: null, median: null, sd: null }); expect(metrics([2000, 4000]).median).toBe(3000);
  });
});
