import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { crossClient } from '../cross/client';
import { OneClient } from '../cross-one/client';
import { ONE_VERSIONS } from '../cross-one/model';
import { TRAINING_FRAMES } from '../cube/frame';
import { activityStore } from '../pwa/activity';
import { defaultOneOptions, type AttemptRecord, type SessionRecord, type SettingsRecord } from '../store/records';
import type { Repository } from '../store/repository';
import { freezeSnapshot, TimerController, type Presentation } from '../timer/controller';
import { TimerPractice } from './TimerPractice';

interface Props {
  repository: Repository; dataEpoch: number; settings: SettingsRecord; session?: SessionRecord; editing: boolean; reviewing?: boolean;
  attempts: AttemptRecord[]; onSession: (session: SessionRecord) => void;
  onSaved: (attempt: AttemptRecord) => void; onReview: (attempt: AttemptRecord) => void;
}
function configuration(settings: SettingsRecord) {
  const one = settings.lastOptions.cross1;
  const cross = settings.lastOptions.cross;
  return JSON.stringify([settings.defaultTrainer, settings.crossColor, settings.defaultTrainer === 'cross1' ? one?.trainer === 'cross1' ? one : defaultOneOptions : { trainer: 'cross', K: cross?.trainer === 'cross' ? cross.K : 4 }, settings.inspectionMode, settings.audibleWarnings]);
}
export function CrossPractice({ repository, dataEpoch, settings, session, editing, reviewing = false, attempts, onSession, onSaved, onReview }: Props) {
  const [controller] = useState(() => new TimerController(repository)), [oneClient] = useState(() => new OneClient());
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [working, setWorking] = useState(false), [message, setMessage] = useState('Ready to practice.'), [error, setError] = useState('');
  const [baseConfirmed, setBaseConfirmed] = useState(false);
  const epoch = useRef(0), request = useRef<string | null>(null), mounted = useRef(true);
  const current = useRef({ settings, session, editing, reviewing, dataEpoch });
  useEffect(() => { current.current = { settings, session, editing, reviewing, dataEpoch }; }, [settings, session, editing, reviewing, dataEpoch]);
  const timerState = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const isOne = settings.defaultTrainer === 'cross1', label = isOne ? 'Cross+1' : 'Cross';
  const one = settings.lastOptions.cross1?.trainer === 'cross1' ? settings.lastOptions.cross1 : defaultOneOptions;
  const K = isOne ? one.K : settings.lastOptions.cross?.trainer === 'cross' ? settings.lastOptions.cross.K : 4;
  const fingerprint = JSON.stringify([configuration(settings), session?.id, dataEpoch]);
  const previous = useRef(fingerprint);
  const cancel = useCallback(() => {
    epoch.current++; if (request.current) crossClient.cancel(request.current); oneClient.suspend(); request.current = null;
  }, [oneClient]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; cancel(); };
  }, [cancel]);
  useEffect(() => {
    if (previous.current === fingerprint) return;
    previous.current = fingerprint; cancel();
    if (!controller.blocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentation(null); setWorking(false); setBaseConfirmed(false); setMessage('Settings or session changed. Start a fresh challenge.');
    }
  }, [fingerprint, controller, cancel]);
  useEffect(() => {
    const suspend = () => {
      const phase = activityStore.getState().phase;
      if (request.current && (reviewing || (phase !== 'idle' && phase !== 'editing'))) {
        cancel(); setWorking(false); setMessage('Generation suspended. Retry with the same options.');
      }
    };
    suspend(); return activityStore.subscribe(suspend);
  }, [reviewing, cancel]);
  async function start() {
    if (working || !controller.canPresent || editing || document.hidden || activityStore.getState().updateToken || (isOne && !baseConfirmed)) return;
    const myEpoch = ++epoch.current, id = crypto.randomUUID(); request.current = id;
    const snapshot = structuredClone(settings), selectedK = K, selectedOptions = structuredClone(one), selectedEpoch = dataEpoch;
    setPresentation(null); setWorking(true); setBaseConfirmed(false); setError(''); setMessage(`Initializing ${label} model…`);
    try {
      let selected = session;
      if (!selected) {
        selected = { id: crypto.randomUUID(), trainer: isOne ? 'cross1' : 'cross', label: `${label} practice`, createdAt: new Date().toISOString() };
        await repository.saveSession(selected);
        previous.current = JSON.stringify([configuration(snapshot), selected.id, selectedEpoch]);
        onSession(selected);
      }
      if (!mounted.current || myEpoch !== epoch.current) return;
      const targetSession = selected;
      let challenge: Presentation['challenge'], instance: string;
      if (isOne) {
        if (!oneClient.ready) await oneClient.initialize();
        if (!mounted.current || myEpoch !== epoch.current) return;
        instance = oneClient.workerInstance;
        setMessage('Finding a verified Cross+1 challenge. K and L stay at your selected ceilings…');
        const result = await oneClient.generate({ kind: 'generate', protocol: 1, requestId: id, epoch: myEpoch, workerInstance: instance, versions: ONE_VERSIONS,
          frame: { crossColor: snapshot.crossColor, colorOfFace: { ...TRAINING_FRAMES[snapshot.crossColor] } }, options: selectedOptions, seed: crypto.randomUUID(), budget: { timeMs: 5000, maxNodes: 10000 } });
        if (!mounted.current || myEpoch !== epoch.current || oneClient.currentInstance !== instance) return;
        // Revalidate the full returned state in the cancellable generation worker.
        challenge = await oneClient.validateChallenge(result.challenge);
      } else {
        const verified = await crossClient.generate(id, myEpoch, selectedK, snapshot.crossColor, (completed, total) => {
          if (mounted.current && myEpoch === epoch.current) setMessage(`Building verified Cross table: ${completed} / ${total} coordinates`);
        });
        challenge = verified.challenge; instance = verified.instance;
      }
      if (!mounted.current || myEpoch !== epoch.current) return;
      setMessage(`${label} verified. Waiting until practice can be presented…`);
      while (mounted.current && myEpoch === epoch.current) {
        if ((isOne ? oneClient.currentInstance : crossClient.workerInstance) !== instance) throw new Error(`${label} worker changed before presentation. Retry with the same options.`);
        let now = current.current, activity = activityStore.getState();
        if (configuration(now.settings) !== configuration(snapshot) || now.session?.id !== targetSession.id || now.dataEpoch !== selectedEpoch) return;
        if (!document.hidden && !now.editing && activity.phase === 'idle' && !activity.updateToken && controller.canPresent) {
          const stored = await repository.read();
          if (!mounted.current || myEpoch !== epoch.current) return;
          if (!stored.backup.sessions.some((s) => s.id === targetSession.id && s.trainer === targetSession.trainer)) throw new Error('The selected session changed before presentation. Choose a current session and retry.');
          const persisted = stored.backup.settings[0];
          if (persisted && configuration(persisted) !== configuration(snapshot)) throw new Error('Settings changed in another tab. Refresh settings and retry.');
          // Reads yield. Recheck every presentation lock and generation identity afterward.
          now = current.current; activity = activityStore.getState();
          if ((isOne ? oneClient.currentInstance : crossClient.workerInstance) !== instance) throw new Error('Generation worker changed before presentation. Retry.');
          if (configuration(now.settings) !== configuration(snapshot) || now.session?.id !== targetSession.id || now.dataEpoch !== selectedEpoch) return;
          if (!document.hidden && !now.editing && activity.phase === 'idle' && !activity.updateToken && controller.canPresent) {
            request.current = null;
            // Snapshot is verified and accepted before this deliberate suspension. No later worker-ID check.
            if (isOne) oneClient.suspend();
            setPresentation(freezeSnapshot({ challenge, session: targetSession, settings: { inspectionMode: snapshot.inspectionMode, audibleWarnings: snapshot.audibleWarnings } })); setWorking(false); return;
          }
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }
    } catch (reason) {
      if (mounted.current && myEpoch === epoch.current) { setError(reason instanceof Error ? reason.message : `${label} generation failed.`); setMessage('No challenge presented. Retry keeps your selected caps and pair goal.'); setWorking(false); request.current = null; }
    }
  }
  const rejectPresentation = useCallback(() => {
    setPresentation(null); setWorking(false); setError('Presentation was blocked before the DOM commit. Close dialogs or wait for the update, then retry. No preparation was timed.');
  }, []);
  function next() {
    if (isOne) { setPresentation(null); setBaseConfirmed(false); setMessage('Reset the entire physical cube to solved before the next scramble.'); }
    else void start();
  }
  if (presentation) return <TimerPractice key={presentation.challenge.challengeId} controller={controller} presentation={presentation}
    savedRecord={timerState.phase === 'saved' ? attempts.find((a) => a.id === timerState.record?.id) ?? null : undefined}
    onSaved={onSaved} onNext={next} onReview={onReview} onPresentationRejected={rejectPresentation} />;
  return <>
    <section className="scramble-rail" aria-label="Challenge status"><span>{label} · Maximum Cross {K} HTM{isOne ? ` · Combined cap ${one.L} HTM · ${one.pair.kind === 'any' ? 'Any pair' : one.pair.slot}` : ''} · {settings.crossColor}</span><p role="status">{message}</p></section>
    <section className="timer-canvas" aria-label={`Start ${label} practice`}><div className="clock" aria-hidden="true">--.--</div>
      {isOne ? <><p>Before every scramble, reset the entire cube to fully solved. A solved Cross or Cross plus one pair is not enough. Hold {TRAINING_FRAMES[settings.crossColor].D} down, {TRAINING_FRAMES[settings.crossColor].F} front.</p>
        <p>Solve Cross and {one.pair.kind === 'any' ? 'any one pair' : `the ${one.pair.slot} pair`}. K bounds independent Cross depth; L bounds a verified found solution, not the global optimum. Desktop and touch-emulation ranges are provisional.</p>
        {!working && <label className="check"><input type="checkbox" checked={baseConfirmed} onChange={(event) => setBaseConfirmed(event.target.checked)} />My cube is fully solved and held in the displayed frame.</label>}</>
        : <><p>Begin with the {settings.crossColor} Cross solved and aligned to its side centers. A fully solved cube also works. Solve only the Cross.</p><p>Each scramble has optimal Cross depth 1 through {K}, not necessarily {K}. A half turn counts as one move.</p></>}
      <p>Stopping is your own completion report. The app does not observe physical moves.</p>
      {error && <p role="alert" className="error">{error}</p>}
      {working ? <button onClick={() => { cancel(); setWorking(false); setMessage('Generation cancelled. No challenge presented. Retry keeps your options.'); }}>Cancel generation</button>
        : <button disabled={editing || (isOne && !baseConfirmed)} onClick={() => void start()}>{error ? `Retry ${label} practice` : `Start ${label} practice`}</button>}
    </section>
  </>;
}
