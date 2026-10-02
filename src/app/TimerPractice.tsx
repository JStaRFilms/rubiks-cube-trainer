import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { activityStore } from '../pwa/activity';
import { canonicalText, invertMoves } from '../cube/notation';
import { effectiveExecution, formatMs } from '../statistics/attempts';
import { emergencyExport, freezeSnapshot, type Presentation, type TimerController } from '../timer/controller';
import type { AttemptRecord } from '../store/records';
import { llEntry } from '../ll/model';
import { auf } from '../cases/identity';
import { f2lEntry, SLOT_YAWS } from '../f2l/model';
import { F2LCaseView } from './F2LCaseView';

export interface TimerPracticeProps {
  controller: TimerController;
  presentation: Presentation;
  onSaved?: (attempt: AttemptRecord) => void;
  onNext: () => void;
  onReview?: (attempt: AttemptRecord) => void;
  savedRecord?: AttemptRecord | null;
  onPresentationRejected?: () => void;
}
export function TimerPractice({ controller, presentation, onSaved, onNext, onReview, savedRecord, onPresentationRejected }: TimerPracticeProps) {
  // One mounted component represents one presentation. Later settings cannot rewrite it.
  const [snapshot] = useState(() => ({ ...presentation, challenge: freezeSnapshot(structuredClone(presentation.challenge)),
    settings: freezeSnapshot(structuredClone(presentation.settings)), session: freezeSnapshot(structuredClone(presentation.session)) }));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [committed, setCommitted] = useState(false), [, redraw] = useState(0);
  const timer = useRef<HTMLButtonElement>(null), result = useRef<HTMLHeadingElement>(null);
  const audio = useRef<AudioContext | null>(null), notified = useRef<string | null>(null);
  const release = useRef<{ pointer: number | null; space: boolean }>({ pointer: null, space: false });
  const unlockSound = useCallback(() => {
    if (!snapshot.settings.audibleWarnings) return;
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch { /* Visual warnings remain available. */ }
  }, [snapshot.settings.audibleWarnings]);
  useEffect(() => {
    function ownsSpace(target: EventTarget | null) {
      const activity = activityStore.getState();
      if (document.hidden || document.querySelector('dialog[open]') || activity.phase === 'editing' || activity.updateToken) return false;
      return !(target instanceof Element) || timer.current?.contains(target) || !target.closest('input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"], twisty-player');
    }
    function down(event: KeyboardEvent) {
      if (timer.current && event.target instanceof Node && timer.current.contains(event.target)) delete timer.current.dataset.pointerFocus;
      if (event.code !== 'Space' || event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !controller.active || !ownsSpace(event.target)) return;
      event.preventDefault();
      if (event.repeat || release.current.space || release.current.pointer !== null) return;
      unlockSound(); if (controller.press('space')) release.current.space = true;
    }
    function up(event: KeyboardEvent) {
      if (event.code !== 'Space' || !release.current.space) return;
      event.preventDefault(); release.current.space = false;
      if (ownsSpace(event.target)) controller.release('space'); else controller.cancelInput('space');
    }
    function cancelSpace() {
      if (!release.current.space) return;
      release.current.space = false; controller.cancelInput('space');
    }
    function focusChanged(event: FocusEvent) {
      if (!ownsSpace(event.target)) cancelSpace();
    }
    document.addEventListener('keydown', down); document.addEventListener('keyup', up);
    document.addEventListener('focusin', focusChanged); window.addEventListener('blur', cancelSpace);
    return () => {
      document.removeEventListener('keydown', down); document.removeEventListener('keyup', up);
      document.removeEventListener('focusin', focusChanged); window.removeEventListener('blur', cancelSpace);
      cancelSpace();
    };
  }, [controller, unlockSound]);
  useLayoutEffect(() => {
    const accepted = controller.present(snapshot);
    // Presentation must follow the DOM commit, not render or worker completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCommitted(accepted);
    if (accepted && document.visibilityState === 'hidden') controller.interrupt();
    if (!accepted) onPresentationRejected?.();
    return () => { controller.interrupt('cancelled'); };
  }, [controller, snapshot, onPresentationRejected]);
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
  const elapsed = controller.elapsed(), record = state.phase === 'saved' && savedRecord !== undefined ? savedRecord : state.record;
  const deleted = state.phase === 'saved' && savedRecord === null;
  const inspecting = state.phase === 'inspection' || (state.phase === 'arming' && snapshot.settings.inspectionMode === '15s');
  const late = elapsed.inspection >= 17000 ? 'DNF on start' : elapsed.inspection >= 15000 ? '+2 on start' : '';
  const instruction = deleted ? 'This attempt is no longer in saved history' : state.phase === 'preparation' ? snapshot.settings.inspectionMode === '15s' ? 'Scramble, then tap to inspect' : 'Scramble, then hold to arm'
    : state.phase === 'arming' ? state.armed ? 'Armed. Release to start' : 'Keep holding'
    : state.phase === 'inspection' ? 'Hold, then release to start'
    : state.phase === 'execution' ? 'Tap to stop'
    : state.phase === 'save-pending' ? 'Saving attempt…'
    : state.phase === 'save-failed' ? 'Not saved. Keep this tab open.' : state.phase === 'saved' ? 'Saved on this device' : 'Attempt discarded';
  const display = deleted ? 'Removed' : record ? record.timing.status === 'interrupted' ? 'Interrupted' : record.penalty.kind === 'dnf' ? 'DNF' : formatMs(effectiveExecution(record))
    : state.phase === 'execution' ? formatMs(elapsed.execution)
    : inspecting ? formatMs(late ? elapsed.inspection - 15000 : 15000 - elapsed.inspection) : '0.000';
  const canNext = state.phase === 'saved' && controller.canPresent;
  const llOptions = snapshot.challenge.options.trainer === 'oll' || snapshot.challenge.options.trainer === 'pll' ? snapshot.challenge.options : null;
  const ll = llOptions ? llEntry(llOptions.trainer === 'oll' ? 'oll' : 'pll', llOptions.caseId) : null;
  const revealLL = llOptions?.mode === 'execution' ? state.phase !== 'execution' : record?.timing.status === 'completed';
  const f2lOptions = snapshot.challenge.options.trainer === 'f2l' ? snapshot.challenge.options : null;
  const f2l = f2lOptions ? f2lEntry(f2lOptions.caseId) : null;
  const revealF2L = f2lOptions?.mode === 'execution' ? state.phase !== 'execution' : record?.timing.status === 'completed';
  const hint = f2lOptions ? ({ 0: 'No rotation needed for FR view', 1: "Requested FR view: y'", 2: 'Requested FR view: y2', 3: 'Requested FR view: y' } as const)[SLOT_YAWS[f2lOptions.slot]] : '';
  function cancelPointer(id: number) {
    controller.cancelInput(`pointer:${id}`); if (release.current.pointer === id) release.current.pointer = null;
  }
  return <>
    <section className="scramble-rail" aria-label="Presented challenge">
      <span>{llOptions ? `${llOptions.trainer.toUpperCase()} · ${llOptions.trainer === 'oll' ? 'Base: F2L solved and aligned, LL oriented; permutation may vary' : 'Base: fully solved and aligned, including final AUF'} · rep ${(snapshot.run?.repIndex ?? 0) + 1}` : f2lOptions ? `Solve the isolated ${f2lOptions.slot} pair · Base: Cross and all four pairs solved and aligned before each setup` : snapshot.challenge.options.trainer === 'cross1' ? `Solve Cross and ${snapshot.challenge.options.pair.kind === 'any' ? 'any one pair' : `the ${snapshot.challenge.options.pair.slot} pair`} · Base: fully solved cube before each scramble` : 'Solve only Cross · Base: solved, aligned Cross'} · Hold {snapshot.challenge.frame.colorOfFace.D} down, {snapshot.challenge.frame.colorOfFace.F} front</span>
      <p>{canonicalText(snapshot.challenge.scramble)}</p>
      {llOptions && <><F2LCaseView state={snapshot.challenge.start} frame={snapshot.challenge.frame} label={llOptions.trainer === 'oll' ? 'Representative last-layer cube net. Permutation may differ on your physical cube.' : 'Last-layer model from the confirmed solved base. Not a camera observation.'} /><span>{llOptions.trainer === 'oll' ? 'Representative permutation, not observed. Orient LL and preserve F2L; no PLL required between reps.' : 'Model from the confirmed solved base, not observed physical stickers.'}</span>
        {ll && revealLL && snapshot.challenge.proof.kind === 'case' && <div className="f2l-guidance"><span>{llOptions.trainer.toUpperCase()} {ll.label} · {ll.family} · Speeden source {ll.sourceLabel}</span><p>Frozen guidance, includes return regrip if needed: {canonicalText(snapshot.challenge.proof.solution)}</p><span>{llOptions.trainer === 'pll' && `Required final AUF after this guide: ${canonicalText(auf(snapshot.challenge.proof.finalAuf)) || 'None'}. If using a different algorithm, align the physical cube instead of blindly applying this AUF.`}</span></div>}
      </>}
      {f2lOptions && <><F2LCaseView state={snapshot.challenge.start} frame={snapshot.challenge.frame} />
        <span>Representative LL, not observed physical pieces. {f2lOptions.hint && `${hint}. View hint requested, no physical turn recorded. Not an extra setup move; guidance starts in the displayed frame.`}</span>
        {f2l && revealF2L && snapshot.challenge.proof.kind === 'case' && <div className="f2l-guidance"><span>F2L {f2l.label} · {f2l.family} · Lieberkind numbering, Speeden default source {f2l.sourceLabel}</span><span>{JSON.stringify(snapshot.challenge.proof.solution) === JSON.stringify(invertMoves(snapshot.challenge.scramble)) ? 'Shown guidance matches the sourced default.' : 'Validated alternate guidance, frozen at presentation.'}</span><p>Guidance: {canonicalText(snapshot.challenge.proof.solution)}</p></div>}
      </>}
    </section>
    <section className="timer-canvas" aria-label="Practice timer">
      {!committed && <p role="alert">This challenge cannot start while another attempt, unsaved record or update is active.</p>}
      <button ref={timer} className={`timer-input ${state.armed ? 'armed' : ''}`} disabled={!committed || !controller.active}
        aria-label={`${snapshot.settings.inspectionMode === '15s' ? '15 second inspection' : 'Untimed'} timer. ${instruction}`}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || release.current.pointer !== null || release.current.space) return;
          // Prevented pointer defaults can leave programmatic focus matching :focus-visible.
          event.preventDefault(); event.currentTarget.dataset.pointerFocus = 'true'; event.currentTarget.focus(); unlockSound();
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
        onBlur={(event) => { delete event.currentTarget.dataset.pointerFocus; controller.cancelInput(); release.current.space = false; release.current.pointer = null; }}
        onClick={(event) => { if (event.detail === 0) { unlockSound(); controller.action(); } }}>
        <span className={`clock ${deleted || display.length > 7 ? 'long-clock' : ''}`} aria-hidden="true">{display}</span>
        <span aria-hidden="true">{instruction}</span>
      </button>
      <p className="timer-announcement" role="status">{instruction}{inspecting && state.warning ? `. ${state.warning} seconds of inspection` : ''}</p>
      {inspecting && <p aria-label="Inspection countdown">{late ? `${formatMs(elapsed.inspection - 15000)} seconds overtime · ${late}` : `${((15000 - elapsed.inspection) / 1000).toFixed(1)} seconds remaining`}</p>}
      {controller.active && <><p>Space: hold/release to start; press to stop. Preparation includes scrambling and thinking.</p><button onClick={() => controller.interrupt('cancelled')}>Cancel attempt</button></>}
      {record && <div className="attempt-result">
        <h2 ref={result} tabIndex={-1}>{record.timing.status === 'interrupted' ? 'Interrupted. Excluded from successful times' : record.penalty.kind === 'dnf' ? 'DNF' : `${formatMs(effectiveExecution(record))}${record.penalty.kind === 'plus2' ? ' +2' : ''}`}</h2>
        <p>Raw execution: {formatMs(record.timing.executionMs)} · Preparation, includes scrambling: {formatMs(record.preparationMs)}</p>
        <p>Inspection: {record.timing.inspectionMs === null ? snapshot.settings.inspectionMode === 'untimed' ? 'Not used' : 'Not started' : formatMs(record.timing.inspectionMs)}</p>
        {record.challenge.proof.kind === 'combined-bound' && <p>Found solution: {record.challenge.proof.witness.length} HTM · cap {record.challenge.proof.cap} · generator solved slots {record.challenge.proof.solvedSlots.join('/')}. Not a global optimum. Pair you executed: not recorded. Reset the entire cube to fully solved before Next.</p>}
        {(record.challenge.options.trainer === 'oll' || record.challenge.options.trainer === 'pll') && <p>{record.challenge.options.trainer === 'oll' ? 'Restore F2L solved and aligned, with LL oriented before Next. Permutation may vary; no mandatory PLL.' : 'Finish final AUF if following the frozen guide, then confirm fully solved and aligned before Next. If you used another algorithm, align the physical base; do not blindly apply the displayed AUF.'}</p>}
        {record.challenge.options.trainer === 'f2l' && <p>Restore Cross and all four pairs before Next. LL may vary. Requested view hint: {record.challenge.options.hint ? 'shown' : 'hidden'}. Physical rotation: not observed.</p>}
        {record.timing.status === 'interrupted' && <p>{record.timing.phase} · {record.timing.reason}. Start fresh, never resume.</p>}
        {state.phase === 'save-failed' && <div role="alert"><p>{state.error}</p><button onClick={() => void controller.retry()}>Retry save</button><button onClick={() => {
          const url = URL.createObjectURL(new Blob([JSON.stringify(emergencyExport(record), null, 2)], { type: 'application/json' }));
          const link = document.createElement('a'); link.href = url; link.download = `UNSAVED-attempt-${record.id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Emergency export unsaved attempt</button><button onClick={() => {
          if (window.confirm('Discard this unsaved attempt? It will be lost unless you kept an emergency export.')) controller.discardUnsaved();
        }}>Discard unsaved attempt…</button></div>}
        {state.phase === 'saved' && <><button disabled={!canNext} onClick={onNext}>Next challenge</button>{onReview && <button onClick={() => onReview(record)}>Review attempt</button>}</>}
      </div>}
      {deleted && <button disabled={!canNext} onClick={onNext}>Next challenge</button>}
      {state.phase === 'idle' && committed && <button disabled={!controller.canPresent} onClick={onNext}>New challenge</button>}
    </section>
  </>;
}
