import type { CubeStateV1 } from '../cube/engine';
import { OUTER_MOVES, required, yieldWorker } from '../cross/table';
import type { Move, Slot } from '../store/records';
import { OneModel } from './model';

export type FailureCode = 'cancelled' | 'budget-exhausted' | 'unsupported-options' | 'version-mismatch' | 'invalid-result' | 'worker-crashed';
export class OneFailure extends Error {
  constructor(readonly code: FailureCode, message: string) { super(message); }
}
export class WorkBudget {
  nodes = 0;
  readonly deadline: number;
  constructor(timeMs: number, readonly maxNodes: number, readonly cancelled: () => boolean = () => false) {
    if (!Number.isFinite(timeMs) || timeMs < 0 || !Number.isSafeInteger(maxNodes) || maxNodes < 0) throw new OneFailure('unsupported-options', 'Cross+1 budgets must be finite, nonnegative, with an integer node limit.');
    this.deadline = performance.now() + timeMs;
  }
  check(): void {
    if (this.cancelled()) throw new OneFailure('cancelled', 'Cross+1 request cancelled.');
    if (performance.now() >= this.deadline) throw new OneFailure('budget-exhausted', 'Cross+1 time budget exhausted. Retry with the same options.');
  }
  consume(): void {
    this.check();
    if (this.nodes >= this.maxNodes) throw new OneFailure('budget-exhausted', 'Cross+1 node budget exhausted. Retry with the same options.');
    this.nodes++;
  }
  async yield(): Promise<void> { await yieldWorker(); this.check(); }
}

// All four pairs stay in the projection. Any-pair search does not pick just one goal.
export async function searchOne(model: OneModel, state: CubeStateV1, slot: Slot | null, cap: number, budget: WorkBudget): Promise<Move[] | null> {
  const start = model.project(state), path: number[] = [];
  const opposite = [3, 4, 5, 0, 1, 2];
  function* visit(cross: number, pairs: number[], remaining: number, previousFace: number): Generator<void, number[] | null> {
    budget.consume();
    if (budget.nodes % 256 === 0) yield;
    if (model.bound(cross, pairs, slot) > remaining) return null;
    if (model.goal(cross, pairs, slot)) return [...path];
    if (!remaining) return null;
    for (let move = 0; move < 18; move++) {
      const face = Math.floor(move / 3);
      // Same-face turns combine; opposite faces commute, so keep one ordering.
      if (face === previousFace || (opposite[face] === previousFace && face < previousFace)) continue;
      const nextPairs = pairs.map((pair) => required(required(model.pairTransitions[move])[pair]));
      path.push(move);
      const found = yield* visit(model.cross.next(cross, move), nextPairs, remaining - 1, face);
      path.pop();
      if (found) return found;
    }
    return null;
  }
  for (let depth = model.bound(start.cross, start.pairs, slot); depth <= cap; depth++) {
    const iterator = visit(start.cross, start.pairs, depth, -1);
    let step = iterator.next();
    while (!step.done) { await budget.yield(); step = iterator.next(); }
    if (step.value) return step.value.map((i) => ({ ...required(OUTER_MOVES[i]) }));
    await budget.yield();
  }
  return null;
}
