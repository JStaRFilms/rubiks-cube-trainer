import { ENGINE_VERSION, type CubeEngine } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import { auf, SLOTS, type QuarterTurn } from '../cases/identity';
import { validateCase, presentCase, validatePresentedF2LGuidance } from '../cases/validation';
import { validateOverrideImport } from '../cases/overrides';
import { F2L_CASES } from '../data/f2l';
import { CASE_MANIFESTS } from '../data/manifests';
import type { CaseEntry } from '../data/types';
import type { Challenge, F2LPreferences, Move, PersonalAlgorithmRecord, Slot, TrainingFrame, Versions } from '../store/records';

export const F2L_VERSIONS: Versions = { contract: 1, engine: ENGINE_VERSION, dataset: 'cfop-libraries-v1', tables: 'f2l-fr-pre-u-v1-frame-v1' };
export const defaultF2LPreferences: F2LPreferences = { caseIds: F2L_CASES.map((entry) => entry.id), slotMode: 'FR', hint: true, mode: 'execution', preAuf: 'random' };
export type F2LChallenge = Challenge & { options: Extract<Challenge['options'], { trainer: 'f2l' }>; proof: Extract<Challenge['proof'], { kind: 'case' }> };
export const SLOT_YAWS = { FR: 0, FL: 1, BR: 3, BL: 2 } as const;
export function rotateGuidance(moves: readonly Move[], slot: Slot): Move[] {
  const yaw = SLOT_YAWS[slot], rotation: Move[] = yaw === 0 ? [] : [{ family: 'y', amount: yaw === 3 ? -1 : yaw }];
  return [...invertMoves(rotation), ...moves, ...rotation];
}
export function initializeF2L(engine: CubeEngine): void {
  const manifest = CASE_MANIFESTS.find((entry) => entry.trainer === 'f2l');
  if (!manifest || manifest.expectedCount !== 41 || JSON.stringify(manifest.expectedIds) !== JSON.stringify(F2L_CASES.map((entry) => entry.id)) || new Set(F2L_CASES.map((entry) => entry.identityKey)).size !== 41) throw Error('The complete F2L library is unavailable.');
  for (const entry of F2L_CASES) validateCase(engine, entry);
}
export function f2lEntry(caseId: string): CaseEntry {
  const entry = F2L_CASES.find((value) => value.id === caseId);
  if (!entry) throw Error('Unknown F2L case.');
  return entry;
}
export function createF2L(engine: CubeEngine, request: { requestId: string; epoch: number; frame: TrainingFrame; caseId: string; slot: Slot; hint: boolean; mode: 'execution' | 'recognition'; preAuf: QuarterTurn }, algorithms: readonly PersonalAlgorithmRecord[] = []): F2LChallenge {
  const entry = f2lEntry(request.caseId), valid = validateOverrideImport(engine, F2L_CASES, algorithms);
  if (!SLOTS.includes(request.slot)) throw Error('Invalid F2L slot.');
  const presented = presentCase(engine, entry, { slot: request.slot, preAuf: request.preAuf, yaw: 0 });
  const override = valid.find((value) => value.caseId === entry.id && value.slot === request.slot) ?? valid.find((value) => value.caseId === entry.id && value.slot === 'canonical');
  const guidance = override ? [...auf(override.preAuf), ...override.moves] : [...entry.defaultAlgorithm];
  const solution = [...invertMoves(auf(request.preAuf)), ...(override?.slot === request.slot ? guidance : rotateGuidance(guidance, request.slot))];
  validatePresentedF2LGuidance(engine, presented.start, solution);
  return { challengeId: crypto.randomUUID(), requestId: request.requestId, epoch: request.epoch, versions: { ...F2L_VERSIONS }, frame: structuredClone(request.frame),
    options: { trainer: 'f2l', caseId: entry.id, slot: request.slot, hint: request.hint, mode: request.mode }, scramble: presented.setup, start: presented.start,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup: presented.setup, solution, finalAuf: 0, representative: true } };
}
