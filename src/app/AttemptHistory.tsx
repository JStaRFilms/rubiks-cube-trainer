import { useEffect, useState } from 'react';
import { activityStore, enterActivity } from '../pwa/activity';
import { attemptStatistics, chronological, comparisonKey, configurationLabel, effectiveExecution, formatMs, type Average } from '../statistics/attempts';
import type { AttemptRecord } from '../store/records';
import { Repository, storageMessage, type AttemptUndo } from '../store/repository';

function averageText(average: Average): string {
  return average.kind === 'value' ? formatMs(average.ms) : average.kind === 'dnf' ? 'DNF' : average.kind === 'mixed' ? 'Mixed configurations' : 'Not enough attempts';
}
export function AttemptStatistics({ attempts }: { attempts: readonly AttemptRecord[] }) {
  const [view, setView] = useState<'execution' | 'preparation'>('execution');
  const stats = attemptStatistics(attempts), values = view === 'execution' ? stats.execution : stats.preparation;
  return <section aria-label="Attempt statistics">
    <p>{stats.total} attempts · {stats.successful} successful · {stats.dnf} DNF · {stats.interrupted} interrupted · {stats.plus2} +2</p>
    <div><button aria-pressed={view === 'execution'} onClick={() => setView('execution')}>Execution statistics</button><button aria-pressed={view === 'preparation'} onClick={() => setView('preparation')}>Preparation statistics</button></div>
    <p>{view === 'execution' ? 'Successful effective execution. +2 adds 2 seconds; raw time stays unchanged.' : 'Preparation includes scrambling and thinking, not pure planning. Completed attempts only, including completed DNFs.'}</p>
    {!stats.comparable ? <p>Mixed configurations. Select a configuration below for comparable metrics. No pooled best or averages.</p> : <>
      <p>{values?.count ?? 0} {view} samples</p>
      <dl className="statistics-grid"><dt>Best</dt><dd>{formatMs(values?.best ?? null)}</dd><dt>Mean</dt><dd>{formatMs(values?.mean ?? null)}</dd><dt>Median</dt><dd>{formatMs(values?.median ?? null)}</dd><dt>Population SD</dt><dd>{formatMs(values?.sd ?? null)}</dd></dl>
      {view === 'execution' && <p>ao5: {averageText(stats.ao5)} · ao12: {averageText(stats.ao12)}. Trim one best and one worst; any remaining DNF or interruption makes the average DNF.</p>}
    </>}
  </section>;
}
export function AttemptHistory({ repository, sessionId, onChanged, onBusyChange, visible = true }: { repository: Repository; sessionId: string | undefined; onChanged?: () => void; onBusyChange?: (busy: boolean) => void; visible?: boolean }) {
  const [records, setRecords] = useState<AttemptRecord[]>([]), [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState('all'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<AttemptUndo | null>(null);
  useEffect(() => {
    if (!visible) return;
    let current = true;
    void repository.read().then((data) => { if (current) { setRecords(data.backup.attempts.filter((a) => a.sessionId === sessionId)); setRevision(data.revision); } }).catch((reason: unknown) => { if (current) setError(storageMessage(reason)); });
    return () => { current = false; };
  }, [repository, sessionId, visible]);
  async function refresh() {
    const data = await repository.read(); setRecords(data.backup.attempts.filter((a) => a.sessionId === sessionId)); setRevision(data.revision);
  }
  async function change(action: () => Promise<void>) {
    const previous = activityStore.getState().phase;
    if (previous !== 'idle' && previous !== 'editing') { setError('Finish or recover the current attempt before editing history.'); return; }
    if (!enterActivity('editing')) { setError('An update is applying. Wait for reload.'); return; }
    setBusy(true); onBusyChange?.(true); setError('');
    try { await action(); await refresh(); onChanged?.(); }
    catch (reason) { setError(storageMessage(reason)); }
    finally { setBusy(false); onBusyChange?.(false); if (previous === 'idle') enterActivity('idle'); }
  }
  const groups = new Map(records.map((a) => [comparisonKey(a), configurationLabel(a)]));
  const selected = records.filter((a) => filter === 'all' || comparisonKey(a) === filter);
  return <section aria-label="Saved attempt history" aria-busy={busy}>
    <button disabled={busy} onClick={() => void change(async () => { setUndo(null); await refresh(); })}>Refresh history</button>
    <label>Configuration filter<select value={filter} disabled={busy} onChange={(event) => setFilter(event.target.value)}><option value="all">All saved configurations</option>{[...groups].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <AttemptStatistics attempts={selected} />
    {undo && <button disabled={busy} onClick={() => void change(async () => { await repository.undoAttempt(undo); setUndo(null); })}>Undo latest history change</button>}
    {!selected.length && <p>No saved attempts for these filters.</p>}
    <ol className="attempt-list">{chronological(selected).reverse().map((attempt) => <li key={attempt.id}>
      <details><summary>{attempt.timing.status === 'interrupted' ? 'Interrupted' : attempt.penalty.kind === 'dnf' ? 'DNF' : formatMs(effectiveExecution(attempt))} · {attempt.penalty.kind === 'plus2' ? '+2 · ' : ''}{new Date(attempt.endedAt).toLocaleString()}</summary>
        <p>{configurationLabel(attempt)}</p><p>Penalty: {attempt.penalty.kind === 'none' ? 'None' : attempt.penalty.kind === 'plus2' ? '+2' : 'DNF'}{attempt.penalty.source === 'manual' ? ' · manual correction' : attempt.penalty.source === 'inspection' ? ' · inspection' : ''}</p><p>Raw execution: {formatMs(attempt.timing.executionMs)}</p><p>Preparation, includes scrambling: {formatMs(attempt.preparationMs)}</p><p>Inspection: {attempt.timing.inspectionMs === null ? attempt.settingsSnapshot.inspectionMode === 'untimed' ? 'Not used' : 'Not started' : formatMs(attempt.timing.inspectionMs)}</p>
        {attempt.timing.status === 'interrupted' && <p>Interrupted in {attempt.timing.phase}. Penalty edits cannot make this successful.</p>}
        {(['none', 'plus2', 'dnf'] as const).map((kind) => <button key={kind} disabled={busy || attempt.penalty.kind === kind} onClick={() => void change(async () => { const token = await repository.editAttempt(attempt.id, kind, revision); setUndo(token); })}>{kind === 'none' ? 'No penalty' : kind === 'plus2' ? 'Set +2' : 'Set DNF'}</button>)}
        <button className="danger" disabled={busy} onClick={() => {
          if (window.confirm('Delete this saved attempt? Latest deletion can be undone until another history change or restart.')) void change(async () => { const token = await repository.deleteAttempt(attempt.id, revision); setUndo(token); });
        }}>Delete attempt…</button>
      </details>
    </li>)}</ol>
    {error && <p role="alert" className="error">{error}</p>}
  </section>;
}
