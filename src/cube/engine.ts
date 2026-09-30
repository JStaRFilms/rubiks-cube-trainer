import { KPattern, type KPatternData, type KPuzzle } from 'cubing/kpuzzle';
import { cube3x3x3 } from 'cubing/puzzles';
import type { Color, Face, Move, Slot, TrainingFrame } from '../store/records';
import { canonicalText, invertMoves, parseNotation } from './notation';
import { faces, pieceIndices, OLL_STICKER_INDICES } from './geometry';
export { ENGINE_VERSION } from './version';
export interface CubeStateV1 { format: 'cube3-facelets-v1'; facelets: string }
export const SOLVED: CubeStateV1 = { format: 'cube3-facelets-v1', facelets: faces.map((f) => f.repeat(9)).join('') };
// Orbit and sticker order from pinned Cube3D.ts pieceDefs. These are not durable indices.
const orbits = {
  EDGES: ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'],
  CORNERS: ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'],
  CENTERS: ['U', 'L', 'F', 'R', 'B', 'D'],
};
function parity(pieces: readonly number[]): number {
  let inversions = 0;
  pieces.forEach((a, i) => pieces.slice(i + 1).forEach((b) => { if (a > b) inversions++; }));
  return inversions % 2;
}
export class CubeEngine {
  readonly orientations: { moves: Move[]; centers: string }[] = [];
  constructor(readonly puzzle: KPuzzle) {
    const queue: Move[][] = [[]], seen = new Set<string>();
    while (queue.length) {
      const moves = queue.shift(); if (!moves) break;
      const centers = this.centerKey(this.toState(puzzle.defaultPattern().applyAlg(canonicalText(moves))));
      if (seen.has(centers)) continue;
      seen.add(centers); this.orientations.push({ moves, centers });
      for (const family of ['x', 'y', 'z'] as const) queue.push([...moves, { family, amount: 1 }]);
    }
    if (this.orientations.length !== 24) throw new Error('Cube orientation initialization failed.');
  }
  centerKey(state: CubeStateV1): string { return faces.map((_, i) => state.facelets[i * 9 + 4]).join(''); }
  toState(pattern: KPattern): CubeStateV1 {
    const result = Array<string>(54);
    for (const [orbit, names] of Object.entries(orbits)) {
      const data = pattern.patternData[orbit];
      if (!data) throw new Error('Engine orbit mismatch.');
      names.forEach((name, location) => {
        const piece = data.pieces[location], orientation = data.orientation[location];
        const source = piece === undefined ? undefined : names[piece];
        if (!source || orientation === undefined) throw new Error('Invalid engine pattern.');
        pieceIndices(name).forEach((index, sticker) => { result[index] = source[(sticker + orientation) % name.length] ?? ''; });
      });
    }
    return { format: 'cube3-facelets-v1', facelets: result.join('') };
  }
  private readPattern(state: CubeStateV1): KPattern {
    const data: KPatternData = {};
    for (const [orbit, names] of Object.entries(orbits)) {
      const pieces: number[] = [], orientation: number[] = [];
      for (const name of names) {
        const labels = pieceIndices(name).map((index) => state.facelets[index]).join('');
        let found = false;
        for (const [piece, source] of names.entries()) {
          for (let turn = 0; turn < name.length; turn++) {
            const rotated = [...source].map((_, j) => source[(j + turn) % name.length]).join('');
            if (labels === rotated) { pieces.push(piece); orientation.push(turn); found = true; break; }
          }
          if (found) break;
        }
        if (!found) throw new Error('Invalid or mirrored cubie stickers.');
      }
      if (new Set(pieces).size !== names.length) throw new Error('Duplicate cubie.');
      data[orbit] = orbit === 'CENTERS' ? { pieces, orientation, orientationMod: [1, 1, 1, 1, 1, 1] } : { pieces, orientation };
    }
    return new KPattern(this.puzzle, data);
  }
  fromState(value: unknown): KPattern {
    if (!value || typeof value !== 'object' || !('format' in value) || value.format !== SOLVED.format || !('facelets' in value) || typeof value.facelets !== 'string' || !/^[URFDLB]{54}$/.test(value.facelets)) throw new Error('Expected cube3-facelets-v1 with 54 face labels.');
    const state: CubeStateV1 = { format: 'cube3-facelets-v1', facelets: value.facelets };
    if (faces.some((face) => [...state.facelets].filter((f) => f === face).length !== 9)) throw new Error('Expected nine stickers of each face identity.');
    const pattern = this.readPattern(state);
    const rotation = this.orientations.find((o) => o.centers === this.centerKey(state));
    if (!rotation) throw new Error('Centers must form a proper rigid cube orientation.');
    const normalized = pattern.applyAlg(canonicalText(invertMoves(rotation.moves)));
    const edges = normalized.patternData.EDGES, corners = normalized.patternData.CORNERS;
    if (!edges || !corners) throw new Error('Engine orbit mismatch.');
    if (edges.orientation.reduce((a, b) => a + b, 0) % 2 || corners.orientation.reduce((a, b) => a + b, 0) % 3 || parity(edges.pieces) !== parity(corners.pieces)) throw new Error('Illegal cube orientation sum or permutation parity.');
    return pattern;
  }
  apply(state: CubeStateV1, moves: readonly Move[]): CubeStateV1 { return this.toState(this.fromState(state).applyAlg(canonicalText(moves))); }
  normalize(state: CubeStateV1): CubeStateV1 {
    const pattern = this.fromState(state), rotation = this.orientations.find((o) => o.centers === this.centerKey(state));
    if (!rotation) throw new Error('Invalid center frame.');
    return this.toState(pattern.applyAlg(canonicalText(invertMoves(rotation.moves))));
  }
  conjugate(state: CubeStateV1, yaw: 0 | 1 | 2 | 3): CubeStateV1 {
    if (!yaw) return { ...state };
    const moves = parseNotation(yaw === 1 ? 'y' : yaw === 2 ? 'y2' : "y'");
    const turned = this.apply(state, moves), turnedSolved = this.apply(SOLVED, moves);
    const relabel = new Map(faces.map((face, i) => [turnedSolved.facelets[i * 9 + 4], face]));
    return { format: SOLVED.format, facelets: [...turned.facelets].map((label) => relabel.get(label)).join('') };
  }
  slot(state: CubeStateV1, slot: Slot, inverse = false): CubeStateV1 {
    const yaw = { FR: 0, FL: 1, BR: 3, BL: 2 } as const;
    const amount = yaw[slot];
    return this.conjugate(state, inverse ? amount === 1 ? 3 : amount === 3 ? 1 : amount : amount);
  }
  crossSolved(state: CubeStateV1): boolean { return ['DF', 'DR', 'DB', 'DL'].every((name) => this.pieceSolved(this.normalize(state), name)); }
  pairSolved(state: CubeStateV1, slot: Slot): boolean {
    const normalized = this.normalize(state), corner = { FR: 'DRF', FL: 'DFL', BR: 'DBR', BL: 'DLB' }[slot];
    return this.pieceSolved(normalized, corner) && this.pieceSolved(normalized, slot);
  }
  private pieceSolved(state: CubeStateV1, name: string): boolean { return pieceIndices(name).every((i) => state.facelets[i] === SOLVED.facelets[i]); }
  ollMask(state: CubeStateV1): string { const normalized = this.normalize(state); return OLL_STICKER_INDICES.map((i) => normalized.facelets[i] === 'U' ? '1' : '0').join(''); }
  frame(crossColor: Color): TrainingFrame {
    const physical: Record<Face, Color> = { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' };
    const front: Record<Color, Color> = { white: 'green', yellow: 'green', green: 'yellow', blue: 'yellow', red: 'green', orange: 'green' };
    for (const rotation of this.orientations) {
      const labels = faces.map((_, i) => rotation.centers[i]);
      const colors = labels.map((label) => { const face = faces.find((f) => f === label); if (!face) throw new Error('Invalid orientation.'); return physical[face]; });
      if (colors[3] === crossColor && colors[2] === front[crossColor]) {
        const [U, R, F, D, L, B] = colors;
        if (!U || !R || !F || !D || !L || !B) throw new Error('Invalid frame.');
        return { crossColor, colorOfFace: { U, R, F, D, L, B } };
      }
    }
    throw new Error('Unsupported physical frame.');
  }
}
let enginePromise: Promise<CubeEngine> | undefined;
export function loadEngine(): Promise<CubeEngine> {
  return enginePromise ??= cube3x3x3.kpuzzle().then((puzzle) => new CubeEngine(puzzle)).catch((error: unknown) => { enginePromise = undefined; throw error; });
}
