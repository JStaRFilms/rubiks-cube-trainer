import type { CubeEngine, CubeStateV1 } from '../cube/engine';
import { CROSS_VERSIONS, CrossTable, OUTER_MOVES, required, yieldWorker } from '../cross/table';
import type { Slot } from '../store/records';

export const SLOTS: readonly Slot[] = ['FR', 'FL', 'BR', 'BL'];
export const ONE_VERSIONS = { ...CROSS_VERSIONS, tables: `${CROSS_VERSIONS.tables}+cross1-construction-search-v1-pair576-max-v1` };
const corners = [4, 5, 7, 6], edges = [8, 9, 10, 11];

// Pair distances deliberately ignore the Cross. They never prove combined completion.
export class OneModel {
  readonly cornerTransitions: Uint8Array[];
  readonly pairTransitions: Uint16Array[];
  readonly pairGoals = corners.map((corner, i) => corner * 3 * 24 + required(edges[i]) * 2);
  readonly pairDistances = SLOTS.map(() => new Uint8Array(576).fill(255));
  constructor(readonly engine: CubeEngine, readonly cross: CrossTable) {
    this.cornerTransitions = OUTER_MOVES.map((move) => {
      const data = required(engine.puzzle.defaultPattern().applyAlg(`${move.family}${move.amount === 2 ? '2' : move.amount === -1 ? "'" : ''}`).patternData.CORNERS);
      const result = new Uint8Array(24);
      for (let dest = 0; dest < 8; dest++) for (let orientation = 0; orientation < 3; orientation++) {
        result[required(data.pieces[dest]) * 3 + orientation] = dest * 3 + (orientation + required(data.orientation[dest])) % 3;
      }
      return result;
    });
    this.pairTransitions = OUTER_MOVES.map((_, move) => Uint16Array.from({ length: 576 }, (_, code) =>
      required(required(this.cornerTransitions[move])[Math.floor(code / 24)]) * 24 + required(required(cross.transitions[move])[code % 24])));
  }
  async initialize(check: () => void): Promise<void> {
    for (let slot = 0; slot < 4; slot++) {
      const distances = required(this.pairDistances[slot]), queue = [required(this.pairGoals[slot])]; distances[required(queue[0])] = 0;
      for (let head = 0; head < queue.length; head++) for (const transition of this.pairTransitions) {
        const current = required(queue[head]), next = required(transition[current]);
        if (distances[next] === 255) { distances[next] = required(distances[current]) + 1; queue.push(next); }
      }
      if (queue.length !== 576) throw new Error('Pair lower-bound graph is incomplete.');
      await yieldWorker(); check();
    }
  }
  project(state: CubeStateV1): { cross: number; pairs: number[] } {
    const pattern = this.engine.fromState(state), c = required(pattern.patternData.CORNERS), e = required(pattern.patternData.EDGES);
    return { cross: this.cross.coordinate(this.engine, state), pairs: corners.map((piece, i) => {
      const corner = c.pieces.indexOf(piece), edge = e.pieces.indexOf(required(edges[i]));
      return (corner * 3 + required(c.orientation[corner])) * 24 + edge * 2 + required(e.orientation[edge]);
    }) };
  }
  permitted(slot: Slot | null): number[] { return slot === null ? [0, 1, 2, 3] : [SLOTS.indexOf(slot)]; }
  goal(cross: number, pairs: readonly number[], slot: Slot | null): boolean {
    return cross === this.cross.goal && this.permitted(slot).some((i) => pairs[i] === this.pairGoals[i]);
  }
  bound(cross: number, pairs: readonly number[], slot: Slot | null): number {
    const pair = Math.min(...this.permitted(slot).map((i) => required(required(this.pairDistances[i])[required(pairs[i])])));
    return Math.max(required(this.cross.distances[cross]), pair);
  }
  get byteLength(): number { return this.cross.byteLength + this.cornerTransitions.reduce((n, t) => n + t.byteLength, 0) + this.pairTransitions.reduce((n, t) => n + t.byteLength, 0) + this.pairDistances.reduce((n, t) => n + t.byteLength, 0); }
}
