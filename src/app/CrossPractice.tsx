import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { crossClient } from '../cross/client';
import { activityStore } from '../pwa/activity';
import type { AttemptRecord, SessionRecord, SettingsRecord } from '../store/records';
import type { Repository } from '../store/repository';
import { freezeSnapshot, TimerController, type Presentation } from '../timer/controller';
import { TimerPractice } from './TimerPractice';

interface Props {
  repository: Repository; dataEpoch: number; settings: SettingsRecord; session?: SessionRecord; editing: boolean;
  attempts: AttemptRecord[]; onSession: (session: SessionRecord) => void;
  onSaved: (attempt: AttemptRecord) => void; onReview: (attempt: AttemptRecord) => void;
}
export function CrossPractice({ repository, dataEpoch, settings, session, editing, attempts, onSession, onSaved, onReview }: Props) {
  const [controller] = useState(() => new TimerController(repository));
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [working, setWorking] = useState(false), [message, setMessage] = useState('Ready to practice only the Cross.'), [error, setError] = useState('');
  const epoch = useRef(0), request = useRef<string | null>(null), mounted = useRef(true);
  const current = useRef({ settings, session, editing }); useEffect(() => { current.current = { settings, session, editing }; }, [settings, session, editing]);
  const timerState = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const option = settings.lastOptions.cross;
  const K = option?.trainer === 'cross' ? option.K : 4;
  const fingerprint = JSON.stringify([settings.defaultTrainer, settings.crossColor, K, settings.inspectionMode, settings.audibleWarnings, session?.id, dataEpoch]);
  const previous = useRef(fingerprint);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (request.current) crossClient.cancel(request.current); };
  }, []);
  useEffect(() => {
    if (previous.current === fingerprint) return;
    previous.current = fingerprint; epoch.current++; if (request.current) crossClient.cancel(request.current); request.current = null;
    // Toolbar/dialog changes are blocked until interruption/save recovery finishes.
    if (!controller.blocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentation(null); setWorking(false); setMessage('Settings or session changed. Start a fresh Cross challenge.');
    }
  }, [fingerprint, controller]);
  async function start() {
    if (working || !controller.canPresent || editing || document.hidden || activityStore.getState().updateToken) return;
    const myEpoch = ++epoch.current, id = crypto.randomUUID(); request.current = id;
    const snapshot = structuredClone(settings), selectedK = K;
    setPresentation(null); setWorking(true); setError(''); setMessage('Initializing Cross table…');
    try {
      let selected = session;
      if (!selected) {
        selected = { id: crypto.randomUUID(), trainer: 'cross', label: 'Cross practice', createdAt: new Date().toISOString() };
        await repository.saveSession(selected);
        // Session creation is part of this request, not user reconfiguration.
        previous.current = JSON.stringify([snapshot.defaultTrainer, snapshot.crossColor, selectedK, snapshot.inspectionMode, snapshot.audibleWarnings, selected.id, dataEpoch]);
        onSession(selected);
      }
      if (!mounted.current || myEpoch !== epoch.current) return;
      const targetSession = selected;
      const verified = await crossClient.generate(id, myEpoch, selectedK, snapshot.crossColor, (completed, total) => {
        if (mounted.current && myEpoch === epoch.current) setMessage(`Building verified Cross table: ${completed} / ${total} coordinates`);
      });
      if (!mounted.current || myEpoch !== epoch.current) return;
      const challenge = verified.challenge;
      const stored = await repository.read();
      if (!mounted.current || myEpoch !== epoch.current) return;
      if (!stored.backup.sessions.some((s) => s.id === targetSession.id && s.trainer === 'cross')) throw new Error('The selected session changed before presentation. Choose a current session and retry.');
      const persisted = stored.backup.settings[0];
      if (persisted && JSON.stringify([persisted.defaultTrainer, persisted.crossColor, persisted.lastOptions.cross?.trainer === 'cross' ? persisted.lastOptions.cross.K : 4, persisted.inspectionMode, persisted.audibleWarnings]) !== JSON.stringify([snapshot.defaultTrainer, snapshot.crossColor, selectedK, snapshot.inspectionMode, snapshot.audibleWarnings])) throw new Error('Settings changed in another tab. Refresh settings and retry.');
      setMessage('Cross verified. Waiting until practice can be presented…');
      // A result may arrive during a dialog, backgrounding, update handshake or stop guard.
      // Do not mount TimerPractice until its post-commit presentation can be accepted.
      while (mounted.current && myEpoch === epoch.current) {
        if (crossClient.workerInstance !== verified.instance) throw new Error('Cross worker changed before presentation. Retry with the same settings.');
        const now = current.current, activity = activityStore.getState();
        if (now.settings.defaultTrainer !== 'cross' || now.settings.crossColor !== snapshot.crossColor || now.session?.id !== targetSession.id) return;
        if (!document.hidden && !now.editing && activity.phase === 'idle' && !activity.updateToken && controller.canPresent) {
          request.current = null; setPresentation(freezeSnapshot({ challenge, session: targetSession, settings: { inspectionMode: snapshot.inspectionMode, audibleWarnings: snapshot.audibleWarnings } })); setWorking(false); return;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 50));
      }
    } catch (reason) {
      if (mounted.current && myEpoch === epoch.current) { setError(reason instanceof Error ? reason.message : 'Cross generation failed.'); setMessage('No challenge presented. Retry keeps your selected maximum depth.'); setWorking(false); request.current = null; }
    }
  }
  const rejectPresentation = useCallback(() => {
    setPresentation(null); setWorking(false); setError('Presentation was blocked before the DOM commit. Close dialogs or wait for the update, then retry. No preparation was timed.');
  }, []);
  if (presentation) return <TimerPractice key={presentation.challenge.challengeId} controller={controller} presentation={presentation}
    savedRecord={timerState.phase === 'saved' ? attempts.find((a) => a.id === timerState.record?.id) ?? null : undefined}
    onSaved={onSaved} onNext={() => void start()} onReview={onReview} onPresentationRejected={rejectPresentation} />;
  return <>
    <section className="scramble-rail" aria-label="Challenge status"><span>Cross · Maximum {K} HTM · {settings.crossColor}</span><p role="status">{message}</p></section>
    <section className="timer-canvas" aria-label="Start Cross practice"><div className="clock" aria-hidden="true">--.--</div>
      <p>Begin with the {settings.crossColor} Cross solved and aligned to its side centers. A fully solved cube also works. Solve only the Cross.</p>
      <p>Each scramble has optimal Cross depth 1 through {K}, not necessarily {K}. A half turn counts as one move. Stopping is your own completion report.</p>
      {error && <p role="alert" className="error">{error}</p>}
      {working ? <button onClick={() => { epoch.current++; if (request.current) crossClient.cancel(request.current); request.current = null; setWorking(false); setMessage('Generation cancelled. No challenge presented.'); }}>Cancel generation</button>
        : <button disabled={editing || settings.defaultTrainer !== 'cross'} onClick={() => void start()}>{error ? 'Retry Cross practice' : 'Start Cross practice'}</button>}
    </section>
  </>;
}
