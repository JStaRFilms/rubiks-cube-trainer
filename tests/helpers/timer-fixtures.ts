// TEST ONLY. No generator or production semantic validator is supplied here.
import { attempt, session } from '../unit/fixtures';
import type { AttemptRecord, SemanticValidator } from '../../src/store/records';
import { date, integer, object, text, validateAttemptDurations } from '../../src/store/validation';
export const fixturePresentation = {
  challenge: structuredClone(attempt.challenge), session: { ...session },
  settings: { inspectionMode: 'untimed' as const, audibleWarnings: false },
};
export const timerFixtureValidator: SemanticValidator = {
  async validateAttempt(input) {
    const v = object(input), t = object(v.timing), p = object(v.penalty), s = object(v.settingsSnapshot);
    // This validator accepts only the explicitly known B02 R fixture, never arbitrary proof claims.
    if (JSON.stringify(v.challenge) !== JSON.stringify(attempt.challenge) || v.trainer !== 'cross') throw new Error('Not the test-only R challenge.');
    validateAttemptDurations(v);
    if (s.inspectionMode !== 'untimed' && s.inspectionMode !== '15s') throw new Error('Invalid mode.');
    if (typeof s.audibleWarnings !== 'boolean') throw new Error('Invalid warnings.');
    if (p.kind !== 'none' && p.kind !== 'plus2' && p.kind !== 'dnf') throw new Error('Invalid penalty.');
    if (p.source !== 'none' && p.source !== 'manual' && p.source !== 'inspection') throw new Error('Invalid source.');
    let timing: AttemptRecord['timing'];
    const inspectionMs = t.inspectionMs === null ? null : integer(t.inspectionMs);
    if (t.status === 'completed') timing = { status: 'completed', executionMs: integer(t.executionMs), inspectionMs };
    else {
      if (t.status !== 'interrupted' || (t.phase !== 'preparation' && t.phase !== 'inspection' && t.phase !== 'arming' && t.phase !== 'execution') || (t.reason !== 'background' && t.reason !== 'restart' && t.reason !== 'cancelled')) throw new Error('Invalid interruption.');
      timing = { status: 'interrupted', phase: t.phase, reason: t.reason, executionMs: t.executionMs === null ? null : integer(t.executionMs), inspectionMs };
    }
    return { ...structuredClone(attempt), id: text(v.id), sessionId: text(v.sessionId), presentedAt: date(v.presentedAt), endedAt: date(v.endedAt), preparationMs: integer(v.preparationMs),
      settingsSnapshot: { inspectionMode: s.inspectionMode, audibleWarnings: s.audibleWarnings }, timing, penalty: { kind: p.kind, source: p.source },
      ...(v.runId !== undefined ? { runId: text(v.runId), repIndex: integer(v.repIndex) } : {}) };
  },
  async validateTrainingData(data) {
    if (Object.values(data).some((rows) => rows.length)) throw new Error('Case/set/run data is outside this test fixture.');
    return { personalAlgorithms: [], practiceSets: [], runs: [] };
  },
};
