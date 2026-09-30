import { defaultSettings, type AttemptRecord, type SemanticValidator, type TrainerBackupV1 } from '../../src/store/records';
export const session = { id: 'session-fixture', trainer: 'cross', label: 'Fixture session', createdAt: '2026-09-30T00:00:00.000Z' } as const;
export function backup(): TrainerBackupV1 {
  return { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: session.createdAt,
    settings: [structuredClone(defaultSettings)], sessions: [{ ...session }], attempts: [], personalAlgorithms: [], practiceSets: [], runs: [] };
}
export const attempt: AttemptRecord = {
  id: 'attempt-fixture', sessionId: session.id, trainer: 'cross', presentedAt: session.createdAt, endedAt: '2026-09-30T00:00:10.000Z', preparationMs: 5000,
  timing: { status: 'completed', executionMs: 1000, inspectionMs: null }, penalty: { kind: 'none', source: 'none' },
  challenge: { challengeId: 'challenge-fixture', requestId: 'request-fixture', epoch: 0,
    versions: { contract: 1, engine: 'test-fixture', dataset: null, tables: 'test-fixture' },
    frame: { crossColor: 'white', colorOfFace: { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' } },
    scramble: [{ family: 'R', amount: 1 }], start: { format: 'cube3-facelets-v1', facelets: 'UUFUUFUUFRRRRRRRRRFFDFFDFFDDDBDDBDDBLLLLLLLLLUBBUBBUBB' },
    options: { trainer: 'cross', K: 1 }, proof: { kind: 'cross-optimal', depth: 1, solution: [{ family: 'R', amount: -1 }] } },
};
// Storage tests only. This stub is not evidence of cube-engine correctness.
export const fixtureValidator: SemanticValidator = {
  async validateAttempt(input) {
    if (JSON.stringify(input) !== JSON.stringify(attempt)) throw new Error('Unexpected semantic fixture.');
    return structuredClone(attempt);
  },
  async validateTrainingData(input) {
    if (Object.values(input).some((values) => values.length)) throw new Error('No case/run validator in this fixture.');
    return { personalAlgorithms: [], practiceSets: [], runs: [] };
  },
};
