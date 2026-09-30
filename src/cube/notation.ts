import { Alg, Commutator, Conjugate, Grouping, Move as AlgMove, Newline, LineComment } from 'cubing/alg';
import type { Move } from '../store/records';
export const families = ['U', 'R', 'F', 'D', 'L', 'B', 'Uw', 'Rw', 'Fw', 'Dw', 'Lw', 'Bw', 'M', 'E', 'S', 'x', 'y', 'z'] as const;
export const MAX_MOVES = 10000;
const MAX_EXPANSION_WORK = 1000000;
function restricted(move: AlgMove): Move {
  const raw = move.family;
  const alias = /^[urfdlb]$/.test(raw) ? `${raw.toUpperCase()}w` : raw;
  const family = families.find((f) => f === alias);
  if (!family || move.quantum.innerLayer !== null || move.quantum.outerLayer !== null || ![1, 2, -1, -2].includes(move.amount)) throw new Error(`Unsupported 3×3 move: ${move.toString()}`);
  return { family, amount: move.amount === -2 ? 2 : move.amount === -1 ? -1 : move.amount === 2 ? 2 : 1 };
}
function expandedSize(alg: Alg, depth: number): { size: number; work: number } {
  if (depth > 32) throw new Error('Notation nesting exceeds 32.');
  // Count each Alg entry and node visit, including empty operands revisited by expansion.
  let size = 0, work = 1;
  for (const node of alg.childAlgNodes()) {
    work++;
    if (node instanceof AlgMove) { restricted(node); size++; }
    else if (node instanceof Grouping) {
      if (!Number.isSafeInteger(node.amount) || Math.abs(node.amount) > MAX_MOVES || node.experimentalNISSPlaceholder) throw new Error('Unsupported group repetition.');
      const child = expandedSize(node.alg, depth + 1), repetitions = Math.abs(node.amount);
      if (child.size === 0 && repetitions > 1) throw new Error('Repeated empty groups are not supported.');
      size += child.size * repetitions; work += child.work * repetitions;
    } else if (node instanceof Commutator || node instanceof Conjugate) {
      const a = expandedSize(node.A, depth + 1), b = expandedSize(node.B, depth + 1), bVisits = node instanceof Commutator ? 2 : 1;
      size += 2 * a.size + bVisits * b.size; work += 2 * a.work + bVisits * b.work;
    } else if (node instanceof Newline || node instanceof LineComment) size++;
    else throw new Error('Pauses and vendor-only notation are not supported.');
    if (size > MAX_MOVES) throw new Error('Expanded notation exceeds 10,000 moves or annotation nodes.');
    if (work > MAX_EXPANSION_WORK) throw new Error('Notation expansion work exceeds 1,000,000 visits.');
  }
  return { size, work };
}
export function parseNotation(text: string): Move[] {
  if (new TextEncoder().encode(text).length > 65536) throw new Error('Notation exceeds 64 KiB.');
  let depth = 0;
  for (const char of text.replace(/\/\/[^\n]*/g, '')) {
    if (char === '(' || char === '[') { if (++depth > 32) throw new Error('Notation nesting exceeds 32.'); }
    else if (char === ')' || char === ']') depth--;
  }
  const alg = new Alg(text);
  expandedSize(alg, 0);
  const moves: Move[] = [];
  for (const node of alg.experimentalExpand()) {
    if (node instanceof AlgMove) moves.push(restricted(node));
    else if (!(node instanceof Newline || node instanceof LineComment)) throw new Error('Unsupported notation.');
  }
  return moves;
}
export function canonicalText(moves: readonly Move[]): string {
  return moves.map((move) => `${move.family}${move.amount === -1 ? "'" : move.amount === 2 ? '2' : ''}`).join(' ');
}
export function invertMoves(moves: readonly Move[]): Move[] {
  return [...moves].reverse().map((move) => ({ family: move.family, amount: move.amount === 2 ? 2 : move.amount === 1 ? -1 : 1 }));
}
export function decodeMoves(value: unknown): Move[] {
  if (!Array.isArray(value) || value.length > MAX_MOVES) throw new Error('Invalid move list.');
  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object' || !('family' in item) || !('amount' in item)) throw new Error('Invalid move.');
    const family = families.find((f) => f === item.family), amount = item.amount;
    if (!family || (amount !== 1 && amount !== 2 && amount !== -1)) throw new Error('Invalid restricted move.');
    return { family, amount };
  });
}
