import { geometricApply, geometry } from './cube-geometry';
import type { Move, Slot } from '../../src/store/records';

const edgeNames = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'];
const cornerNames = ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'];
export const oracleSolved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
function must<T>(v: T | undefined): T { if (v === undefined) throw new Error('Missing Cartesian fixture'); return v; }
export function oracleIndices(name: string): number[] {
  const normals = [...name].map((label) => must(geometry.find((s) => s.label === label && s.index % 9 === 4)).normal);
  const position = [0, 1, 2].map((axis) => normals.reduce((sum, n) => sum + must(n[axis]), 0));
  return normals.map((normal) => must(geometry.find((s) => s.position.every((v, i) => v === position[i]) && s.normal.every((v, i) => v === normal[i]))).index);
}
export const oracleEdges = edgeNames.map(oracleIndices), oracleCorners = cornerNames.map(oracleIndices);
export function oraclePieceTransitions(moves: readonly Move[], locations: readonly number[][]): number[][] {
  const size = must(locations[0]).length;
  const labeled = Array.from({ length: 54 }, (_, i) => String.fromCharCode(65 + i)).join('');
  return moves.map((move) => {
    const moved = geometricApply(labeled, move.family, move.amount);
    return Array.from({ length: locations.length * size }, (_, digit) => {
      // Production orientation means sticker identities shift left in location order.
      // Locate the first identity sticker instead of using production orbit data.
      const source = must(must(locations[Math.floor(digit / size)])[(size - digit % size) % size]);
      const destination = moved.indexOf(must(labeled[source]));
      const location = locations.findIndex((indices) => indices.includes(destination));
      const sticker = must(locations[location]).indexOf(destination);
      return location * size + (size - sticker) % size;
    });
  });
}
export function oracleReplay(state: string, moves: readonly Move[]): string { return moves.reduce((s, m) => geometricApply(s, m.family, m.amount), state); }
export function oraclePiece(state: string, name: string): boolean { return oracleIndices(name).every((i) => state[i] === oracleSolved[i]); }
export function oracleCross(state: string): boolean { return ['DF', 'DR', 'DB', 'DL'].every((name) => oraclePiece(state, name)); }
export function oraclePair(state: string, slot: Slot): boolean { return oraclePiece(state, slot) && oraclePiece(state, { FR: 'DRF', FL: 'DFL', BR: 'DBR', BL: 'DLB' }[slot]); }
export function oracleCrossCode(state: string): number {
  return ['DF', 'DR', 'DB', 'DL'].map((name) => {
    const location = oracleEdges.findIndex((indices) => indices.map((i) => state[i]).sort().join('') === [...name].sort().join(''));
    return location * 2 + (state[must(must(oracleEdges[location])[0])] === name[0] ? 0 : 1);
  }).reduce((n, digit) => n * 24 + digit, 0);
}
export function oracleDistances(moves: readonly Move[]): Uint8Array {
  const transitions = moves.map((move) => {
    const labeled = Array.from({ length: 54 }, (_, i) => String.fromCharCode(65 + i)).join('');
    const moved = geometricApply(labeled, move.family, move.amount);
    return Array.from({ length: 24 }, (_, digit) => {
      const sticker = must(must(oracleEdges[digit >> 1])[digit % 2]);
      const destination = moved.indexOf(must(labeled[sticker]));
      const location = oracleEdges.findIndex((indices) => indices.includes(destination));
      return location * 2 + must(oracleEdges[location]).indexOf(destination);
    });
  });
  const distances = new Uint8Array(24 ** 4).fill(255), queue = new Uint32Array(190080);
  const goal = oracleCrossCode(oracleSolved); distances[goal] = 0; queue[0] = goal; let tail = 1;
  for (let head = 0; head < tail; head++) {
    const code = must(queue[head]), digits = [Math.floor(code / 13824), Math.floor(code / 576) % 24, Math.floor(code / 24) % 24, code % 24];
    for (const t of transitions) {
      const next = digits.reduce((n, digit) => n * 24 + must(t[digit]), 0);
      if (distances[next] === 255) { distances[next] = must(distances[code]) + 1; queue[tail++] = next; }
    }
  }
  if (tail !== 190080) throw new Error('Independent graph incomplete');
  return distances;
}
