import { SOLVED, type CubeEngine, type CubeStateV1 } from '../cube/engine';
import { pieceIndices, stickers } from '../cube/geometry';
import { invertMoves, parseNotation } from '../cube/notation';
import type { CaseEntry } from '../data/types';
import type { Move, Slot } from '../store/records';
import { auf, caseIdentity, edgesOriented, f2lSolved, IDENTITY_POLICIES, isolatedContext, oriented, QUARTERS, type QuarterTurn } from './identity';

const lower = stickers.filter((s) => (s.position[1] === 0 || s.position[1] === -1) && s.position.filter((v) => v !== 0).length >= 2).map((s) => s.index);
function llStickers(state: CubeStateV1): Set<number> {
  const result = new Set<number>();
  for (const name of ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL', 'UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR']) {
    const indices = pieceIndices(name);
    if (indices.some((i) => state.facelets[i] === 'U')) indices.forEach((i) => result.add(i));
  }
  return result;
}
function fixedLowerProof(engine: CubeEngine, state: CubeStateV1, moves: readonly Move[]): void {
  const permutation = engine.stickerPermutation(moves), unrelated = llStickers(state);
  for (const destination of lower) {
    const source = permutation[destination];
    if (source === undefined || unrelated.has(source) || state.facelets[source] !== SOLVED.facelets[destination]) throw Error('Algorithm does not preserve and solve F2L independently of LL arrangement.');
  }
}
export function validatePresentedF2LGuidance(engine: CubeEngine, state: CubeStateV1, moves: readonly Move[]): void {
  fixedLowerProof(engine, state, moves);
  if (!f2lSolved(engine, engine.apply(state, moves))) throw Error('Guidance does not solve the actual presented F2L state.');
}
export function validatePresentedLLGuidance(engine: CubeEngine, trainer: 'oll' | 'pll' | 'zbll', state: CubeStateV1, moves: readonly Move[]): QuarterTurn {
  const final = engine.apply(state, moves);
  if (engine.centerKey(final) !== engine.centerKey(SOLVED)) throw Error('Presented guidance must return to the held frame before final AUF.');
  if (trainer === 'pll' || trainer === 'zbll') {
    for (const post of QUARTERS) if (engine.apply(final, auf(post)).facelets === SOLVED.facelets) return post;
    throw Error(`Guidance does not solve the presented ${trainer.toUpperCase()} including final AUF.`);
  }
  fixedLowerProof(engine, state, moves);
  if (!f2lSolved(engine, final) || !oriented(engine, final)) throw Error('Guidance does not orient the presented OLL and preserve F2L.');
  return 0;
}
export function validateCase(engine: CubeEngine, entry: CaseEntry): void {
  engine.fromState(entry.representative);
  if (entry.identityPolicyVersion !== IDENTITY_POLICIES[entry.trainer]) throw Error('Unsupported case identity policy.');
  if (engine.apply(SOLVED, entry.setup).facelets !== entry.representative.facelets) throw Error('Canonical setup does not reproduce its representative.');
  if (caseIdentity(engine, entry.trainer, entry.representative) !== entry.identityKey) throw Error('Canonical identity does not match the requested case.');
  if (caseIdentity(engine, entry.trainer, SOLVED) === entry.identityKey) throw Error('Solved is not a library case.');
  if (entry.trainer === 'f2l' ? !isolatedContext(engine, entry.representative, 'FR') : !f2lSolved(engine, entry.representative)) throw Error('Case does not have its required initial context.');
  if (entry.trainer === 'pll' && !oriented(engine, entry.representative)) throw Error('PLL must start with LL oriented.');
  if (entry.trainer === 'zbll' && !edgesOriented(engine, entry.representative)) throw Error('ZBLL must start with LL edges oriented.');
  if (entry.trainer === 'oll') {
    // Every allowed base has the same U occupancy and the same fixed lower stickers.
    // A sticker permutation cannot depend on which LL cubie carries those stickers.
    fixedLowerProof(engine, SOLVED, entry.setup);
  }
  const final = validateGuidance(engine, entry, entry.defaultAlgorithm);
  if (final !== entry.finalAuf) throw Error('Recorded final AUF does not match the default.');
}
const zbllGuidanceProofs = new WeakMap<CubeEngine, Map<string, QuarterTurn>>();
export function validateGuidance(engine: CubeEngine, entry: CaseEntry, moves: readonly Move[], preAuf: QuarterTurn = 0): QuarterTurn {
  // Structural import checks still run on every call. Cache only successful new
  // ZBLL goal proofs, keyed by the actual representative, identity and guidance.
  const key = entry.trainer === 'zbll' ? JSON.stringify([entry.identityPolicyVersion, entry.identityKey, entry.representative, moves, preAuf]) : null;
  let cache = zbllGuidanceProofs.get(engine);
  if (key !== null) {
    if (!cache) { cache = new Map(); zbllGuidanceProofs.set(engine, cache); }
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
  }
  if (caseIdentity(engine, entry.trainer, entry.representative) !== entry.identityKey) throw Error('Canonical identity does not match the requested case.');
  const complete = [...auf(preAuf), ...moves];
  const final = engine.normalize(engine.apply(entry.representative, complete));
  if (entry.trainer === 'pll' || entry.trainer === 'zbll') {
    for (const post of QUARTERS) if (engine.apply(final, auf(post)).facelets === SOLVED.facelets) {
      if (key !== null && cache) { if (cache.size >= 512) cache.clear(); cache.set(key, post); }
      return post;
    }
    throw Error(`Algorithm does not solve the intended ${entry.trainer.toUpperCase()}, including final AUF.`);
  }
  fixedLowerProof(engine, entry.representative, complete);
  if (!f2lSolved(engine, final)) throw Error('Algorithm does not solve the intended F2L context.');
  if (entry.trainer === 'oll' && !oriented(engine, final)) throw Error('Algorithm does not orient the intended OLL.');
  return 0;
}
export function validateOverride(engine: CubeEngine, entry: CaseEntry, notation: string, preAuf: QuarterTurn = 0): { moves: Move[]; preAuf: QuarterTurn; finalAuf: QuarterTurn } {
  const moves = parseNotation(notation);
  return { moves, preAuf, finalAuf: validateGuidance(engine, entry, moves, preAuf) };
}
function yawMoves(yaw: QuarterTurn): Move[] { return yaw === 0 ? [] : [{ family: 'y', amount: yaw === 3 ? -1 : yaw }]; }
function conjugated(moves: readonly Move[], yaw: QuarterTurn): Move[] {
  const rotation = yawMoves(yaw);
  return [...invertMoves(rotation), ...moves, ...rotation];
}
export function presentCase(engine: CubeEngine, entry: CaseEntry, angle: { preAuf: QuarterTurn; yaw: QuarterTurn; slot: Slot }): { setup: Move[]; start: CubeStateV1; solution: Move[]; finalAuf: QuarterTurn } {
  const yaw = entry.trainer === 'f2l' ? { FR: 0, FL: 1, BR: 3, BL: 2 } as const : null;
  if (yaw && angle.yaw !== 0) throw Error('F2L yaw is determined by the selected slot.');
  if (!yaw && angle.slot !== 'FR') throw Error('LL cases do not have a target slot.');
  const amount = yaw ? yaw[angle.slot] : angle.yaw;
  const setup = [...conjugated(entry.setup, amount), ...auf(angle.preAuf)];
  const solution = [...invertMoves(auf(angle.preAuf)), ...conjugated(entry.defaultAlgorithm, amount)];
  return { setup, start: engine.apply(SOLVED, setup), solution, finalAuf: entry.finalAuf };
}
