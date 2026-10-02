import { ENGINE_VERSION, type CubeEngine, type CubeStateV1 } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import { auf, type QuarterTurn } from '../cases/identity';
import { presentCase, validateCase, validatePresentedLLGuidance } from '../cases/validation';
import { validateOverrideImport } from '../cases/overrides';
import { CASE_MANIFESTS, OLL_CASES, PLL_CASES } from '../data';
import type { CaseEntry } from '../data/types';
import type { Challenge, LLPreferences, Move, PersonalAlgorithmRecord, TrainingFrame, Versions } from '../store/records';
export type LLTrainer = 'oll' | 'pll';
export type LLChallenge = Challenge & { options: Extract<Challenge['options'], { trainer: 'oll' | 'pll' | 'zbll' }> & { trainer: LLTrainer }; proof: Extract<Challenge['proof'], { kind: 'case' }> };
export const LL_VERSIONS: Versions = { contract: 1, engine: ENGINE_VERSION, dataset: 'cfop-libraries-v1', tables: 'll-pre-u-yaw-v1-frame-v1' };
export const LL_CASES = [...OLL_CASES, ...PLL_CASES];
export function llLibrary(trainer: LLTrainer): readonly CaseEntry[] { return trainer === 'oll' ? OLL_CASES : PLL_CASES; }
export function defaultLLPreferences(trainer: LLTrainer): LLPreferences { return { caseIds: llLibrary(trainer).map((entry) => entry.id), setId: null, mode: 'execution', shuffle: false, preAuf: 'random', yaw: 'random' }; }
export function llEntry(trainer: LLTrainer, id: string): CaseEntry {
  const entry = llLibrary(trainer).find((entry) => entry.id === id);
  if (!entry) throw Error('Unknown case for this last-layer trainer.'); return entry;
}
export function initializeLL(engine: CubeEngine): void {
  for (const trainer of ['oll', 'pll'] as const) {
    const library = llLibrary(trainer), count = trainer === 'oll' ? 57 : 21, manifest = CASE_MANIFESTS.find((entry) => entry.trainer === trainer);
    if (!manifest || manifest.expectedCount !== count || JSON.stringify(manifest.expectedIds) !== JSON.stringify(library.map((entry) => entry.id)) || new Set(library.map((entry) => entry.identityKey)).size !== count) throw Error('Complete last-layer inventory unavailable.');
    library.forEach((entry) => validateCase(engine, entry));
  }
}
export function yawGuidance(moves: readonly Move[], yaw: QuarterTurn): Move[] {
  const rotation: Move[] = yaw === 0 ? [] : [{ family: 'y', amount: yaw === 3 ? -1 : yaw }];
  return [...invertMoves(rotation), ...moves, ...rotation];
}
const presentedGuidance = new WeakMap<CubeEngine, Map<string, { solution: Move[]; finalAuf: QuarterTurn }>>();
export function presentLLGuidance(engine: CubeEngine, trainer: LLTrainer | 'zbll', start: CubeStateV1, moves: readonly Move[]) {
  let cache = presentedGuidance.get(engine);
  if (!cache) { cache = new Map(); presentedGuidance.set(engine, cache); }
  const key = JSON.stringify([trainer, start, moves]), cached = cache.get(key);
  if (cached) return structuredClone(cached);
  // Final AUF is a physical U turn in the held frame, not an implicit normalization.
  const endingFrame = engine.centerKey(engine.apply(start, moves)), rotation = engine.orientations.find((value) => value.centers === endingFrame);
  if (!rotation) throw Error('Guidance has no valid return to the held frame.');
  const solution = [...moves, ...invertMoves(rotation.moves)], result = { solution, finalAuf: validatePresentedLLGuidance(engine, trainer, start, solution) };
  if (cache.size >= 256) cache.clear(); cache.set(key, structuredClone(result)); return result;
}
export interface LLGeneration { requestId: string; epoch: number; trainer: LLTrainer; caseId: string; preAuf: QuarterTurn; yaw: QuarterTurn; mode: 'execution' | 'recognition'; frame: TrainingFrame }
export function createLL(engine: CubeEngine, request: LLGeneration, algorithms: readonly PersonalAlgorithmRecord[] = []): LLChallenge {
  const entry = llEntry(request.trainer, request.caseId), valid = validateOverrideImport(engine, LL_CASES, algorithms), override = valid.find((value) => value.caseId === entry.id);
  const presented = presentCase(engine, entry, { preAuf: request.preAuf, yaw: request.yaw, slot: 'FR' });
  const { solution, finalAuf } = presentLLGuidance(engine, request.trainer, presented.start, [...invertMoves(auf(request.preAuf)), ...yawGuidance(override ? [...auf(override.preAuf), ...override.moves] : entry.defaultAlgorithm, request.yaw)]);
  return { challengeId: crypto.randomUUID(), requestId: request.requestId, epoch: request.epoch, versions: { ...LL_VERSIONS }, frame: structuredClone(request.frame),
    options: { trainer: request.trainer, caseId: entry.id, preAuf: request.preAuf, yaw: request.yaw, mode: request.mode }, scramble: presented.setup, start: presented.start,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup: presented.setup, solution, finalAuf, representative: request.trainer === 'oll' } };
}
