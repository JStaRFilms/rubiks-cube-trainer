import type { AttemptRecord, PersonalAlgorithmRecord } from '../store/records';
import type { ZBLLChallenge, ZBLLGeneration } from './model';
export type ZBLLRequest = { id: string; instance: string } & (
  | { kind: 'initialize' }
  | { kind: 'generate'; request: ZBLLGeneration; algorithms: PersonalAlgorithmRecord[] }
  | { kind: 'attempt'; value: unknown }
);
export type ZBLLReply = { id: string; instance: string } & (
  | { kind: 'ready' }
  | { kind: 'challenge'; value: ZBLLChallenge }
  | { kind: 'attempt'; value: AttemptRecord }
  | { kind: 'failed'; message: string }
);
