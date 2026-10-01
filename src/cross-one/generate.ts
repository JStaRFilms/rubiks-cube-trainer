import { SOLVED } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import { OUTER_MOVES, required } from '../cross/table';
import type { Move, Slot } from '../store/records';
import type { GenerateRequest } from '../workers/protocol';
import { OneModel, SLOTS } from './model';
import { OneFailure, searchOne, WorkBudget } from './search';
import { checkRequest, type OneChallenge, validateOne } from './validation';

export type Strategy = 'construction' | 'random-search';
export interface OneResult {
  challenge: OneChallenge;
  witnessSlot: Slot;
  metrics: { strategy: Strategy; candidates: number; accepted: number; nodes: number; elapsedMs: number; tailLength: number };
}
export async function generateOne(request: GenerateRequest, model: OneModel, budget: WorkBudget, strategy: Strategy = 'construction'): Promise<OneResult> {
  checkRequest(request);
  if (request.options.trainer !== 'cross1') throw new OneFailure('unsupported-options', 'Cross+1 required.');
  const options = request.options, engine = model.engine, started = performance.now();
  let seed = 2166136261;
  for (const char of request.seed) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  if ((seed >>> 0) === 0) seed = 1;
  const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
  const pick = <T>(values: readonly T[]): T => required(values[Math.floor(random() * values.length)]);
  const requestedSlot = options.pair.kind === 'slot' ? options.pair.slot : null;
  let candidates = 0;
  while (true) {
    budget.consume(); candidates++;
    const target = requestedSlot ?? pick(SLOTS), background: Move[] = [];
    let goal = SOLVED;
    if (strategy === 'construction') {
      // Project-authored short triggers, accepted only if they preserve the complete target goal.
      // This changes unrelated pieces without requiring any external algorithm inventory.
      for (let i = 0; i < 8; i++) {
        budget.consume();
        const u: Move = { family: 'U', amount: pick([1, 2, -1] as const) };
        const face = pick(['R', 'L', 'F', 'B'] as const), amount = pick([1, -1] as const);
        const trigger: Move[] = random() < .25 ? [u] : [{ family: face, amount }, u, { family: face, amount: amount === 1 ? -1 : 1 }];
        const next = engine.apply(goal, trigger);
        if (engine.crossSolved(next) && engine.pairSolved(next, target)) { goal = next; background.push(...trigger); }
      }
    }
    const length = strategy === 'construction' ? 1 + Math.floor(random() * options.L) : 16;
    const tail: Move[] = [];
    for (let i = 0; i < length; i++) {
      const choices = OUTER_MOVES.filter((move) => move.family !== tail.at(-1)?.family);
      tail.push({ ...pick(choices) });
    }
    const scramble = [...background, ...tail], start = engine.apply(SOLVED, scramble), projected = model.project(start);
    const crossDepth = required(model.cross.distances[projected.cross]);
    await budget.yield();
    if (crossDepth > options.K || model.goal(projected.cross, projected.pairs, requestedSlot)) continue;
    const witness = strategy === 'construction' ? invertMoves(tail) : await searchOne(model, start, requestedSlot, options.L, budget);
    if (!witness) continue;
    const final = engine.apply(start, witness), solvedSlots = SLOTS.filter((slot) => engine.pairSolved(final, slot));
    const witnessSlot = requestedSlot ?? required(solvedSlots[0]);
    const challenge = validateOne({ challengeId: crypto.randomUUID(), requestId: request.requestId, epoch: request.epoch, versions: request.versions,
      frame: request.frame, options, scramble, start, proof: { kind: 'combined-bound', crossDepth, cap: options.L, witness, solvedSlots } }, engine, model);
    // Even a valid concrete construction witness cannot survive cancellation or an elapsed deadline.
    await budget.yield(); budget.check();
    return { challenge, witnessSlot, metrics: { strategy, candidates, accepted: 1, nodes: budget.nodes, elapsedMs: performance.now() - started, tailLength: length } };
  }
}
