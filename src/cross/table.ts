import type { CubeEngine, CubeStateV1 } from '../cube/engine';
import { ENGINE_VERSION } from '../cube/version';
import type { Face, Move, Versions } from '../store/records';

export const CROSS_COUNT = 190080;
export const TABLE_VERSION = 'cross-four-labeled-edges-v1-HTM18-frame-v1';
export const CROSS_VERSIONS: Versions = { contract: 1, engine: ENGINE_VERSION, dataset: null, tables: TABLE_VERSION };
export const TABLE_SHA256 = '28cf7e33c5fbe83584dfaf30afbe633141e76df91c14ea647f81f3fb802c853a';
export const OUTER_MOVES: Move[] = (['U', 'R', 'F', 'D', 'L', 'B'] satisfies Face[]).flatMap((family) => ([1, 2, -1] as const).map((amount) => ({ family, amount })));
export const yieldWorker = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
export function required<T>(value: T | undefined): T { if (value === undefined) throw new Error('Cross coordinate index out of bounds.'); return value; }
export async function checksum(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
// Each digit is edge location * 2 + sticker orientation. Four labels never share a location.
export function pack(a: number, b: number, c: number, d: number): number { return ((a * 24 + b) * 24 + c) * 24 + d; }
export class CrossTable {
  readonly index = new Int32Array(24 ** 4).fill(-1);
  readonly digits = new Uint8Array(CROSS_COUNT * 4);
  readonly transitions: Uint8Array[];
  readonly distances = new Uint8Array(CROSS_COUNT).fill(255);
  goal = -1;
  constructor(engine: CubeEngine) {
    this.transitions = OUTER_MOVES.map((move) => {
      const data = required(engine.puzzle.defaultPattern().applyAlg(`${move.family}${move.amount === 2 ? '2' : move.amount === -1 ? "'" : ''}`).patternData.EDGES);
      const result = new Uint8Array(24);
      for (let dest = 0; dest < 12; dest++) for (let orientation = 0; orientation < 2; orientation++) {
        result[required(data.pieces[dest]) * 2 + orientation] = dest * 2 + ((orientation + required(data.orientation[dest])) % 2);
      }
      return result;
    });
  }
  async initialize(check: () => void): Promise<void> {
    let index = 0;
    for (let a = 0; a < 24; a++) {
      for (let b = 0; b < 24; b++) {
        if ((a >> 1) === (b >> 1)) continue;
        for (let c = 0; c < 24; c++) {
          if ((c >> 1) === (a >> 1) || (c >> 1) === (b >> 1)) continue;
          for (let d = 0; d < 24; d++) {
            if ((d >> 1) === (a >> 1) || (d >> 1) === (b >> 1) || (d >> 1) === (c >> 1)) continue;
            const code = pack(a, b, c, d); this.index[code] = index;
            this.digits.set([a, b, c, d], index * 4); index++;
          }
        }
      }
      await yieldWorker(); check();
    }
    if (index !== CROSS_COUNT) throw new Error('Cross coordinate count mismatch.');
    this.goal = required(this.index[pack(8, 10, 12, 14)]);
  }
  next(index: number, move: number): number {
    const t = required(this.transitions[move]), offset = index * 4;
    return required(this.index[pack(required(t[required(this.digits[offset])]), required(t[required(this.digits[offset + 1])]), required(t[required(this.digits[offset + 2])]), required(t[required(this.digits[offset + 3])]))]);
  }
  coordinate(engine: CubeEngine, state: CubeStateV1): number {
    const edges = required(engine.fromState(state).patternData.EDGES);
    const digit = (piece: number) => { const location = edges.pieces.indexOf(piece); return location * 2 + required(edges.orientation[location]); };
    return required(this.index[pack(digit(4), digit(5), digit(6), digit(7))]);
  }
  async build(check: () => void, progress: (completed: number) => void): Promise<void> {
    if (this.goal < 0) await this.initialize(check);
    const queue = new Uint32Array(CROSS_COUNT); let head = 0, tail = 1;
    queue[0] = this.goal; this.distances.fill(255); this.distances[this.goal] = 0;
    while (head < tail) {
      const end = Math.min(head + 1024, tail);
      while (head < end) {
        const index = required(queue[head++]), depth = required(this.distances[index]) + 1;
        for (let move = 0; move < 18; move++) {
          const next = this.next(index, move);
          if (this.distances[next] === 255) { this.distances[next] = depth; queue[tail++] = next; }
        }
      }
      progress(head); await yieldWorker(); check();
    }
    if (tail !== CROSS_COUNT || this.distances.some((d) => d > 8)) throw new Error('Cross graph is incomplete.');
  }
  solve(index: number, random: () => number = () => 0): Move[] {
    const solution: Move[] = [];
    while (required(this.distances[index]) > 0) {
      const candidates = OUTER_MOVES.map((_, move) => move).filter((move) => this.distances[this.next(index, move)] === required(this.distances[index]) - 1);
      if (!candidates.length) throw new Error('Invalid Cross distance table.');
      const move = required(candidates[Math.floor(random() * candidates.length)]);
      solution.push(required(OUTER_MOVES[move])); index = this.next(index, move);
    }
    return solution;
  }
  get byteLength(): number { return this.index.byteLength + this.digits.byteLength + this.distances.byteLength + this.transitions.reduce((sum, t) => sum + t.byteLength, 0); }
}
