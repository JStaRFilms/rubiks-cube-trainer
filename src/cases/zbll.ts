import { SOLVED, type CubeEngine } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import { decodeFrame } from '../cube/validation';
import { ZBLL_CASES, ZBLL_DATASET_VERSION, ZBLL_MANIFEST } from '../data/zbll';
import { presentLLGuidance, yawGuidance } from '../ll/model';
import type { TrainingFrame } from '../store/records';
import { auf, QUARTERS, type QuarterTurn } from './identity';
import { validateOverrideImport } from './overrides';
import { presentCase, validateCase } from './validation';

export function zbllEntry(id: string) {
  const canonical = Object.entries(ZBLL_MANIFEST.aliases).find(([alias]) => alias === id)?.[1] ?? id;
  const entry = ZBLL_CASES.find((entry) => entry.id === canonical || entry.aliases.includes(canonical));
  if (!entry) throw Error('Unknown ZBLL membership ID.');
  return entry;
}
export function initializeZBLL(engine: CubeEngine): void {
  if (ZBLL_CASES.length !== 493 || new Set(ZBLL_CASES.map((entry) => entry.id)).size !== 493 || JSON.stringify(ZBLL_CASES.map((entry) => entry.id)) !== JSON.stringify(ZBLL_MANIFEST.expectedIds)) throw Error('Complete ZBLL membership unavailable.');
  ZBLL_CASES.forEach((entry) => validateCase(engine, entry));
  const projections = ZBLL_CASES.map((entry) => entry.identityKey.slice(entry.identityPolicyVersion.length + 1));
  if (new Set(projections).size !== 493) throw Error('Duplicate ZBLL or PLL identities.');
}
export function presentZBLL(engine: CubeEngine, id: string, angle: { preAuf: QuarterTurn; yaw: QuarterTurn; frame: TrainingFrame }, algorithms: unknown = []) {
  if (!QUARTERS.includes(angle.preAuf) || !QUARTERS.includes(angle.yaw) || Object.keys(angle).some((key) => !['preAuf', 'yaw', 'frame'].includes(key))) throw Error('Unsupported ZBLL angle fields.');
  const frame = decodeFrame(angle.frame, engine), entry = zbllEntry(id);
  // Only canonical IDs are accepted for stored overrides, including shared PLL keys.
  const valid = validateOverrideImport(engine, ZBLL_CASES, algorithms), override = valid.find((record) => record.caseId === entry.id);
  const result = presentCase(engine, entry, { preAuf: angle.preAuf, yaw: angle.yaw, slot: 'FR' });
  const moves = override ? [...auf(override.preAuf), ...override.moves] : entry.defaultAlgorithm;
  const guidance = presentLLGuidance(engine, 'zbll', result.start, [...invertMoves(auf(angle.preAuf)), ...yawGuidance(moves, angle.yaw)]);
  if (engine.centerKey(result.start) !== engine.centerKey(SOLVED)) throw Error('ZBLL setup must return to held centers.');
  return structuredClone({ collectionVersion: ZBLL_DATASET_VERSION, caseId: entry.id, identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, datasetVersion: entry.datasetVersion,
    frame, setup: result.setup, start: result.start, solution: guidance.solution, finalAuf: guidance.finalAuf });
}
