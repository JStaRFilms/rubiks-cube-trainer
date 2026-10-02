import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TimeAttackPractice } from './TimeAttackPractice';
import { TimeAttackSettings } from './TimeAttackSettings';
import { LLAlgorithms } from './LLAlgorithms';
import { RunResults } from './RunResults';
import { defaultLLPreferences } from '../ll/model';
import { CrossPractice } from './CrossPractice';
import { F2LPractice } from './F2LPractice';
import { F2LSettings } from './F2LSettings';
import { F2LAlgorithms } from './F2LAlgorithms';
import { defaultF2LPreferences } from '../f2l/model';
import { trainerValidator } from '../store/trainer-validator';
import type { AttemptRecord } from '../store/records';
import { AttemptHistory } from './AttemptHistory';
import { attemptStatistics, formatMs } from '../statistics/attempts';
const MoveReview = lazy(() => import('./MoveReview').then((module) => ({ default: module.MoveReview })).catch(() => ({
  default: function ReviewLoadError() {
    return <p role="alert" className="error">Move review could not load. Check offline setup or reconnect, then reload to retry. <button onClick={() => location.reload()}>Reload to retry</button></p>;
  },
})));
import { colors, defaultOneOptions, defaultSettings, personalStores, trainers, type SemanticValidator, type TrainerBackupV1 } from '../store/records';
import { Repository, storageMessage } from '../store/repository';
import { MAX_FILE_BYTES, parseBackup } from '../store/validation';
import { activityStore, enterActivity } from '../pwa/activity';
import { PwaController, type OfflineState } from '../pwa/client';

const labels = { cross: 'Cross', cross1: 'Cross+1', f2l: 'F2L', oll: 'Time Attack · OLL', pll: 'Time Attack · PLL', zbll: 'ZBLL', cross2: 'Cross+2' };
type Panel = 'settings' | 'session' | 'help' | 'data' | 'review' | 'algorithms';
function downloadBackup(backup: TrainerBackupV1) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `cube-trainer-${new Date().toISOString().slice(0, 10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function App({ validator = trainerValidator }: { validator?: SemanticValidator }) {
  const activity = useSyncExternalStore(activityStore.subscribe, () => activityStore.getState().phase);
  const practiceBlocked = activity !== 'idle' && activity !== 'editing';
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [repository] = useState(() => new Repository('cube-trainer', setError, validator));
  const [settings, setSettings] = useState(defaultSettings), [draft, setDraft] = useState(defaultSettings);
  const [data, setData] = useState<TrainerBackupV1 | null>(null);
  const [offline, setOffline] = useState<OfflineState>({ phase: 'not-started', message: 'Offline shell not checked.', waiting: false });
  const [pwa] = useState(() => new PwaController(setOffline, () => repository.probe()));
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'), changed = () => setSystemReduced(media.matches);
    media.addEventListener('change', changed); return () => media.removeEventListener('change', changed);
  }, []);
  const [practiceEpoch, setPracticeEpoch] = useState(0);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null), [busy, setBusy] = useState(false);
  const [sessionLabel, setSessionLabel] = useState(''), [renameId, setRenameId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ backup: TrainerBackupV1; revision: number; clear: boolean } | null>(null);
  const [confirmed, setConfirmed] = useState(false), [persistence, setPersistence] = useState(typeof navigator.storage?.persisted === 'function' ? 'Checking browser status' : 'Unavailable in this browser');
  const dialog = useRef<HTMLDialogElement>(null), opener = useRef<HTMLElement | null>(null);
  async function refresh() {
    const result = await repository.read(); setData(result.backup);
    const preference = result.backup.settings[0] ?? defaultSettings; setSettings(preference); setDraft(preference);
  }
  useEffect(() => {
    void repository.read().then(({ backup }) => { setData(backup); const prefs = backup.settings[0] ?? defaultSettings; setSettings(prefs); setDraft(prefs); }).catch((reason: unknown) => setError(storageMessage(reason)));
    void pwa.start();
    if (navigator.storage?.persisted) void navigator.storage.persisted().then((granted) => setPersistence(granted ? 'Granted by browser' : 'Not granted by browser')).catch(() => setPersistence('Status unavailable'));
  }, [repository, pwa]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.motion = settings.reducedMotion;
  }, [settings.theme, settings.reducedMotion]);
  function open(next: Panel) {
    if (busy) return;
    if (practiceBlocked) { setError('Finish or recover this attempt before opening another panel.'); return; }
    if (!enterActivity('editing')) { setError('An update is applying. Wait for this tab to reload.'); return; }
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanel(next); setDraft(settings); setPreview(null); setConfirmed(false); setNotice('');
    dialog.current?.showModal();
  }
  function close() {
    if (busy) return;
    dialog.current?.close(); setPanel(null); setPreview(null); setConfirmed(false); enterActivity('idle'); opener.current?.focus();
  }
  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (reason) { setError(storageMessage(reason)); }
    finally { setBusy(false); }
  }
  const reviewAttempt = data?.attempts.find((attempt) => attempt.id === reviewId);
  const sessions = data?.sessions.filter((session) => session.trainer === settings.defaultTrainer) ?? [];
  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const attempts = data?.attempts.filter((attempt) => attempt.sessionId === selectedSession?.id) ?? [];
  const stats = attemptStatistics(attempts);
  const sessionSummary = <><strong>{selectedSession?.label ?? 'No session yet'}</strong><span>{attempts.length} saved attempts</span><span className="scope">{labels[settings.defaultTrainer]} · {stats.comparable ? `Best ${formatMs(stats.execution?.best ?? null)} · ${stats.successful} successful` : 'Mixed configurations'}</span></>;
  return <div className="workspace">
    <header className="toolbar">
      <span className="wordmark">Cube Trainer</span>
      <label className="trainer-label"><span className="sr-only">Trainer</span><select aria-label="Trainer" value={settings.defaultTrainer} disabled={busy || practiceBlocked} onChange={(event) => {
        const trainer = trainers.find((value) => value === event.target.value); if (!trainer || !enterActivity('editing')) return;
        void perform(async () => { await repository.saveSettings({ ...settings, defaultTrainer: trainer }); await refresh(); }).finally(() => { enterActivity('idle'); });
      }}>{trainers.map((trainer) => <option key={trainer} value={trainer}>{labels[trainer]}{trainer === 'cross' || trainer === 'cross1' || trainer === 'f2l' || trainer === 'oll' || trainer === 'pll' ? '' : ' · unavailable'}</option>)}</select></label>
      <span className="configuration">{settings.defaultTrainer === 'oll' || settings.defaultTrainer === 'pll' ? `${(settings.llPractice?.[settings.defaultTrainer] ?? defaultLLPreferences(settings.defaultTrainer)).caseIds.length}/${settings.defaultTrainer === 'oll' ? 57 : 21} cases · ${(settings.llPractice?.[settings.defaultTrainer] ?? defaultLLPreferences(settings.defaultTrainer)).mode}` : settings.defaultTrainer === 'f2l' ? `${(settings.f2lPractice ?? defaultF2LPreferences).caseIds.length}/41 cases · ${(settings.f2lPractice ?? defaultF2LPreferences).slotMode === 'FR' ? 'FR only' : 'Random slot'} · ${(settings.f2lPractice ?? defaultF2LPreferences).mode}` : settings.defaultTrainer === 'cross1' ? `K ≤ ${settings.lastOptions.cross1?.trainer === 'cross1' ? settings.lastOptions.cross1.K : 3} · L ≤ ${settings.lastOptions.cross1?.trainer === 'cross1' ? settings.lastOptions.cross1.L : 8} · ${settings.lastOptions.cross1?.trainer === 'cross1' && settings.lastOptions.cross1.pair.kind === 'slot' ? settings.lastOptions.cross1.pair.slot : 'Any pair'}` : `Max ${settings.lastOptions.cross?.trainer === 'cross' ? settings.lastOptions.cross.K : 4} HTM`} · {settings.crossColor} · {settings.inspectionMode === '15s' ? '15 s inspection' : 'Untimed'}</span>
      <button disabled={busy || practiceBlocked} onClick={() => open('settings')}>Settings</button><button disabled={busy || practiceBlocked} onClick={() => open('help')}>Help</button>
    </header>
    <aside className="session-dock" aria-label="Session summary">{sessionSummary}<button disabled={practiceBlocked} onClick={() => open('session')}>Session / history</button><p>{attempts.length ? `${stats.dnf} DNF · ${stats.interrupted} interrupted` : 'No saved attempts for this trainer.'}</p><button onClick={() => open('data')}>Local data</button></aside>
    <main className="practice">
      {(settings.defaultTrainer === 'oll' || settings.defaultTrainer === 'pll') && data ? <TimeAttackPractice key={settings.defaultTrainer} trainer={settings.defaultTrainer} repository={repository} dataEpoch={practiceEpoch} settings={settings} session={selectedSession} editing={panel !== null || busy} reviewing={panel === 'review'} runs={data.runs} attempts={data.attempts}
        onSession={(session) => { setSelectedSessionId(session.id); setData((current) => current ? { ...current, sessions: [...current.sessions, session] } : current); }}
        onChanged={async () => { const { backup } = await repository.read(); setData(backup); }}
        onSaved={(attempt) => { setData((current) => current ? { ...current, attempts: [...current.attempts.filter((a) => a.id !== attempt.id), attempt] } : current); }}
        onReview={(attempt) => { setReviewId(attempt.id); open('review'); }} onAlgorithms={() => open('algorithms')} /> : settings.defaultTrainer === 'f2l' && data ? <F2LPractice repository={repository} dataEpoch={practiceEpoch} settings={settings} session={selectedSession} editing={panel !== null || busy} reviewing={panel === 'review'} algorithms={data.personalAlgorithms} attempts={data.attempts}
        onSession={(session) => { setSelectedSessionId(session.id); setData((current) => current ? { ...current, sessions: [...current.sessions, session] } : current); }}
        onSaved={(attempt) => { setData((current) => current ? { ...current, attempts: [...current.attempts.filter((a) => a.id !== attempt.id), attempt] } : current); void repository.read().then(({ backup }) => setData(backup)).catch((reason: unknown) => setError(storageMessage(reason))); }}
        onReview={(attempt) => { setReviewId(attempt.id); open('review'); }} onAlgorithms={() => open('algorithms')} /> : (settings.defaultTrainer === 'cross' || settings.defaultTrainer === 'cross1') && data ? <CrossPractice repository={repository} dataEpoch={practiceEpoch} settings={settings} session={selectedSession} editing={panel !== null || busy} reviewing={panel === 'review'}
        attempts={data.attempts} onSession={(session) => { setSelectedSessionId(session.id); setData((current) => current ? { ...current, sessions: [...current.sessions, session] } : current); }}
        onSaved={(attempt: AttemptRecord) => { setData((current) => current ? { ...current, attempts: [...current.attempts.filter((a) => a.id !== attempt.id), attempt] } : current); void repository.read().then(({ backup }) => setData(backup)).catch((reason: unknown) => setError(storageMessage(reason))); }}
        onReview={(attempt) => { setReviewId(attempt.id); open('review'); }} /> : <>
      <section className="scramble-rail" aria-label="Challenge status">
        <span>{labels[settings.defaultTrainer]} · Not delivered yet</span>
        <p>No verified scramble available</p>
      </section>
      <section className="timer-canvas" aria-label="Timer unavailable">
        <div className="clock" aria-hidden="true">--.--</div><h1>{data ? 'Trainer unavailable' : 'Checking local data'}</h1><p>Cross, Cross+1, F2L, OLL and PLL practice are delivered.</p>
      </section>
      </>}
      <div className="practice-tools"><button disabled={practiceBlocked} data-timer-input="isolated" onClick={() => { setReviewId(null); open('review'); }}>Move review</button><button disabled={practiceBlocked} className="status-button" onClick={() => open('data')}>{offline.phase === 'ready' ? 'Offline review ready · Cross ready · Cross+1 ready · F2L ready · OLL ready · PLL ready' : 'Offline trainer setup'}</button></div>
      {offline.waiting && <div className="update-bar" role="status"><span>Update downloaded. Apply when idle.</span><button disabled={busy || panel !== null || practiceBlocked} onClick={() => {
        if (window.confirm('Apply the downloaded update? Idle Cube Trainer tabs will reload.')) void perform(() => pwa.applyUpdate());
      }}>Apply update</button></div>}
      {error && <div className="error" role="alert">{error}<button onClick={() => void perform(refresh)}>Retry storage</button></div>}
    </main>
    <footer className="session-shelf"><div>{sessionSummary}</div><button onClick={() => open('session')}>Session</button></footer>
    <dialog ref={dialog} aria-labelledby="panel-title" onCancel={(event) => { event.preventDefault(); close(); }}>
      <div className="dialog-heading"><h2 id="panel-title">{panel === 'settings' ? 'Settings' : panel === 'session' ? 'Session and history' : panel === 'data' ? 'Local data' : panel === 'review' ? 'Move review' : panel === 'algorithms' ? `Personal ${settings.defaultTrainer.toUpperCase()} algorithms` : 'Help'}</h2><button disabled={busy} onClick={close} aria-label="Close dialog">Close</button></div>
      <div className="dialog-body" aria-busy={busy}>
        {panel === 'review' && (reviewId && !reviewAttempt ? <p>This attempt is no longer in saved history.</p> : <Suspense fallback={<p role="status">Loading move review…</p>}><MoveReview key={reviewId ?? 'entered'} color={reviewAttempt?.challenge.frame.crossColor ?? settings.crossColor} challenge={reviewAttempt?.challenge} reduceMotion={settings.reducedMotion === 'on' || systemReduced} /></Suspense>)}
        {panel === 'algorithms' && (settings.defaultTrainer === 'oll' || settings.defaultTrainer === 'pll' ? <LLAlgorithms key={settings.defaultTrainer} trainer={settings.defaultTrainer} repository={repository} onBusy={setBusy} onChanged={refresh} /> : <F2LAlgorithms repository={repository} onBusy={setBusy} onChanged={refresh} />)}
        {panel === 'settings' && <form onSubmit={(event) => { event.preventDefault(); void perform(async () => { await repository.saveSettings(draft); await refresh(); setNotice('Settings saved on this device.'); }); }}>
          <label>Theme<select value={draft.theme} onChange={(event) => { const theme = event.target.value; if (theme === 'dark' || theme === 'light' || theme === 'system') setDraft({ ...draft, theme }); }}><option>dark</option><option>light</option><option>system</option></select></label>
          <label>Cross color<select value={draft.crossColor} onChange={(event) => { const color = colors.find((value) => value === event.target.value); if (color) setDraft({ ...draft, crossColor: color }); }}>{colors.map((color) => <option key={color}>{color}</option>)}</select></label>
          {(draft.defaultTrainer === 'cross' || draft.defaultTrainer === 'cross1') && <label>Maximum Cross depth<select value={draft.defaultTrainer === 'cross1' ? draft.lastOptions.cross1?.trainer === 'cross1' ? draft.lastOptions.cross1.K : 3 : draft.lastOptions.cross?.trainer === 'cross' ? draft.lastOptions.cross.K : 4} onChange={(event) => {
            const K = ([1, 2, 3, 4, 5, 6, 7, 8] as const).find((value) => String(value) === event.target.value);
            if (K) setDraft({ ...draft, lastOptions: { ...draft.lastOptions, ...(draft.defaultTrainer === 'cross1' ? { cross1: { ...(draft.lastOptions.cross1?.trainer === 'cross1' ? draft.lastOptions.cross1 : defaultOneOptions), K } } : { cross: { trainer: 'cross', K } }) } });
          }}>{[1, 2, 3, 4, 5, 6, 7, 8].map((K) => <option key={K} value={K}>{K} HTM</option>)}</select></label>}
          {draft.defaultTrainer === 'cross1' && <>
            <label>Combined solution cap<select value={draft.lastOptions.cross1?.trainer === 'cross1' ? draft.lastOptions.cross1.L : 8} onChange={(event) => {
              const L = Number(event.target.value); setDraft({ ...draft, lastOptions: { ...draft.lastOptions, cross1: { ...(draft.lastOptions.cross1?.trainer === 'cross1' ? draft.lastOptions.cross1 : defaultOneOptions), L } } });
            }}>{Array.from({ length: 12 }, (_, i) => i + 1).map((L) => <option key={L} value={L}>{L} HTM</option>)}</select></label>
            <label>Pair goal<select value={draft.lastOptions.cross1?.trainer === 'cross1' && draft.lastOptions.cross1.pair.kind === 'slot' ? draft.lastOptions.cross1.pair.slot : 'any'} onChange={(event) => {
              const slot = (['FR', 'FL', 'BR', 'BL'] as const).find((value) => value === event.target.value);
              setDraft({ ...draft, lastOptions: { ...draft.lastOptions, cross1: { ...(draft.lastOptions.cross1?.trainer === 'cross1' ? draft.lastOptions.cross1 : defaultOneOptions), pair: slot ? { kind: 'slot', slot } : { kind: 'any' } } } });
            }}><option value="any">Any pair</option>{['FR', 'FL', 'BR', 'BL'].map((slot) => <option key={slot}>{slot}</option>)}</select></label>
            <p>K1..8 and L1..12 are ceilings. A found solution proves the combined cap, not global optimality. Generation has a 5-second / 10,000-node budget; exhaustion keeps your options for retry. Physical-phone performance is not yet measured.</p>
          </>}
          {draft.defaultTrainer === 'f2l' && <F2LSettings value={draft.f2lPractice ?? defaultF2LPreferences} onChange={(f2lPractice) => setDraft({ ...draft, f2lPractice })} />}
          {(draft.defaultTrainer === 'oll' || draft.defaultTrainer === 'pll') && <TimeAttackSettings key={draft.defaultTrainer} trainer={draft.defaultTrainer} value={draft.llPractice?.[draft.defaultTrainer] ?? defaultLLPreferences(draft.defaultTrainer)} sets={data?.practiceSets ?? []} repository={repository} onBusy={setBusy} onChanged={async () => { const { backup } = await repository.read(); setData(backup); }} onChange={(value) => setDraft({ ...draft, llPractice: { ...draft.llPractice, [draft.defaultTrainer]: value } })} />}
          <label>Inspection<select value={draft.inspectionMode} onChange={(event) => { const mode = event.target.value; if (mode === 'untimed' || mode === '15s') setDraft({ ...draft, inspectionMode: mode }); }}><option value="untimed">Untimed</option><option value="15s">15 s inspection</option></select></label>
          <label className="check"><input type="checkbox" checked={draft.audibleWarnings} onChange={(event) => setDraft({ ...draft, audibleWarnings: event.target.checked })} />Audible inspection warnings</label>
          <label className="check"><input type="checkbox" checked={draft.reducedMotion === 'on'} onChange={(event) => setDraft({ ...draft, reducedMotion: event.target.checked ? 'on' : 'system' })} />Reduce motion</label>
          <p>Preparation includes scrambling and thinking, not just planning. {(draft.defaultTrainer === 'cross' || draft.defaultTrainer === 'cross1') && 'Maximum depth is a ceiling, not exact depth. Half turns count once.'}</p>
          <button disabled={busy || (draft.defaultTrainer === 'f2l' && draft.f2lPractice?.caseIds.length === 0) || ((draft.defaultTrainer === 'oll' || draft.defaultTrainer === 'pll') && draft.llPractice?.[draft.defaultTrainer]?.caseIds.length === 0)} type="submit">Save settings</button><button type="button" disabled={busy} onClick={close}>Cancel</button>
        </form>}
        {panel === 'session' && <>
          <p>{labels[settings.defaultTrainer]} · {attempts.length} saved attempts.</p>
          <ul className="session-list">{sessions.map((session) => <li key={session.id}><span>{session.label}</span><button disabled={busy} onClick={() => setSelectedSessionId(session.id)}>{selectedSession?.id === session.id ? 'Selected' : 'Use session'}</button><button onClick={() => { setRenameId(session.id); setSessionLabel(session.label); }}>Rename</button></li>)}</ul>
          <form onSubmit={(event) => { event.preventDefault(); void perform(async () => { const previous = sessions.find((s) => s.id === renameId); await repository.saveSession({ id: previous?.id ?? crypto.randomUUID(), trainer: settings.defaultTrainer, label: sessionLabel.trim(), createdAt: previous?.createdAt ?? new Date().toISOString() }); await refresh(); setSessionLabel(''); setRenameId(null); setNotice('Session saved on this device.'); }); }}>
            <label>Session name<input maxLength={120} required value={sessionLabel} onChange={(event) => setSessionLabel(event.target.value)} /></label>
            <button disabled={busy || !sessionLabel.trim()}>{renameId ? 'Save name' : 'New session'}</button>{renameId && <button type="button" onClick={() => { setRenameId(null); setSessionLabel(''); }}>Cancel rename</button>}
          </form><button onClick={() => { setPanel('data'); setPreview(null); }}>Local data</button>
        </>}
        <div hidden={panel !== 'session'}><AttemptHistory key={selectedSession?.id ?? settings.defaultTrainer} repository={repository} sessionId={selectedSession?.id} visible={panel === 'session'} onBusyChange={setBusy} onReview={(attempt) => { setReviewId(attempt.id); setPanel('review'); }} onChanged={() => { void refresh().catch((reason: unknown) => setError(storageMessage(reason))); }} /></div>
        {panel === 'session' && data && (settings.defaultTrainer === 'oll' || settings.defaultTrainer === 'pll') && <section aria-label="Saved Time Attack runs"><h3>Runs</h3>{data.runs.filter((run) => run.sessionId === selectedSession?.id).map((run) => <details key={run.id}><summary>{run.setSnapshot.label} · {run.status} · {run.cursor}/{run.repPlan.length}</summary><RunResults run={run} runs={data.runs} attempts={data.attempts} /></details>)}</section>}
        {panel === 'help' && <>
          <p>OLL and PLL Time Attack use separate complete 57/21 lists or custom sets. Runs freeze membership, angles, settings and personal guidance before any rep. OLL begins with F2L solved and aligned and LL oriented, with any legal LL permutation. Consecutive OLL needs no PLL. PLL begins fully solved and aligned, including final AUF. When using a different algorithm, align your physical cube rather than blindly applying the displayed AUF. Confirm the appropriate base before every setup. Reload cannot resume a timer; presented work recovers as interrupted. DNF, skip, interruption or abandonment cannot produce a successful set PB.</p>
          <p>F2L isolates one pair from all 41 verified cases. Before every setup, confirm Cross and all four pairs solved and aligned. LL may vary. Next returns to this confirmation. Settings selects cases/families, FR or random slot, pre-U, requested view hint and execution/recognition. Personal algorithms change future guidance, never canonical setup or saved review. The net/player LL is representative, not an observed physical state.</p>
          <p>Start Cross practice generates a verified scramble. Begin with the selected Cross solved and aligned to its side centers. Hold the displayed down/front colors, apply the scramble, then solve only the Cross. If unsure of your cube after stopping, restore that Cross before Next. Other pieces in review are representative unless your base was fully solved. Completion is self-reported.</p><p>Cross+1 requires a fully solved cube before every scramble. After each attempt, reset the entire cube, confirm its down/front frame and start a fresh scramble. A solved Cross plus pair is not enough. Any pair leaves your choice open until review; the generated solution does not record the pair you executed.</p><p>Cross uses a maximum optimal depth, not an exact depth. A half turn counts as one move.</p><p>Use Settings for preferences and Session for trainer-specific sessions.</p><p>Install from your browser's install menu. On iPhone, use Share, then Add to Home Screen. Offline setup includes the cube model and never-opened move-review player.</p><button onClick={() => setPanel('data')}>Local data and offline setup</button>
        </>}
        {panel === 'data' && <>
          <p>Stored in this browser. Clearing storage or losing this device can remove it. Keep a file backup.</p>
          <h3>Offline Cross, Cross+1, F2L, OLL and PLL practice and review</h3><p role="status">{offline.message}</p><p>Includes generation workers, the verified Cross cache, memory-only pair tables, all 41 F2L, 57 OLL and 21 PLL cases and actual library validation, frozen set runs, cube model and never-opened 3D player. ZBLL and Cross+2 remain unavailable.</p><p><a href="/licenses/cases-Lieberkind-MIT.txt" target="_blank" rel="noreferrer">F2L numbering MIT notice</a> · <a href="/licenses/cases-Speeden-MIT.txt" target="_blank" rel="noreferrer">Case defaults MIT notice</a></p><p><a href="/licenses/THIRD-PARTY-NOTICES.txt" target="_blank" rel="noreferrer">Third-party notices</a> · <a href="/licenses/cubing-0.63.8-source.tgz">Covered cube-tool source</a></p>
          <button disabled={busy} onClick={() => void perform(() => pwa.verify(true))}>Set up / retry review</button>{offline.message === 'Shell downloaded. Reload to finish setup.' && <button disabled={busy} onClick={() => { close(); location.reload(); }}>Reload to finish setup</button>}<button disabled={busy} onClick={() => void perform(() => pwa.verify(false))}>Recheck cached review</button><button disabled={busy} onClick={() => void perform(() => pwa.checkUpdate())}>Check for update</button>
          <h3>Storage</h3><p>Persistent storage: {persistence}. This does not replace a backup.</p><button disabled={busy} onClick={() => void perform(async () => {
            if (!navigator.storage?.persist) { setPersistence('Unavailable in this browser'); return; }
            setPersistence(await navigator.storage.persist() ? 'Granted by browser' : 'Not granted by browser');
          })}>Request persistent storage</button>
          <h3>File backup</h3><p>Includes settings, sessions, attempts, algorithms, sets and runs. Excludes caches and unsaved records.</p>
          <button disabled={busy} onClick={() => void perform(async () => { const current = await repository.read(); downloadBackup(current.backup); setNotice('Backup downloaded.'); })}>Download current backup</button>
          <label>Restore backup file<input type="file" accept=".json,application/json" disabled={busy} onChange={(event) => {
            const file = event.target.files?.[0]; event.target.value = ''; setPreview(null); setConfirmed(false);
            if (!file) return;
            void perform(async () => { if (file.size > MAX_FILE_BYTES) throw new Error('Backup exceeds 20 MiB. Choose a smaller file.'); const current = await repository.read(); const backup = await parseBackup(await file.text(), validator); setPreview({ backup, revision: current.revision, clear: false }); });
          }} /></label>
          <button disabled={busy} onClick={() => void perform(async () => { const current = await repository.read(); setConfirmed(false); setPreview({ backup: { ...current.backup, settings: [], sessions: [], attempts: [], personalAlgorithms: [], practiceSets: [], runs: [] }, revision: current.revision, clear: true }); })}>Clear personal data…</button>
          {preview && <section className="restore-preview"><h3>{preview.clear ? 'Clear all personal data' : 'Validated backup preview'}</h3><ul>{personalStores.map((store) => <li key={store}>{store}: {preview.backup[store].length}</li>)}</ul><p>This replaces all six personal record groups in this browser. Solver and application caches are unchanged.</p><p>Download your current backup before continuing.</p><label className="check"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} />I confirm replacement of all local personal data.</label><button className="danger" disabled={busy || !confirmed} onClick={() => void perform(async () => {
            await repository.replace(preview.backup, preview.revision); setPracticeEpoch((value) => value + 1); await refresh(); setPreview(null); setConfirmed(false); setNotice('Local data replaced.');
          })}>{preview.clear ? 'Clear confirmed personal data' : 'Replace local data'}</button><button disabled={busy} onClick={() => { setPreview(null); setConfirmed(false); }}>Cancel restore</button></section>}
        </>}
        {busy && <p role="status">Working…</p>}{notice && <p role="status">{notice}</p>}{error && <p className="error" role="alert">{error}</p>}
      </div>
    </dialog>
  </div>;
}
