import { SOLVED, type CubeEngine } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import type { Challenge, CrossDepth, Move } from '../store/records';
import type { GenerateRequest } from '../workers/protocol';
import { CrossTable, OUTER_MOVES, required, yieldWorker } from './table';
import { validateChallenge } from './validation';

export async function generateCross(request: GenerateRequest, engine: CubeEngine, table: CrossTable, check: () => void): Promise<Challenge> {
  if (request.options.trainer !== 'cross') throw new Error('Only Cross options are supported.');
  let seed = 2166136261;
  for (const char of request.seed) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  if ((seed >>> 0) === 0) seed = 1;
  function random() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }
  const depth = 1 + Math.floor(random() * request.options.K);
  let target = -1, count = 0;
  for (let i = 0; i < table.distances.length; i++) {
    if (table.distances[i] === depth && random() < 1 / ++count) target = i;
    if (i % 8192 === 0) { await yieldWorker(); check(); }
  }
  if (target < 0) throw new Error('Selected Cross depth is unavailable.');
  const randomMoves: Move[] = [];
  for (let i = 0; i < 16; i++) {
    let move = required(OUTER_MOVES[Math.floor(random() * 18)]);
    while (move.family === randomMoves.at(-1)?.family) move = required(OUTER_MOVES[Math.floor(random() * 18)]);
    randomMoves.push(move);
  }
  const randomized = engine.apply(SOLVED, randomMoves);
  const restoreCross = table.solve(table.coordinate(engine, randomized), random);
  const toTarget = invertMoves(table.solve(target, random));
  const scramble = [...randomMoves, ...restoreCross, ...toTarget];
  const start = engine.apply(SOLVED, scramble);
  // Find the reveal from the actual final state, independently of the construction suffix.
  const solution = table.solve(table.coordinate(engine, start), random);
  await yieldWorker(); check();
  return validateChallenge({ challengeId: crypto.randomUUID(), requestId: request.requestId, epoch: request.epoch, versions: request.versions,
    frame: request.frame, options: request.options, scramble, start, proof: { kind: 'cross-optimal', depth: depth as CrossDepth, solution } }, engine, table);
}
