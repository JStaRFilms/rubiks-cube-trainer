import type { AttemptRecord, RunRecord } from '../store/records';
import { effectiveExecution, formatMs } from '../statistics/attempts';
import { compatibleRunPB, runStatistics } from '../statistics/runs';
import { llEntry } from '../ll/model';
export function RunResults({ run, runs, attempts }: { run: RunRecord; runs: RunRecord[]; attempts: AttemptRecord[] }) {
  const stats = runStatistics(run, attempts);
  return <section aria-label="Time Attack run results">
    <h3>{run.setSnapshot.trainer.toUpperCase()} · {run.setSnapshot.label} · {run.setSnapshot.caseIds.length} cases · {run.status}</h3>
    <p>{stats.completed} completed · {stats.dnf} DNF · {stats.skipped} skipped · {stats.interrupted} interrupted. Cursor {run.cursor}/{run.repPlan.length}.</p>
    <p>Set mean: {stats.setMean.kind === 'value' ? formatMs(stats.setMean.ms) : stats.setMean.kind === 'dnf' ? 'DNF. Any DNF makes the set mean DNF.' : 'Not eligible. Incomplete, skipped, interrupted or abandoned.'} {stats.eligible ? `Compatible set PB: ${formatMs(compatibleRunPB(run, runs, attempts))}` : 'No successful set PB.'}</p>
    <p>Successful-rep mean: {formatMs(stats.successfulMean)} · {stats.successful}/{run.repPlan.length}. Best {formatMs(stats.best)} · worst {formatMs(stats.worst)} · spread {formatMs(stats.spread)}. This mean excludes failures and is not a set PB.</p>
    <p>Preparation includes scrambling and thinking. Recorded angles and guidance are requested, not observed physical moves. Set comparisons require identical membership and frozen relevant settings/guidance policies.</p>
    <ol>{stats.reps.map(({ outcome, plan, attempt }) => <li key={outcome.repIndex}>{plan ? `${run.setSnapshot.trainer.toUpperCase()} ${llEntry(run.setSnapshot.trainer === 'oll' ? 'oll' : 'pll', plan.caseId).label} · pre-U ${plan.preAuf} · yaw ${plan.yaw}` : ''} · {outcome.kind}
      {attempt && <p>Raw {formatMs(attempt.timing.executionMs)} · effective {attempt.penalty.kind === 'dnf' ? 'DNF' : formatMs(effectiveExecution(attempt))} · penalty {attempt.penalty.kind} · preparation {formatMs(attempt.preparationMs)} · inspection {formatMs(attempt.timing.inspectionMs)}</p>}</li>)}</ol>
  </section>;
}
