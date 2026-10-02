import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LLClient } from '../ll/client';
import { defaultLLPreferences, llLibrary, type LLTrainer } from '../ll/model';
import { closeRep, recoverRun } from '../ll/runs';
import { TRAINING_FRAMES } from '../cube/frame';
import { activityStore } from '../pwa/activity';
import type { AttemptRecord, RunRecord, SessionRecord, SettingsRecord } from '../store/records';
import { Repository, storageMessage } from '../store/repository';
import { TimerController, freezeSnapshot, type Presentation } from '../timer/controller';
import { TimerPractice } from './TimerPractice';
import { RunResults } from './RunResults';
interface Props {
  trainer: LLTrainer; repository: Repository; dataEpoch: number; settings: SettingsRecord; session?: SessionRecord; editing: boolean; reviewing: boolean;
  runs: RunRecord[]; attempts: AttemptRecord[];
  onSession: (session: SessionRecord) => void; onChanged: () => Promise<void>; onSaved: (attempt: AttemptRecord) => void; onReview: (attempt: AttemptRecord) => void; onAlgorithms: () => void;
}
function configuration(settings: SettingsRecord, trainer: LLTrainer) { return JSON.stringify([settings.defaultTrainer, settings.crossColor, settings.llPractice?.[trainer] ?? defaultLLPreferences(trainer), settings.inspectionMode, settings.audibleWarnings]); }
export function TimeAttackPractice({ trainer, repository, dataEpoch, settings, session, editing, reviewing, runs, attempts, onSession, onChanged, onSaved, onReview, onAlgorithms }: Props) {
  const [controller] = useState(() => new TimerController(repository)), [client] = useState(() => new LLClient());
  const [presentation, setPresentation] = useState<Presentation | null>(null), [selected, setSelected] = useState<RunRecord | null>(null), [working, setWorking] = useState(false);
  const [baseConfirmed, setBaseConfirmed] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('Choose a set in Settings, then start a frozen run.');
  const mounted = useRef(true), epoch = useRef(0), current = useRef({ settings, session, dataEpoch, editing, reviewing });
  useEffect(() => { current.current = { settings, session, dataEpoch, editing, reviewing }; }, [settings, session, dataEpoch, editing, reviewing]);
  const timer = useSyncExternalStore(controller.subscribe, controller.getSnapshot), prefs = settings.llPractice?.[trainer] ?? defaultLLPreferences(trainer);
  const fingerprint = JSON.stringify([configuration(settings, trainer), session?.id, dataEpoch]), previous = useRef(fingerprint);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; client.suspend(); }; }, [client]);
  useEffect(() => {
    if (previous.current === fingerprint) return; previous.current = fingerprint; epoch.current++; client.suspend();
    if (!controller.blocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentation(null); setSelected(null); setBaseConfirmed(false); setWorking(false);
    }
  }, [fingerprint, controller, client]);
  useEffect(() => {
    if (!reviewing) return;
    epoch.current++; client.suspend();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorking(false);
  }, [reviewing, client]);
  const storedSelected = runs.find((run) => run.id === selected?.id) ?? selected;
  const resumable = runs.filter((run) => run.setSnapshot.trainer === trainer && run.sessionId === session?.id && (run.status === 'active' || run.status === 'interrupted'));
  const base = trainer === 'oll' ? 'My F2L is solved and aligned, and LL is oriented. LL permutation may vary.' : 'My cube is fully solved and aligned to its centers, including final AUF.';
  async function operation(action: (mine: number) => Promise<void>) {
    if (working || editing || document.hidden || controller.blocked || activityStore.getState().updateToken) return;
    const mine = ++epoch.current; setWorking(true); setError(''); setBaseConfirmed(false);
    try { await action(mine); } catch (reason) { if (mounted.current && mine === epoch.current) setError(storageMessage(reason)); }
    finally { if (mounted.current && mine === epoch.current) { setWorking(false); client.suspend(); } }
  }
  async function startRun(mine: number) {
    const snapshot = structuredClone(settings), selectedEpoch = dataEpoch;
    let target = session;
    if (!target) {
      target = { id: crypto.randomUUID(), trainer, label: `${trainer.toUpperCase()} Time Attack`, createdAt: new Date().toISOString() }; await repository.saveSession(target);
      if (!mounted.current || mine !== epoch.current) return;
      previous.current = JSON.stringify([configuration(snapshot, trainer), target.id, selectedEpoch]); onSession(target);
    }
    const targetSession = target;
    await client.initialize(); const instance = client.workerInstance, read = await repository.read(), preference = snapshot.llPractice?.[trainer] ?? defaultLLPreferences(trainer), now = new Date().toISOString();
    const savedSet = read.backup.practiceSets.find((set) => set.id === preference.setId && set.trainer === trainer);
    if (preference.setId && (!savedSet || JSON.stringify(savedSet.caseIds) !== JSON.stringify(preference.caseIds))) throw Error('Selected set changed. Reopen Settings before starting.');
    const set = savedSet ?? { id: crypto.randomUUID(), label: preference.caseIds.length === llLibrary(trainer).length ? `Full ${trainer.toUpperCase()} ${llLibrary(trainer).length}` : `Custom ${trainer.toUpperCase()} ${preference.caseIds.length}`, trainer, caseIds: preference.caseIds, createdAt: now, updatedAt: now };
    const planned = await client.plan(set, targetSession, { mode: preference.mode, shuffle: preference.shuffle, preAuf: preference.preAuf, yaw: preference.yaw, frame: { crossColor: snapshot.crossColor, colorOfFace: { ...TRAINING_FRAMES[snapshot.crossColor] } }, settings: { inspectionMode: snapshot.inspectionMode, audibleWarnings: snapshot.audibleWarnings } }, read.backup.personalAlgorithms, savedSet?.id ?? null);
    const latest = await repository.read(), state = current.current;
    if (!mounted.current || mine !== epoch.current || client.currentInstance !== instance || state.dataEpoch !== selectedEpoch || configuration(state.settings, trainer) !== configuration(snapshot, trainer) || (state.session && state.session.id !== targetSession.id)) return;
    if (latest.revision !== read.revision || (latest.backup.settings[0] && configuration(latest.backup.settings[0], trainer) !== configuration(snapshot, trainer))) throw Error('Local settings, algorithms or session changed before run start. Retry.');
    if (document.hidden || state.editing || state.reviewing || activityStore.getState().phase !== 'idle' || activityStore.getState().updateToken) throw Error('Run start deferred by activity. Close the panel and retry.');
    await repository.saveRun(planned, latest.revision);
    if (!mounted.current || mine !== epoch.current) return;
    setSelected(planned); setMessage('Run saved before any setup. Confirm the appropriate physical base for rep 1.'); await onChanged();
  }
  async function presentRep(mine: number, run: RunRecord) {
    const selectedEpoch = dataEpoch, expectedSession = session?.id, settingsKey = configuration(settings, trainer), read = await repository.read(), stored = read.backup.runs.find((value) => value.id === run.id);
    if (read.backup.settings[0] && configuration(read.backup.settings[0], trainer) !== settingsKey) throw Error('Settings changed in another tab. Refresh before resuming the frozen run.');
    if (!stored || JSON.stringify(stored) !== JSON.stringify(run)) throw Error('Run cursor changed. Reload the run before continuing.');
    if (stored.presented) throw Error('This rep was already presented. Recover it explicitly after closing the other practice tab.');
    const challenge = stored.snapshot?.challenges[stored.cursor]; if (!challenge || !stored.snapshot) throw Error('No remaining rep.');
    const now = current.current, activity = activityStore.getState();
    if (!mounted.current || mine !== epoch.current || now.dataEpoch !== selectedEpoch || now.session?.id !== expectedSession || configuration(now.settings, trainer) !== settingsKey || now.editing || now.reviewing || document.hidden || activity.phase !== 'idle' || activity.updateToken || !controller.canPresent) return;
    const target = read.backup.sessions.find((value) => value.id === stored.sessionId && value.trainer === trainer); if (!target) throw Error('Run session changed.');
    const active: RunRecord = { ...stored, status: 'active', presented: true }; await repository.saveRun(active, read.revision);
    const latest = await repository.read(), confirmed = latest.backup.runs.find((value) => value.id === active.id), after = current.current;
    if (!mounted.current || mine !== epoch.current || after.dataEpoch !== selectedEpoch || after.session?.id !== expectedSession || configuration(after.settings, trainer) !== settingsKey || after.editing || after.reviewing || document.hidden || activityStore.getState().phase !== 'idle' || activityStore.getState().updateToken || !controller.canPresent || JSON.stringify(confirmed) !== JSON.stringify(active) || (latest.backup.settings[0] && configuration(latest.backup.settings[0], trainer) !== settingsKey)) throw Error('Presentation ownership changed after saving. Recover the durably presented rep before retrying.');
    client.suspend(); setSelected(active);
    const frozen = freezeSnapshot(structuredClone(active));
    setPresentation(freezeSnapshot({ challenge, session: target, settings: stored.snapshot.settings, run: { id: stored.id, repIndex: stored.cursor, outcome: (attempt) => closeRep(frozen, attempt) } }));
  }
  const rejected = useCallback(() => { setPresentation(null); setBaseConfirmed(false); setError('DOM presentation blocked. Recover the durably presented rep before continuing.'); }, []);
  if (presentation) return <TimerPractice key={presentation.challenge.challengeId} controller={controller} presentation={presentation} onPresentationRejected={rejected}
    savedRecord={timer.phase === 'saved' ? attempts.find((attempt) => attempt.id === timer.record?.id) ?? null : undefined}
    onSaved={(attempt) => { onSaved(attempt); void repository.read().then(async ({ backup }) => { const run = backup.runs.find((run) => run.id === presentation.run?.id); if (run && mounted.current) setSelected(run); await onChanged(); }).catch((error: unknown) => setError(storageMessage(error))); }}
    onNext={() => { setPresentation(null); setBaseConfirmed(false); setMessage('Restore the appropriate base and holding frame before another setup.'); }} onReview={onReview} />;
  const active = storedSelected && (storedSelected.status === 'active' || storedSelected.status === 'interrupted') ? storedSelected : null;
  return <>
    <section className="scramble-rail" aria-label="Challenge status"><span>{trainer.toUpperCase()} Time Attack · {active ? `${active.setSnapshot.caseIds.length} frozen cases · rep ${active.cursor + 1}/${active.repPlan.length}` : `${prefs.caseIds.length}/${llLibrary(trainer).length} selected`}</span><p role="status">{message}</p></section>
    <section className="timer-canvas" aria-label="Start Time Attack">
      <p>{trainer === 'oll' ? 'Before every setup: F2L solved and aligned, LL oriented. Any legal LL permutation works. Consecutive OLL needs no PLL.' : 'Before every setup: fully solved and aligned. Finish the displayed final AUF if following it. If using another algorithm, align your physical cube instead of blindly applying the displayed AUF.'}</p>
      <p>Hold {(active?.snapshot?.frame ?? { colorOfFace: TRAINING_FRAMES[settings.crossColor] }).colorOfFace.D} down, {(active?.snapshot?.frame ?? { colorOfFace: TRAINING_FRAMES[settings.crossColor] }).colorOfFace.F} front. Completion is self-reported.</p>
      {active && <p>Run settings and guidance remain frozen, even after editing Settings or personal algorithms. {active.snapshot?.mode === 'recognition' && 'Recognition is limited to the frozen selected pool.'}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {!working && active && !active.presented && <><label className="check"><input type="checkbox" checked={baseConfirmed} onChange={(event) => setBaseConfirmed(event.target.checked)} />{base}</label><button disabled={editing || !baseConfirmed} onClick={() => void operation((mine) => presentRep(mine, active))}>Present next rep</button>
        <button disabled={editing} onClick={() => void operation(async () => { const read = await repository.read(), rep = active.repPlan[active.cursor], cursor = active.cursor + 1; if (!rep) return; const next: RunRecord = { ...active, cursor, presented: false, status: cursor === active.repPlan.length ? 'complete' : 'active', endedAt: cursor === active.repPlan.length ? new Date().toISOString() : null, outcomes: [...active.outcomes, { kind: 'skipped', repIndex: active.cursor, caseId: rep.caseId }] }; await repository.saveRun(next, read.revision); setSelected(next); await onChanged(); })}>Skip rep without timing</button>
        <button disabled={editing} onClick={() => { if (window.confirm('Abandon this run? Saved reps remain, but it cannot produce a successful set PB.')) void operation(async () => { const read = await repository.read(), next: RunRecord = { ...active, status: 'abandoned', endedAt: new Date().toISOString() }; await repository.saveRun(next, read.revision); setSelected(next); await onChanged(); }); }}>Abandon run</button></>}
      {!working && active?.presented && <><p>A durably presented rep cannot resume its timer. Close other practice tabs, then recover it as interrupted without inventing an execution time.</p><button disabled={editing} onClick={() => void operation(async () => { const read = await repository.read(), current = read.backup.runs.find((run) => run.id === active.id); if (!current || JSON.stringify(current) !== JSON.stringify(active)) throw Error('Run changed. Reload it first.'); const recovered = recoverRun(current, read.backup.attempts.filter((attempt) => attempt.runId === current.id).reduce((latest, attempt) => attempt.endedAt > latest ? attempt.endedAt : latest, new Date().toISOString())); await repository.saveRun(recovered, read.revision); setSelected(recovered); await onChanged(); })}>Recover presented rep as interrupted</button></>}
      {!working && !active && <><button disabled={editing || resumable.length > 0} onClick={() => void operation(startRun)}>Start {trainer.toUpperCase()} run</button>{resumable.map((run) => <button disabled={editing} key={run.id} onClick={() => { setSelected(run); setBaseConfirmed(false); setMessage('Run loaded. Confirm the frozen base before continuing; no timer resumes.'); }}>Resume {run.setSnapshot.label} · {run.cursor}/{run.repPlan.length}</button>)}</>}
      {working && <p role="status">Validating and saving frozen run data…</p>}
      {!working && <button disabled={editing} onClick={onAlgorithms}>Personal algorithms</button>}
      {storedSelected && (storedSelected.status === 'complete' || storedSelected.status === 'abandoned') && <details><summary>Run summary</summary><RunResults run={storedSelected} runs={runs} attempts={attempts} /></details>}
    </section>
  </>;
}
