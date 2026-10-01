import type { AttemptRecord, Challenge } from '../store/records';
import type { GenerateRequest } from '../workers/protocol';
export type CrossRequest = { id: string; instance: string; timeMs: number } & (
  | { kind: 'initialize'; repair: boolean }
  | { kind: 'generate'; request: GenerateRequest }
  | { kind: 'attempt'; value: unknown }
  | { kind: 'challenge'; value: unknown }
  | { kind: 'cancel' }
);
export type CrossReply = { id: string; instance: string } & (
  | { kind: 'progress'; completed: number; total: number }
  | { kind: 'ready'; tableBytes: number; workingBytes: number; elapsedMs: number; cache: 'verified' | 'rebuilt' | 'memory-only' }
  | { kind: 'challenge'; value: Challenge }
  | { kind: 'attempt'; value: AttemptRecord }
  | { kind: 'failed'; message: string }
);
