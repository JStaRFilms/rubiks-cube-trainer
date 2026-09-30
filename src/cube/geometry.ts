import type { Face } from '../store/records';
export const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
type Vector = readonly [number, number, number];
export const normals: Record<Face, Vector> = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
const right: Record<Face, Vector> = { U: [1, 0, 0], R: [0, 0, -1], F: [1, 0, 0], D: [1, 0, 0], L: [0, 0, 1], B: [-1, 0, 0] };
const up: Record<Face, Vector> = { U: [0, 0, -1], R: [0, 1, 0], F: [0, 1, 0], D: [0, 0, 1], L: [0, 1, 0], B: [0, 1, 0] };
export const stickers = faces.flatMap((face, f) => Array.from({ length: 9 }, (_, cell) => {
  const r = Math.floor(cell / 3), c = cell % 3;
  const position = normals[face].map((n, axis) => n + (c - 1) * (right[face][axis] ?? 0) + (1 - r) * (up[face][axis] ?? 0));
  return { face, index: f * 9 + cell, position };
}));
export function pieceIndices(name: string): number[] {
  const pieceFaces = [...name].map((label) => {
    const face = faces.find((f) => f === label);
    if (!face) throw new Error('Unknown piece label.');
    return face;
  });
  const position = [0, 1, 2].map((axis) => pieceFaces.reduce((sum, face) => sum + (normals[face][axis] ?? 0), 0));
  return pieceFaces.map((face) => {
    const sticker = stickers.find((s) => s.face === face && s.position.every((v, axis) => v === position[axis]));
    if (!sticker) throw new Error('Invalid piece geometry.');
    return sticker.index;
  });
}
// U-layer edge/corner locations, ascending URFDLB wire indices. Center U4 is excluded.
export const OLL_STICKER_INDICES = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 36, 37, 38, 45, 46, 47] as const;
