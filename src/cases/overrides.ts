import { ENGINE_VERSION, type CubeEngine } from '../cube/engine';
import { decodeMoves, invertMoves } from '../cube/notation';
import type { CaseEntry } from '../data/types';
import type { Move, PersonalAlgorithmRecord } from '../store/records';
import { boundedInput, date, object, text } from '../store/validation';
import { QUARTERS, SLOTS, type QuarterTurn } from './identity';
import { validateGuidance } from './validation';

// Pure pre-storage validation. The app's backup gate remains closed until B08/B09.
export function validateOverrideImport(engine: CubeEngine, library: readonly CaseEntry[], input: unknown): PersonalAlgorithmRecord[] {
  boundedInput(input);
  if (!Array.isArray(input) || input.length > library.length * 5) throw Error('Expected a bounded personal algorithm list. Existing overrides are unchanged.');
  const seen = new Set<string>();
  return input.map((raw: unknown) => {
    const value = object(raw);
    const fields = ['caseId', 'slot', 'moves', 'preAuf', 'updatedAt', 'identityPolicyVersion', 'identityKey', 'validatedDatasetVersion', 'validatedEngineVersion'];
    if (fields.some((key) => !(key in value)) || Object.keys(value).some((key) => !fields.includes(key))) throw Error('Missing or unknown personal algorithm fields.');
    const caseId = text(value.caseId), entry = library.find((e) => e.id === caseId);
    if (!entry) throw Error('Unknown case ID. Existing overrides are unchanged.');
    const slot = value.slot === 'canonical' ? 'canonical' : SLOTS.find((s) => s === value.slot);
    const preAuf = QUARTERS.find((q) => q === value.preAuf);
    if (!slot || preAuf === undefined || (entry.trainer !== 'f2l' && slot !== 'canonical')) throw Error('Invalid slot or pre-AUF for this case.');
    if (value.identityPolicyVersion !== entry.identityPolicyVersion || value.identityKey !== entry.identityKey || value.validatedDatasetVersion !== entry.datasetVersion || value.validatedEngineVersion !== ENGINE_VERSION) throw Error('Override versions or identity do not match the canonical case.');
    const key = `${caseId}/${slot}`;
    if (seen.has(key)) throw Error('Duplicate case/slot overrides.');
    seen.add(key);
    const moves = decodeMoves(value.moves);
    // Slot guidance is mapped back to FR before testing the canonical case.
    const slotYaw: QuarterTurn = slot === 'canonical' ? 0 : ({ FR: 0, FL: 1, BR: 3, BL: 2 } as const)[slot];
    const rotation: Move[] = slotYaw === 0 ? [] : [{ family: 'y', amount: slotYaw === 3 ? -1 : slotYaw }];
    validateGuidance(engine, entry, [...rotation, ...moves, ...invertMoves(rotation)], preAuf);
    return { caseId, slot, moves, preAuf, updatedAt: date(value.updatedAt), identityPolicyVersion: entry.identityPolicyVersion,
      identityKey: entry.identityKey, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
  });
}
export function resetOverride(previous: readonly PersonalAlgorithmRecord[], caseId: string, slot: PersonalAlgorithmRecord['slot']): PersonalAlgorithmRecord[] {
  return previous.filter((record) => record.caseId !== caseId || record.slot !== slot);
}
