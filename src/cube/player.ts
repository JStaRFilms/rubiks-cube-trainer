import { TwistyPlayer, SimpleAlgIndexer } from 'cubing/twisty';
import { Alg } from 'cubing/alg';
import { Color as ThreeColor } from 'three/src/math/Color.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import type { Color, Face, Move, TrainingFrame } from '../store/records';
import { canonicalText } from './notation';
import { type CubeEngine, type CubeStateV1 } from './engine';
export const stickerColors: Record<Color, number> = { white: 0xffffff, yellow: 0xffff00, green: 0x00ff00, blue: 0x2266ff, red: 0xff0000, orange: 0xff9900 };
// Pinned Cube3D.ts axesInfo. Clone materials rather than changing its shared palette.
const vendorColors: Record<Face, number> = { U: 0xffffff, R: 0xff0000, F: 0x00ff00, D: 0xffff00, L: 0xff9900, B: 0x2266ff };
export function initializePlayerModule(): void {
  if (customElements.get('twisty-player') !== TwistyPlayer) throw new Error('Player module registration failed.');
}
export class ReviewPlayer {
  readonly element: TwistyPlayer;
  private readonly indexer: SimpleAlgIndexer;
  private readonly states: CubeStateV1[];
  private disposed = false;
  private initialized = false;
  private requestedStep: number;
  private navigationRevision = 0;
  private distance = 6;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance: number | null = null;
  private readonly cleanup: (() => void)[] = [];
  constructor(private readonly engine: CubeEngine, setup: readonly Move[], moves: readonly Move[], frame: TrainingFrame, private readonly changed: (step: number, state: CubeStateV1) => void, playing: (playing: boolean) => void, failed: (message: string) => void, initialStep = 0) {
    this.requestedStep = initialStep;
    this.element = new TwistyPlayer({ puzzle: '3x3x3', alg: canonicalText(moves), experimentalSetupAlg: canonicalText(setup), experimentalSetupAnchor: 'start', controlPanel: 'none', viewerLink: 'none', hintFacelets: 'none', background: 'none', experimentalDragInput: 'auto', experimentalMovePressInput: 'none', cameraDistance: this.distance });
    this.element.experimentalModel.indexerConstructorRequest.set('simple');
    this.indexer = new SimpleAlgIndexer(engine.puzzle, new Alg(canonicalText(moves)));
    this.element.timestamp = this.indexer.indexToMoveStartTimestamp(initialStep);
    let pattern = engine.puzzle.defaultPattern().applyAlg(canonicalText(setup));
    this.states = [engine.toState(pattern)];
    for (const move of moves) { pattern = pattern.applyAlg(canonicalText([move])); this.states.push(engine.toState(pattern)); }
    const model = this.element.experimentalModel;
    const patternListener = (leaves: Awaited<ReturnType<typeof model.currentLeavesSimplified.get>>) => {
      if (!this.initialized || this.disposed) return;
      const revision = this.navigationRevision;
      void model.currentPattern.get().then(async (value) => {
        const currentLeaves = await model.currentLeavesSimplified.get();
        if (this.disposed || revision !== this.navigationRevision || currentLeaves !== leaves) return;
        // CurrentPatternProp applies finishing/finished moves after the indexed base pattern.
        const step = Number(leaves.patternIndex) + leaves.movesFinishing.length + leaves.movesFinished.length, state = engine.toState(value);
        if (state.facelets !== this.states[step]?.facelets) { this.pause(); failed('Player and logical step disagree. Text review is still available.'); return; }
        changed(step, state);
      }).catch((error: unknown) => failed(error instanceof Error ? error.message : 'Player state failed.'));
    };
    const playListener = (info: Awaited<ReturnType<typeof model.playingInfo.get>>) => { if (!this.disposed) playing(info.playing); };
    model.currentLeavesSimplified.addFreshListener(patternListener); model.playingInfo.addFreshListener(playListener);
    this.cleanup.push(() => model.currentLeavesSimplified.removeFreshListener(patternListener), () => model.playingInfo.removeFreshListener(playListener));
    this.ready = this.initialize(frame);
  }
  readonly ready: Promise<void>;
  private async initialize(frame: TrainingFrame): Promise<void> {
    const object = await this.element.experimentalCurrentThreeJSPuzzleObject();
    if (this.disposed) return;
    const palette = Object.entries(vendorColors).map(([label, hex]) => ({ label, hex: new ThreeColor(hex).convertLinearToSRGB().getHex() }));
    let colored = 0, frontStickers = 0;
    object.traverse((child) => {
      if (!(child instanceof Mesh) || !(child.material instanceof MeshBasicMaterial)) return;
      const face = palette.find((entry) => entry.hex === child.material.color.getHex());
      const label = face && (['U', 'R', 'F', 'D', 'L', 'B'] as const).find((f) => f === face.label);
      if (!label) return;
      const material = child.material.clone(); material.color = new ThreeColor(stickerColors[frame.colorOfFace[label]]).convertLinearToSRGB();
      child.material = material; colored++;
      if (material.side === 0) frontStickers++;
      this.cleanup.push(() => material.dispose());
    });
    if (colored !== 108 || frontStickers !== 54) throw new Error(`Player palette mismatch: ${frontStickers} front and ${colored} total stickers. Text review is available.`);
    const canvases = await this.element.experimentalCurrentCanvases();
    if (!canvases.length) throw new Error('WebGL player did not initialize.');
    this.element.dataset.frame = JSON.stringify(frame.colorOfFace);
    while (!this.disposed) {
      const revision = this.navigationRevision, step = this.requestedStep;
      await this.element.experimentalScreenshot({ width: 16, height: 16 });
      const actual = this.engine.toState(await this.element.experimentalModel.currentPattern.get());
      if (this.disposed) return;
      if (revision !== this.navigationRevision) continue;
      if (actual.facelets !== this.states[step]?.facelets) throw new Error('Player initialization state disagrees with the logical review.');
      this.initialized = true; this.changed(step, actual); return;
    }
  }
  step(index: number): void {
    this.requestedStep = index; this.navigationRevision++;
    this.pause(); this.element.timestamp = this.indexer.indexToMoveStartTimestamp(index);
  }
  play(): void { this.element.play(); }
  pause(): void { this.element.pause(); }
  speed(value: number): void { this.element.tempoScale = value; }
  zoom(delta: number): void { this.distance = Math.max(3.5, Math.min(12, this.distance + delta)); this.element.cameraDistance = this.distance; }
  pointerDown(event: PointerEvent): void {
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 2) { this.pinchDistance = this.pointerDistance(); this.element.setPointerCapture(event.pointerId); }
  }
  pointerMove(event: PointerEvent): void {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size !== 2) return;
    event.preventDefault(); event.stopPropagation();
    const distance = this.pointerDistance();
    if (this.pinchDistance && distance) this.zoom((this.pinchDistance - distance) * 0.02);
    this.pinchDistance = distance;
  }
  private pointerDistance(): number { const [a, b] = [...this.pointers.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; }
  pointerUp(event: PointerEvent): void { this.pointers.delete(event.pointerId); this.pinchDistance = null; }
  dispose(): void { this.disposed = true; this.pause(); this.cleanup.forEach((fn) => fn()); this.element.remove(); }
}
