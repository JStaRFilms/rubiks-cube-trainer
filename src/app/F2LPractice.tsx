import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { F2LClient } from '../f2l/client';
import { defaultF2LPreferences } from '../f2l/model';
import { QUARTERS, SLOTS } from '../cases/identity';
import { TRAINING_FRAMES } from '../cube/frame';
import { activityStore } from '../pwa/activity';
import type { AttemptRecord, PersonalAlgorithmRecord, SessionRecord, SettingsRecord } from '../store/records';
import type { Repository } from '../store/repository';
import { freezeSnapshot, TimerController, type Presentation } from '../timer/controller';
import { TimerPractice } from './TimerPractice';
interface Props {
  repository: Repository; dataEpoch: number; settings: SettingsRecord; session?: SessionRecord; editing: boolean; reviewing: boolean;
  algorithms: PersonalAlgorithmRecord[]; attempts: AttemptRecord[]; onSession: (session: SessionRecord) => void;
  onSaved: (attempt: AttemptRecord) => void; onReview: (attempt: AttemptRecord) => void; onAlgorithms: () => void;
}
function configuration(settings: SettingsRecord) { return JSON.stringify([settings.defaultTrainer, settings.crossColor, settings.f2lPractice ?? defaultF2LPreferences, settings.inspectionMode, settings.audibleWarnings]); }
function pick<T>(values: readonly T[]): T {
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  if (random === undefined) throw Error('Random selection unavailable.');
  const value = values[Math.floor(random / 0x100000000 * values.length)];
  if (value === undefined) throw Error('Empty F2L selection.'); return value;
}
export function F2LPractice({ repository, dataEpoch, settings, session, editing, reviewing, algorithms, attempts, onSession, onSaved, onReview, onAlgorithms }: Props) {
  const [controller] = useState(() => new TimerController(repository)), [client] = useState(() => new F2LClient());
  const [presentation, setPresentation] = useState<Presentation | null>(null), [working, setWorking] = useState(false);
  const [baseConfirmed, setBaseConfirmed] = useState(false), [message, setMessage] = useState('Ready to practice.'), [error, setError] = useState('');
  const epoch = useRef(0), pending = useRef(false), mounted = useRef(true), current = useRef({ settings, session, editing, reviewing, dataEpoch, algorithms });
  useEffect(() => { current.current = { settings, session, editing, reviewing, dataEpoch, algorithms }; }, [settings, session, editing, reviewing, dataEpoch, algorithms]);
  const timerState = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const preferences = settings.f2lPractice ?? defaultF2LPreferences, fingerprint = JSON.stringify([configuration(settings), session?.id, dataEpoch]);
  const previous = useRef(fingerprint), algorithmKey = JSON.stringify(algorithms), previousAlgorithms = useRef(algorithmKey);
  const cancel = useCallback(() => { epoch.current++; pending.current = false; client.suspend(); }, [client]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; cancel(); }; }, [cancel]);
  useEffect(() => {
    if (previous.current === fingerprint) return;
    previous.current = fingerprint; cancel();
    if (!controller.blocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentation(null); setWorking(false); setBaseConfirmed(false); setMessage('Settings or session changed. Confirm the base for a fresh challenge.');
    }
  }, [fingerprint, controller, cancel]);
  useEffect(() => {
    if (previousAlgorithms.current === algorithmKey) return;
    previousAlgorithms.current = algorithmKey;
    if (pending.current) {
      cancel();
      setWorking(false); setBaseConfirmed(false); setMessage('Algorithms changed. Confirm the base and retry.');
    }
  }, [algorithmKey, cancel]);
  useEffect(() => {
    const suspend = () => {
      const phase = activityStore.getState().phase;
      if (pending.current && (reviewing || (phase !== 'idle' && phase !== 'editing'))) { cancel(); setWorking(false); setMessage('Generation suspended. Confirm the base and retry.'); }
    };
    suspend(); return activityStore.subscribe(suspend);
  }, [reviewing, cancel]);
  async function start() {
    if (working || !baseConfirmed || editing || document.hidden || !controller.canPresent || activityStore.getState().updateToken) return;
    const myEpoch = ++epoch.current, id = crypto.randomUUID(), snapshot = structuredClone(settings), selectedEpoch = dataEpoch;
    const prefs = snapshot.f2lPractice ?? defaultF2LPreferences;
    pending.current = true; setWorking(true); setPresentation(null); setBaseConfirmed(false); setError(''); setMessage('Initializing the verified 41-case F2L library…');
    try {
      let selected = session;
      if (!selected) {
        selected = { id: crypto.randomUUID(), trainer: 'f2l', label: 'F2L practice', createdAt: new Date().toISOString() };
        await repository.saveSession(selected);
        if (!mounted.current || myEpoch !== epoch.current) return;
        previous.current = JSON.stringify([configuration(snapshot), selected.id, selectedEpoch]); onSession(selected);
      }
      const targetSession = selected;
      await client.initialize();
      if (!mounted.current || myEpoch !== epoch.current) return;
      const stored = await repository.read();
      if (!mounted.current || myEpoch !== epoch.current) return;
      const selectedAlgorithms = stored.backup.personalAlgorithms, instance = client.workerInstance;
      const challenge = await client.generate({ requestId: id, epoch: myEpoch, frame: { crossColor: snapshot.crossColor, colorOfFace: { ...TRAINING_FRAMES[snapshot.crossColor] } },
        caseId: pick(prefs.caseIds), slot: prefs.slotMode === 'FR' ? 'FR' : pick(SLOTS), hint: prefs.hint, mode: prefs.mode, preAuf: prefs.preAuf === 'random' ? pick(QUARTERS) : prefs.preAuf }, selectedAlgorithms);
      if (!mounted.current || myEpoch !== epoch.current) return;
      setMessage('F2L verified. Waiting until practice can be presented…');
      while (mounted.current && myEpoch === epoch.current) {
        if (client.currentInstance !== instance) throw Error('F2L worker changed before presentation. Retry.');
        let now = current.current, activity = activityStore.getState();
        if (configuration(now.settings) !== configuration(snapshot) || now.session?.id !== targetSession.id || now.dataEpoch !== selectedEpoch) return;
        if (!document.hidden && !now.editing && activity.phase === 'idle' && !activity.updateToken && controller.canPresent) {
          const latest = await repository.read();
          if (!mounted.current || myEpoch !== epoch.current) return;
          if (!latest.backup.sessions.some((value) => value.id === targetSession.id && value.trainer === 'f2l')) throw Error('F2L session changed before presentation. Retry.');
          if (latest.backup.settings[0] && configuration(latest.backup.settings[0]) !== configuration(snapshot)) throw Error('Settings changed in another tab. Refresh and retry.');
          if (JSON.stringify(latest.backup.personalAlgorithms) !== JSON.stringify(selectedAlgorithms)) throw Error('Personal algorithms changed before presentation. Retry.');
          now = current.current; activity = activityStore.getState();
          if (client.currentInstance !== instance) throw Error('F2L worker changed before presentation. Retry.');
          if (configuration(now.settings) !== configuration(snapshot) || now.session?.id !== targetSession.id || now.dataEpoch !== selectedEpoch) return;
          if (!document.hidden && !now.editing && activity.phase === 'idle' && !activity.updateToken && controller.canPresent) {
            pending.current = false; client.suspend();
            setPresentation(freezeSnapshot({ challenge, session: targetSession, settings: { inspectionMode: snapshot.inspectionMode, audibleWarnings: snapshot.audibleWarnings } })); setWorking(false); return;
          }
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }
    } catch (reason) {
      if (mounted.current && myEpoch === epoch.current) { pending.current = false; client.suspend(); setWorking(false); setError(reason instanceof Error ? reason.message : 'F2L generation failed.'); setMessage('No challenge presented. Confirm the base and retry with the same options.'); }
    }
  }
  const rejectPresentation = useCallback(() => { setPresentation(null); setWorking(false); setError('Presentation was blocked before DOM commit. Confirm the base and retry. No preparation was timed.'); }, []);
  function next() { setPresentation(null); setBaseConfirmed(false); setMessage('Restore Cross and all four pairs before the next setup. LL may vary.'); }
  if (presentation) return <><TimerPractice key={presentation.challenge.challengeId} controller={controller} presentation={presentation}
    savedRecord={timerState.phase === 'saved' ? attempts.find((value) => value.id === timerState.record?.id) ?? null : undefined}
    onSaved={onSaved} onNext={next} onReview={onReview} onPresentationRejected={rejectPresentation} />
    {timerState.phase === 'saved' && <button className="status-button" onClick={onAlgorithms}>Personal algorithms</button>}</>;
  return <>
    <section className="scramble-rail" aria-label="Challenge status"><span>F2L · {preferences.caseIds.length}/41 selected · {preferences.slotMode === 'FR' ? 'FR only' : 'Random slot'} · {preferences.mode} · hint {preferences.hint ? 'shown' : 'hidden'}</span><p role="status">{message}</p></section>
    <section className="timer-canvas" aria-label="Start F2L practice"><div className="clock" aria-hidden="true">--.--</div>
      <p>Before every setup, restore Cross and all four pairs, solved and aligned. LL may vary. A fully solved cube also works. Hold {TRAINING_FRAMES[settings.crossColor].D} down, {TRAINING_FRAMES[settings.crossColor].F} front.</p>
      <p>Solve the isolated target pair and restore Cross and all pairs. LL in the view is representative. Completion is self-reported.</p>
      {preferences.mode === 'recognition' && <p>Recognition is limited to your selected pool. Identity and guidance appear only after stopping or deliberate review.</p>}
      {!working && <label className="check"><input type="checkbox" checked={baseConfirmed} onChange={(event) => setBaseConfirmed(event.target.checked)} />My Cross and all four pairs are solved, aligned and held in the displayed frame.</label>}
      {error && <p role="alert" className="error">{error}</p>}
      {working ? <button onClick={() => { cancel(); setWorking(false); setMessage('Generation cancelled. Confirm the base and retry.'); }}>Cancel generation</button> : <><button disabled={editing || !baseConfirmed} onClick={() => void start()}>{error ? 'Retry F2L practice' : 'Start F2L practice'}</button><button disabled={editing} onClick={onAlgorithms}>Personal algorithms</button></>}
    </section>
  </>;
}
