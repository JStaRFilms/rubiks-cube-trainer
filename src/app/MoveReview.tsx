import { useEffect, useRef, useState } from 'react';
import { loadEngine, SOLVED, type CubeEngine, type CubeStateV1 } from '../cube/engine';
import { canonicalText, parseNotation } from '../cube/notation';
import type { Challenge, Color, Move, TrainingFrame } from '../store/records';
import type { ReviewPlayer } from '../cube/player';
interface Review { setup: Move[]; moves: Move[]; start: CubeStateV1; frame: TrainingFrame }
export function MoveReview({ color, reduceMotion, challenge }: { color: Color; reduceMotion: boolean; challenge?: Challenge }) {
  const [engine, setEngine] = useState<CubeEngine | null>(null);
  const [setup, setSetup] = useState(''), [moves, setMoves] = useState('');
  const [review, setReview] = useState<Review | null>(null), [step, setStep] = useState(0);
  const [state, setState] = useState<CubeStateV1>(SOLVED), [playerState, setPlayerState] = useState<CubeStateV1 | null>(null);
  const [error, setError] = useState(''), [playerError, setPlayerError] = useState('');
  const [loading, setLoading] = useState(true), [ready, setReady] = useState(false), [playing, setPlaying] = useState(false);
  const [show3D, setShow3D] = useState(!reduceMotion), [retry, setRetry] = useState(0), [speed, setSpeed] = useState(1);
  const host = useRef<HTMLDivElement>(null), player = useRef<ReviewPlayer | null>(null), currentStep = useRef(0);
  useEffect(() => {
    let active = true;
    void loadEngine().then((value) => { if (active) { setEngine(value); setLoading(false); setError(''); if (challenge && (challenge.proof.kind === 'cross-optimal' || challenge.proof.kind === 'combined-bound')) { setReview({ setup: challenge.scramble, moves: challenge.proof.kind === 'cross-optimal' ? challenge.proof.solution : challenge.proof.witness, start: challenge.start, frame: challenge.frame }); setState(challenge.start); } } }).catch((reason: unknown) => { if (active) { setError(reason instanceof Error ? reason.message : 'Cube model initialization failed.'); setLoading(false); } });
    return () => { active = false; };
  }, [retry, challenge]);
  useEffect(() => {
    if (!review || !engine || !show3D || !host.current) return;
    const container = host.current;
    let active = true, instance: ReviewPlayer | undefined;
    setReady(false); setPlayerError(''); setPlayerState(null);
    const timer = setTimeout(() => { if (active) { active = false; instance?.dispose(); player.current = null; setReady(false); setPlaying(false); setPlayerError('3D initialization timed out. Use text steps or retry.'); } }, 15000);
    void import('../cube/player').then(async ({ ReviewPlayer }) => {
      if (!active) return;
      instance = new ReviewPlayer(engine, review.setup, review.moves, review.frame, (index, actual) => {
        if (!active) return;
        currentStep.current = index; setStep(index); setState(actual); setPlayerState(actual);
      }, (value) => { if (active) setPlaying(value); }, (message) => { if (active) { setPlayerError(message); setReady(false); } }, currentStep.current);
      player.current = instance; container.append(instance.element);
      container.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      await instance.ready;
      if (active) { clearTimeout(timer); setReady(true); }
    }).catch((reason: unknown) => { if (active) { clearTimeout(timer); instance?.dispose(); player.current = null; setPlayerError(reason instanceof Error ? reason.message : '3D initialization failed. Use text steps or retry.'); } });
    return () => { active = false; clearTimeout(timer); instance?.dispose(); player.current = null; setPlaying(false); };
  }, [review, engine, show3D, retry]);
  useEffect(() => { player.current?.speed(speed); }, [speed, ready]);
  useEffect(() => { if (reduceMotion) player.current?.pause(); }, [reduceMotion]);
  useEffect(() => {
    const pause = () => { if (document.hidden) player.current?.pause(); };
    document.addEventListener('visibilitychange', pause); return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  function jump(index: number) {
    if (!review || !engine) return;
    currentStep.current = index;
    if (!playerError) player.current?.step(index);
    setStep(index); setState(engine.apply(review.start, review.moves.slice(0, index)));
  }
  return <section className="move-review" data-timer-input="isolated" onKeyDown={(event) => event.stopPropagation()} onKeyUp={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
    {challenge?.proof.kind === 'cross-optimal' ? <><h3>Optimal Cross · {challenge.proof.depth} HTM</h3><p>Maximum requested depth {challenge.options.trainer === 'cross' ? challenge.options.K : ''}. Other pieces are representative unless you began with a fully solved cube. The app did not observe your physical completion.</p></> : challenge?.proof.kind === 'combined-bound' ? <><h3>Found solution · {challenge.proof.witness.length} HTM</h3><p>Combined cap {challenge.proof.cap}, independent Cross depth {challenge.proof.crossDepth}. Generator solved slots: {challenge.proof.solvedSlots.join('/')}. Verified upper bound, not a globally shortest solution. Pair you executed: not recorded. Begin every scramble from a fully solved cube in the saved frame. The app did not observe physical completion.</p></> : <p>Review your own setup and moves. This is not a generated challenge or a timed attempt.</p>}
    {!challenge && <form onSubmit={(event) => {
      event.preventDefault(); if (!engine) return;
      try {
        const parsedSetup = parseNotation(setup), parsedMoves = parseNotation(moves);
        const start = engine.apply(SOLVED, parsedSetup), frame = engine.frame(color);
        engine.apply(start, parsedMoves);
        player.current?.pause(); currentStep.current = 0; setReview({ setup: parsedSetup, moves: parsedMoves, start, frame }); setStep(0); setState(start); setError('');
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'Invalid notation. Current review is unchanged.'); }
    }}>
      <label>Setup<textarea aria-label="Setup" value={setup} maxLength={65536} onChange={(event) => setSetup(event.target.value)} placeholder="Moves from solved, or leave empty" /></label>
      <label>Moves<textarea aria-label="Moves" value={moves} maxLength={65536} onChange={(event) => setMoves(event.target.value)} placeholder="For example, R U R' U'" /></label>
      <p>Outer, wide, M/E/S and x/y/z moves. Groups and commutators expand before review.</p>
      <button disabled={!engine}>Validate and review</button>
    </form>}
    {loading && <p role="status">Initializing cube model…</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {!engine && !loading && <button onClick={() => { setLoading(true); setRetry((v) => v + 1); }}>Retry model</button>}
    {review && <>
      <p>Hold {review.frame.colorOfFace.D} down, {review.frame.colorOfFace.F} front. U {review.frame.colorOfFace.U}, R {review.frame.colorOfFace.R}, L {review.frame.colorOfFace.L}, B {review.frame.colorOfFace.B}.</p>
      <h3>Canonical notation</h3><p className="notation">Setup: <output data-testid="canonical-setup">{canonicalText(review.setup) || 'Solved'}</output></p>
      <p className="notation">Moves: <output data-testid="canonical-moves">{canonicalText(review.moves) || 'No moves'}</output></p>
      <p role="status">Step <output data-testid="review-step">{step}</output> of {review.moves.length} · {step === 0 ? 'Setup state' : canonicalText(review.moves.slice(step - 1, step))}</p>
      {reduceMotion && <p>Reduced motion. Automatic playback is disabled; text steps remain available.</p>}
      <label className="check"><input type="checkbox" checked={show3D} onChange={(event) => setShow3D(event.target.checked)} />Show interactive 3D</label>
      {show3D && <><div className="player-host" ref={host} onWheel={(event) => { event.preventDefault(); player.current?.zoom(event.deltaY * 0.005); }} onPointerDownCapture={(event) => player.current?.pointerDown(event.nativeEvent)} onPointerMoveCapture={(event) => player.current?.pointerMove(event.nativeEvent)} onPointerUpCapture={(event) => player.current?.pointerUp(event.nativeEvent)} onPointerCancelCapture={(event) => player.current?.pointerUp(event.nativeEvent)} />
        {!ready && !playerError && <p role="status">Initializing 3D player…</p>}
        <p>Drag to orbit. Pinch or scroll to zoom. Orbit does not change moves or holding frame.</p></>}
      {playerError && <p role="alert" className="error">{playerError} If retry fails, copy your notation and reload this page. <button onClick={() => setRetry((v) => v + 1)}>Retry 3D</button></p>}
      <div className="review-controls">
        <button disabled={step === 0} onClick={() => jump(step - 1)}>Back</button>
        <button disabled={step === review.moves.length} onClick={() => jump(step + 1)}>Forward</button>
        <button disabled={!show3D || !ready || reduceMotion || !!playerError || review.moves.length === 0} onClick={() => { if (playing) player.current?.pause(); else player.current?.play(); }}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => jump(0)}>Replay from start</button>
        <label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>{[0.25, 0.5, 1, 2, 4].map((s) => <option key={s} value={s}>{s}×</option>)}</select></label>
        {show3D && <><button disabled={!ready} onClick={() => player.current?.zoom(-0.5)}>Zoom in</button><button disabled={!ready} onClick={() => player.current?.zoom(0.5)}>Zoom out</button></>}
      </div>
      <details><summary>Current sticker state, URFDLB</summary><output data-testid="logical-state" className="wire-state">{state.facelets}</output>{show3D && playerState && <output data-testid="player-state" className="wire-state">{playerState.facelets}</output>}</details>
    </>}
  </section>;
}
