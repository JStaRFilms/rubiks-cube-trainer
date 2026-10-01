import type { Versions } from '../store/records';
import type { GenerateRequest } from '../workers/protocol';
import type { OneResult, Strategy } from './generate';
import type { FailureCode } from './search';

export type OneRequest =
  | { kind: 'initialize'; id: string; instance: string; versions: Versions; timeMs: number; repair: boolean }
  | { kind: 'generate'; id: string; instance: string; timeMs: number; request: GenerateRequest; strategy: Strategy }
  | { kind: 'cancel'; id: string; instance: string };
export type OneReply =
  | { kind: 'ready'; id: string; instance: string; versions: Versions; elapsedMs: number; pairInitMs: number; workingBytes: number; cache: 'verified' | 'rebuilt' | 'memory-only' }
  | { kind: 'progress'; id: string; instance: string; completed: number; total: number }
  | { kind: 'result'; id: string; instance: string; result: OneResult }
  | { kind: 'failed'; id: string; instance: string; code: FailureCode; message: string };
