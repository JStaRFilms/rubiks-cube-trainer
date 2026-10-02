import type { AttemptRecord, RunRecord } from '../store/records';
import { effectiveExecution, metrics } from './attempts';
import { runComparisonKey } from '../ll/runs';
export function runStatistics(run: RunRecord, attempts: readonly AttemptRecord[]) {
  const reps = run.outcomes.map((outcome) => ({ outcome, plan: run.repPlan[outcome.repIndex], attempt: outcome.kind === 'skipped' ? null : attempts.find((attempt) => attempt.id === outcome.attemptId) ?? null }));
  const completed = reps.filter((rep) => rep.attempt?.timing.status === 'completed').length;
  const dnf = reps.filter((rep) => rep.attempt?.timing.status === 'completed' && rep.attempt.penalty.kind === 'dnf').length;
  const skipped = reps.filter((rep) => rep.outcome.kind === 'skipped').length;
  const interrupted = reps.filter((rep) => rep.outcome.kind === 'interrupted').length;
  const successful = reps.flatMap((rep) => { const time = rep.attempt ? effectiveExecution(rep.attempt) : null; return time === null ? [] : [time]; });
  const eligible = run.status === 'complete' && completed === run.repPlan.length && !dnf && !skipped && !interrupted && !run.interruptions?.length;
  const successfulMetrics = metrics(successful), worst = successful.length ? Math.max(...successful) : null;
  const setMean = eligible ? { kind: 'value' as const, ms: successfulMetrics.mean ?? 0 } : dnf ? { kind: 'dnf' as const } : { kind: 'ineligible' as const };
  return { reps, completed, dnf, skipped, interrupted, successful: successful.length, best: successfulMetrics.best, worst,
    spread: worst === null || successfulMetrics.best === null ? null : worst - successfulMetrics.best, successfulMean: successfulMetrics.mean, eligible, setMean };
}
export function compatibleRunPB(run: RunRecord, runs: readonly RunRecord[], attempts: readonly AttemptRecord[]): number | null {
  const key = runComparisonKey(run), means = runs.filter((other) => runComparisonKey(other) === key).flatMap((other) => {
    const stats = runStatistics(other, attempts); return stats.setMean.kind === 'value' ? [stats.setMean.ms] : [];
  });
  return means.length ? Math.min(...means) : null;
}
