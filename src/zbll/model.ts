import { ENGINE_VERSION, type CubeEngine } from '../cube/engine';
import { presentZBLL, zbllEntry } from '../cases/zbll';
import { ZBLL_CASES, ZBLL_DATASET_VERSION, ZBLL_MANIFEST } from '../data/zbll';
import type { Challenge, PersonalAlgorithmRecord, TrainingFrame, Versions, ZBLLPreferences } from '../store/records';
import type { QuarterTurn } from '../cases/identity';
export { initializeZBLL } from '../cases/zbll';
export const ZBLL_VERSIONS: Versions = { contract: 1, engine: ENGINE_VERSION, dataset: ZBLL_DATASET_VERSION, tables: 'zbll-ll-pre-u-yaw-v1-frame-v1' };
export const defaultZBLLPreferences: ZBLLPreferences = { caseIds: ZBLL_CASES.map((entry) => entry.id), mode: 'execution', shuffle: true, preAuf: 'random', yaw: 'random' };
export type ZBLLChallenge = Challenge & { options: Extract<Challenge['options'], { trainer: 'zbll' }>; proof: Extract<Challenge['proof'], { kind: 'case' }> & { membership: NonNullable<Extract<Challenge['proof'], { kind: 'case' }>['membership']> } };
export interface ZBLLGeneration { requestId: string; epoch: number; caseId: string; preAuf: QuarterTurn; yaw: QuarterTurn; frame: TrainingFrame; selection: ZBLLPreferences }
export function zbllMembership(caseId: string) {
  const member = ZBLL_MANIFEST.membership.find((member) => member.caseId === caseId);
  if (!member) throw Error('Unknown canonical ZBLL membership.');
  return member;
}
export function createZBLL(engine: CubeEngine, request: ZBLLGeneration, algorithms: readonly PersonalAlgorithmRecord[] = []): ZBLLChallenge {
  const member = zbllMembership(request.caseId), entry = zbllEntry(member.caseId);
  const presented = presentZBLL(engine, entry.id, { preAuf: request.preAuf, yaw: request.yaw, frame: request.frame }, algorithms);
  return { challengeId: crypto.randomUUID(), requestId: request.requestId, epoch: request.epoch, versions: { ...ZBLL_VERSIONS }, frame: presented.frame,
    options: { trainer: 'zbll', caseId: entry.id, preAuf: request.preAuf, yaw: request.yaw, mode: request.selection.mode, selection: structuredClone(request.selection) },
    scramble: presented.setup, start: presented.start,
    proof: { kind: 'case', caseId: entry.id, identityKey: entry.identityKey, setup: presented.setup, solution: presented.solution, finalAuf: presented.finalAuf, representative: false,
      membership: { family: member.family, subset: member.subset, sourceLabel: member.sourceLabel, referenceLabel: member.referenceLabel, datasetVersion: entry.datasetVersion, identityPolicyVersion: entry.identityPolicyVersion } } };
}
