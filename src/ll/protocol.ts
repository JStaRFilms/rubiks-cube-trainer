import type { AttemptRecord, PersonalAlgorithmRecord, PracticeSetRecord, SemanticValidator, SessionRecord } from '../store/records';
import type { LLGeneration, LLChallenge } from './model';
import type { LLRunRecord, RunOptions } from './runs';
export type LLRequest = { id: string; instance: string } & (
  | { kind: 'initialize' }
  | { kind: 'generate'; request: LLGeneration; algorithms: PersonalAlgorithmRecord[] }
  | { kind: 'plan'; set: PracticeSetRecord; session: SessionRecord; options: RunOptions; algorithms: PersonalAlgorithmRecord[]; setId: string | null }
  | { kind: 'attempt'; value: unknown }
  | { kind: 'training'; value: Parameters<SemanticValidator['validateTrainingData']>[0]; attempts: AttemptRecord[]; sessions: SessionRecord[] }
);
export type LLReply = { id: string; instance: string } & (
  | { kind: 'ready' }
  | { kind: 'challenge'; value: LLChallenge }
  | { kind: 'plan'; value: LLRunRecord }
  | { kind: 'attempt'; value: AttemptRecord }
  | { kind: 'training'; value: Awaited<ReturnType<SemanticValidator['validateTrainingData']>> }
  | { kind: 'failed'; message: string }
);
