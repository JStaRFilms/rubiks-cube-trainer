import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { canonicalText } from '../cube/notation';
import { effectiveExecution, formatMs } from '../statistics/attempts';
import { emergencyExport, freezeSnapshot, type Presentation, type TimerController } from '../timer/controller';
import type { AttemptRecord } from '../store/records';

export interface TimerPracticeProps {
  controller: TimerController;
  presentation: Presentation;
  onSaved?: (attempt: AttemptRecord) => void;
  onNext: () => void;
  onReview?: (attempt: AttemptRecord) => void;
}
export function TimerPractice({ controller, presentation, onSaved, onNext, onReview }: TimerPracticeProps) {
  // One mounted component represents one presentation. Later settings cannot rewrite it.
  const [snapshot] = useState(() => ({ ...presentation, challenge: freezeSnapshot(structuredClone(presentation.challenge)),
    settings: freezeSnapshot(structuredClone(presentation.settings)), session: freezeSnapshot(structuredClone(presentation.session)) }));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [committed, setCommitted] = useState(false), [, redraw] = useState(0);
  const timer = useRef<HTMLButtonElement>(null), result = useRef<HTMLHeadingElement>(null);
  const audio = useRef<AudioContext | null>(null), notified = useRef<string | null>(null);
  const release = useRef<{ pointer: number | null; space: boolean }>({ pointer: null, space: false });
  useLayoutEffect(() => {
    const accepted = controller.present(snapshot);
    // Presentation must follow the DOM commit, not render or worker completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommitted(accepted);
    if (accepted && document.visibilityState === 'hidden') controller.interrupt();
    return () => { controller.interrupt('cancelled'); };
  }, [controller, snapshot]);
  useEffect(() => {
    let frame = 0;
    function draw() { controller.tick(); redraw((n) => n + 1); frame = requestAnimationFrame(draw); }
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, [controller]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === 'hidden') controller.interrupt(); };
    const pagehide = () => controller.interrupt();
    const unload = (event: BeforeUnloadEvent) => { if (controller.blocked) { event.preventDefault(); event.returnValue = ''; } };
    document.addEventListener('visibilitychange', hidden); window.addEventListener('pagehide', pagehide); window.addEventListener('beforeunload', unload);
    return () => { document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', pagehide); window.removeEventListener('beforeunload', unload); };
  }, [controller]);
  useEffect(() => {
    if (state.phase === 'saved' || state.phase === 'save-failed') result.current?.focus();
    if (state.phase === 'saved' && state.record && notified.current !== state.record.id) {
      notified.current = state.record.id; onSaved?.(state.record);
    }
  }, [state.phase, state.record, onSaved]);
  useEffect(() => {
    const context = audio.current;
    if (!state.warning || !snapshot.settings.audibleWarnings || !context || context.state !== 'running') return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.frequency.value = state.warning === 8 ? 660 : 880; gain.gain.value = 0.08;
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.15);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }, [state.warning, snapshot.settings.audibleWarnings]);
  useEffect(() => () => { void audio.current?.close(); }, []);
  function unlockSound() {
    if (!snapshot.settings.audibleWarnings) return;
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch { /* Visual warnings remain available. */ }
  }
  const elapsed = controller.elapsed(), record = state.record;
  const inspecting = state.phase === 'inspection' || (state.phase === 'arming' && snapshot.settings.inspectionMode === '15s');
  const late = elapsed.inspection >= 17000 ? 'DNF on start' : elapsed.inspection >= 15000 ? '+2 on start' : '';
  const instruction = state.phase === 'preparation' ? snapshot.settings.inspectionMode === '15s' ? 'Scramble, then tap to inspect' : 'Scramble, then hold to arm'
    : state.phase === 'arming' ? state.armed ? 'Armed. Release to start' : 'Keep holding'
    : state.phase === 'inspection' ? 'Hold, then release to start'
    : state.phase === 'execution' ? 'Tap to stop'
    : state.phase === 'save-pending' ? 'Saving attempt…'
    : state.phase === 'save-failed' ? 'Not saved. Keep this tab open.' : state.phase === 'saved' ? 'Saved on this device' : 'Attempt discarded';
  const display = record ? record.timing.status === 'interrupted' ? 'Interrupted' : record.penalty.kind === 'dnf' ? 'DNF' : formatMs(effectiveExecution(record))
    : state.phase === 'execution' ? formatMs(elapsed.execution)
    : inspecting ? formatMs(late ? elapsed.inspection - 15000 : 15000 - elapsed.inspection) : '0.000';
  const canNext = state.phase === 'saved' && controller.canPresent;
  function cancelPointer(id: number) {
    controller.cancelInput(`pointer:${id}`); if (release.current.pointer === id) release.current.pointer = null;
  }
  return <>
    <section className="scramble-rail" aria-label="Presented challenge">
      <span>{snapshot.session.trainer} · Hold {snapshot.challenge.frame.colorOfFace.D} down, {snapshot.challenge.frame.colorOfFace.F} front</span>
      <p>{canonicalText(snapshot.challenge.scramble)}</p>
    </section>
    <section className="timer-canvas" aria-label="Practice timer">
      {!committed && <p role="alert">This challenge cannot start while another attempt, unsaved record or update is active.</p>}
      <button ref={timer} className={`timer-input ${state.armed ? 'armed' : ''}`} disabled={!committed || !controller.active}
        aria-label={`${snapshot.settings.inspectionMode === '15s' ? '15 second inspection' : 'Untimed'} timer. ${instruction}`}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || release.current.pointer !== null || release.current.space) return;
          event.preventDefault(); event.currentTarget.focus(); unlockSound();
          if (controller.press(`pointer:${event.pointerId}`)) { release.current.pointer = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); }
        }}
        onPointerUp={(event) => {
          if (release.current.pointer !== event.pointerId) return;
          event.preventDefault(); release.current.pointer = null; controller.release(`pointer:${event.pointerId}`);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => cancelPointer(event.pointerId)} onLostPointerCapture={(event) => cancelPointer(event.pointerId)}
        onPointerMove={(event) => {
          if (release.current.pointer !== event.pointerId) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cancelPointer(event.pointerId);
        }}
        onKeyDown={(event) => {
          if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          event.preventDefault(); if (event.repeat || release.current.space || release.current.pointer !== null) return;
          unlockSound(); if (controller.press('space')) release.current.space = true;
        }}
        onKeyUp={(event) => {
          if (event.code !== 'Space') return;
          event.preventDefault(); if (!release.current.space) return;
          release.current.space = false; controller.release('space');
        }}
        onBlur={() => { controller.cancelInput(); release.current.space = false; release.current.pointer = null; }}
        onClick={(event) => { if (event.detail === 0) { unlockSound(); controller.action(); } }}>
        <span className={`clock ${display.length > 7 ? 'long-clock' : ''}`} aria-hidden="true">{display}</span>
        <span aria-hidden="true">{instruction}</span>
      </button>
      <p className="timer-announcement" role="status">{instruction}{inspecting && state.warning ? `. ${state.warning} seconds of inspection` : ''}</p>
      {inspecting && <p aria-label="Inspection countdown">{late ? `${formatMs(elapsed.inspection - 15000)} seconds overtime · ${late}` : `${((15000 - elapsed.inspection) / 1000).toFixed(1)} seconds remaining`}</p>}
      {controller.active && <><p>Space: hold/release to start; press to stop. Preparation includes scrambling and thinking.</p><button onClick={() => controller.interrupt('cancelled')}>Cancel attempt</button></>}
      {record && <div className="attempt-result">
        <h2 ref={result} tabIndex={-1}>{record.timing.status === 'interrupted' ? 'Interrupted. Excluded from successful times' : record.penalty.kind === 'dnf' ? 'DNF' : `${formatMs(effectiveExecution(record))}${record.penalty.kind === 'plus2' ? ' +2' : ''}`}</h2>
        <p>Raw execution: {formatMs(record.timing.executionMs)} · Preparation, includes scrambling: {formatMs(record.preparationMs)}</p>
        <p>Inspection: {record.timing.inspectionMs === null ? snapshot.settings.inspectionMode === 'untimed' ? 'Not used' : 'Not started' : formatMs(record.timing.inspectionMs)}</p>
        {record.timing.status === 'interrupted' && <p>{record.timing.phase} · {record.timing.reason}. Start fresh, never resume.</p>}
        {state.phase === 'save-failed' && <div role="alert"><p>{state.error}</p><button onClick={() => void controller.retry()}>Retry save</button><button onClick={() => {
          const url = URL.createObjectURL(new Blob([JSON.stringify(emergencyExport(record), null, 2)], { type: 'application/json' }));
          const link = document.createElement('a'); link.href = url; link.download = `UNSAVED-attempt-${record.id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Emergency export unsaved attempt</button><button onClick={() => {
          if (window.confirm('Discard this unsaved attempt? It will be lost unless you kept an emergency export.')) controller.discardUnsaved();
        }}>Discard unsaved attempt…</button></div>}
        {state.phase === 'saved' && <><button disabled={!canNext} onClick={onNext}>Next challenge</button>{onReview && <button onClick={() => onReview(record)}>Review attempt</button>}</>}
      </div>}
      {state.phase === 'idle' && committed && <button disabled={!controller.canPresent} onClick={onNext}>New challenge</button>}
    </section>
  </>;
}
