import type { QuarterTurn } from '../cases/identity';
import type { AttemptRecord, PersonalAlgorithmRecord, SemanticValidator, Slot, TrainingFrame } from '../store/records';
import type { F2LChallenge } from './model';
export interface F2LGeneration { requestId: string; epoch: number; frame: TrainingFrame; caseId: string; slot: Slot; hint: boolean; mode: 'execution' | 'recognition'; preAuf: QuarterTurn }
export type F2LRequest = { id: string; instance: string } & (
  | { kind: 'initialize' }
  | { kind: 'generate'; request: F2LGeneration; algorithms: PersonalAlgorithmRecord[] }
  | { kind: 'attempt'; value: unknown }
  | { kind: 'training'; value: Parameters<SemanticValidator['validateTrainingData']>[0] }
);
export type F2LReply = { id: string; instance: string } & (
  | { kind: 'ready' }
  | { kind: 'challenge'; value: F2LChallenge }
  | { kind: 'attempt'; value: AttemptRecord }
  | { kind: 'training'; value: Awaited<ReturnType<SemanticValidator['validateTrainingData']>> }
  | { kind: 'failed'; message: string }
);
