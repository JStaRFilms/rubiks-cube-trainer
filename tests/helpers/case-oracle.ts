import type { Move } from '../../src/store/records';
import { geometricConjugate, geometricPermutation, geometry } from './cube-geometry';

export const solved = 'URFDLB'.split('').map((f) => f.repeat(9)).join('');
export const llIndices = geometry.filter((s) => s.position[1] === 1 && s.position.filter((v) => v !== 0).length >= 2).map((s) => s.index);
export const lowerIndices = geometry.filter((s) => s.position[1] < 1 && s.position.filter((v) => v !== 0).length >= 2).map((s) => s.index);
const normals: Record<string, readonly number[]> = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
export function indices(name: string): number[] {
  const pos = [0, 1, 2].map((axis) => [...name].reduce((sum, face) => sum + (normals[face]?.[axis] ?? 0), 0));
  return [...name].map((face) => {
    const found = geometry.find((s) => s.label === face && s.position.every((v, i) => v === pos[i]));
    if (!found) throw Error('Bad oracle piece.');
    return found.index;
  });
}
const perms = new Map<string, number[]>();
export function permutation(moves: readonly Move[]): number[] {
  let result = Array.from({ length: 54 }, (_, i) => i);
  for (const move of moves) {
    let p = perms.get(move.family);
    if (!p) { p = geometricPermutation(move.family); perms.set(move.family, p); }
    for (let n = 0; n < (move.amount === -1 ? 3 : move.amount); n++) result = p.map((from) => result[from] ?? -1);
  }
  return result;
}
export function replay(state: string, moves: readonly Move[]): string { return permutation(moves).map((from) => state[from]).join(''); }
function normalizingMoves(state: string): Move[] {
  const queue: Move[][] = [[]], seen = new Set<string>();
  while (queue.length) {
    const moves = queue.shift(); if (!moves) break;
    const turned = replay(state, moves), centers = [4, 13, 22, 31, 40, 49].map((i) => turned[i]).join('');
    if (centers === 'URFDLB') return moves;
    if (seen.has(centers)) continue;
    seen.add(centers);
    for (const family of ['x', 'y', 'z'] as const) queue.push([...moves, { family, amount: 1 }]);
  }
  throw Error('Bad oracle centers.');
}
export function normalize(state: string): string { return replay(state, normalizingMoves(state)); }
export function normalizedPermutation(moves: readonly Move[]): number[] {
  return permutation([...moves, ...normalizingMoves(replay(solved, moves))]);
}
export function oracleKey(trainer: 'f2l' | 'oll' | 'pll', state: string): string {
  const keys: string[] = [], normalized = normalize(state);
  for (const yaw of trainer === 'f2l' ? [0] : [0, 1, 2, 3]) {
    let turned = geometricConjugate(normalized, yaw);
    for (let u = 0; u < 4; u++) {
      if (trainer === 'oll') keys.push(llIndices.map((i) => turned[i] === 'U' ? '1' : '0').join(''));
      else if (trainer === 'pll') keys.push(llIndices.map((i) => turned[i]).join(''));
      else {
        const targets = ['DFR', 'FR'].map((piece) => {
          const labels = [...piece].sort().join('');
          const location = geometry.filter((s) => {
            const at = geometry.filter((t) => t.position.every((v, i) => v === s.position[i]));
            return at.map((t) => turned[t.index]).sort().join('') === labels;
          });
          return location.map((s) => `${s.index}=${turned[s.index]}`).join(',');
        });
        keys.push(targets.join('|'));
      }
      turned = replay(turned, [{ family: 'U', amount: 1 }]);
    }
  }
  return keys.sort()[0] ?? '';
}
export function permutations(items: number[]): number[][] {
  if (!items.length) return [[]];
  return items.flatMap((item) => permutations(items.filter((v) => v !== item)).map((rest) => [item, ...rest]));
}
function parity(p: number[]): number {
  return p.reduce((sum, v, i) => sum + p.slice(i + 1).filter((other) => other < v).length, 0) % 2;
}
const corners = ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'];
const edges = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'];
function writePiece(chars: string[], location: string, piece: string, orientation = 0): void {
  indices(location).forEach((index, i) => { chars[index] = piece[(i + orientation) % piece.length] ?? ''; });
}
export function llBases(): string[] {
  const result: string[] = [];
  for (const cp of permutations([0, 1, 2, 3])) for (const ep of permutations([0, 1, 2, 3])) {
    if (parity(cp) !== parity(ep)) continue;
    const chars = [...solved];
    cp.forEach((from, to) => writePiece(chars, corners[to] ?? '', corners[from] ?? ''));
    ep.forEach((from, to) => writePiece(chars, edges[to] ?? '', edges[from] ?? ''));
    result.push(chars.join(''));
  }
  return result;
}
export function llOrientations(): string[] {
  const result: string[] = [];
  for (let c = 0; c < 27; c++) for (let e = 0; e < 8; e++) {
    const co = [c % 3, Math.floor(c / 3) % 3, Math.floor(c / 9) % 3]; co.push((6 - co.reduce((a, b) => a + b, 0)) % 3);
    const eo = [e % 2, Math.floor(e / 2) % 2, Math.floor(e / 4) % 2]; eo.push(eo.reduce((a, b) => a + b, 0) % 2);
    const chars = [...solved];
    co.forEach((ori, i) => writePiece(chars, corners[i] ?? '', corners[i] ?? '', ori));
    eo.forEach((ori, i) => writePiece(chars, edges[i] ?? '', edges[i] ?? '', ori));
    result.push(chars.join(''));
  }
  return result;
}
export function pairPlacements(): string[] {
  const result: string[] = [];
  for (const c of [0, 1, 2, 3, 4]) for (let co = 0; co < 3; co++) for (const e of [0, 1, 2, 3, 8]) for (let eo = 0; eo < 2; eo++) {
    const cp = Array.from({ length: 8 }, (_, i) => i), ep = Array.from({ length: 12 }, (_, i) => i);
    cp[c] = 4; cp[4] = c; ep[e] = 8; ep[8] = e;
    if (parity(cp) !== parity(ep)) {
      const free = [0, 1, 2, 3].filter((i) => i !== e), a = free[0], b = free[1];
      if (a === undefined || b === undefined) throw Error('No parity repair.');
      const old = ep[a]; ep[a] = ep[b] ?? -1; ep[b] = old ?? -1;
    }
    const cRepair = [0, 1, 2, 3].find((i) => i !== c), eRepair = [0, 1, 2, 3].find((i) => i !== e);
    const chars = [...solved];
    cp.forEach((from, to) => writePiece(chars, corners[to] ?? '', corners[from] ?? '', to === c ? co : to === cRepair ? (3 - co) % 3 : 0));
    ep.forEach((from, to) => writePiece(chars, edges[to] ?? '', edges[from] ?? '', to === e ? eo : to === eRepair ? eo : 0));
    result.push(chars.join(''));
  }
  return result;
}
