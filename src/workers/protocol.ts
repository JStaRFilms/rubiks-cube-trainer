import type { Challenge, GoalOptions, TrainingFrame, Versions } from '../store/records';
import type { CubeEngine } from '../cube/engine';
import { ENGINE_VERSION } from '../cube/version';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { boundedInput, decodeGoalOptions, integer, object, text } from '../store/validation';
export interface GenerateRequest {
  kind: 'generate'; protocol: 1; requestId: string; epoch: number; workerInstance: string;
  versions: Versions; frame: TrainingFrame; options: GoalOptions; seed: string;
  budget: { timeMs: number; maxNodes: number };
}
export type WorkerRequest = GenerateRequest
  | { kind: 'initialize'; protocol: 1; workerInstance: string; versions: Versions }
  | { kind: 'cancel'; requestId: string; epoch: number };
export type WorkerReply =
  | { kind: 'ready'; workerInstance: string; versions: Versions }
  | { kind: 'progress'; workerInstance: string; requestId: string | null; epoch: number; phase: 'tables' | 'search'; completed: number; total: number | null }
  | { kind: 'result'; workerInstance: string; challenge: Challenge }
  | { kind: 'failed'; workerInstance: string; requestId: string; epoch: number;
      code: 'cancelled' | 'budget-exhausted' | 'unsupported-options' | 'version-mismatch' | 'invalid-result' | 'worker-crashed'; message: string }
  | { kind: 'initialization-failed'; workerInstance: string; versions: Versions; message: string };
export const SCAFFOLD_VERSIONS: Versions = { contract: 1, engine: ENGINE_VERSION, dataset: null, tables: 'unavailable' };
export function decodeWorkerRequest(input: unknown, engine: CubeEngine): WorkerRequest {
  boundedInput(input);
  const v = object(input);
  if (v.kind === 'cancel') return { kind: 'cancel', requestId: text(v.requestId), epoch: integer(v.epoch) };
  if (v.protocol !== 1) throw new Error('Unsupported worker protocol.');
  const workerInstance = text(v.workerInstance), versions = decodeVersions(v.versions);
  if (v.kind === 'initialize') return { kind: 'initialize', protocol: 1, workerInstance, versions };
  if (v.kind !== 'generate') throw new Error('Unknown worker request.');
  const budget = object(v.budget);
  if (typeof budget.timeMs !== 'number' || !Number.isFinite(budget.timeMs) || budget.timeMs < 0) throw new Error('Invalid time budget.');
  return { kind: 'generate', protocol: 1, workerInstance, versions, requestId: text(v.requestId), epoch: integer(v.epoch), frame: decodeFrame(v.frame, engine), options: decodeGoalOptions(v.options), seed: text(v.seed), budget: { timeMs: budget.timeMs, maxNodes: integer(budget.maxNodes) } };
}
function sameVersions(a: Versions, b: Versions): boolean { return a.contract === b.contract && a.engine === b.engine && a.dataset === b.dataset && a.tables === b.tables; }
export class GenerationScaffold {
  private instance = 'uninitialized';
  handle(request: WorkerRequest): WorkerReply {
    if (request.kind === 'initialize') {
      this.instance = request.workerInstance;
      return { kind: 'initialization-failed', workerInstance: this.instance, versions: request.versions, message: 'Generation is unavailable: verified generators, datasets and tables are not installed.' };
    }
    if (request.kind === 'cancel') return { kind: 'failed', workerInstance: this.instance, requestId: request.requestId, epoch: request.epoch, code: 'cancelled', message: 'Request cancelled. No challenge was produced.' };
    const compatible = sameVersions(request.versions, SCAFFOLD_VERSIONS) && request.workerInstance === this.instance;
    return { kind: 'failed', workerInstance: this.instance, requestId: request.requestId, epoch: request.epoch, code: compatible ? 'unsupported-options' : 'version-mismatch', message: compatible ? 'No verified generator or tables are installed. No challenge was produced.' : 'Worker instance or versions do not match.' };
  }
}
// Until full goal/optimality validators exist, no incoming success can be adopted.
export function decodeScaffoldReply(input: unknown): Exclude<WorkerReply, { kind: 'result' | 'ready' | 'progress' }> {
  boundedInput(input); const v = object(input), workerInstance = text(v.workerInstance);
  if (v.kind === 'initialization-failed') return { kind: 'initialization-failed', workerInstance, versions: decodeVersions(v.versions), message: text(v.message) };
  const code = ['cancelled', 'budget-exhausted', 'unsupported-options', 'version-mismatch', 'invalid-result', 'worker-crashed'] as const;
  const failure = code.find((c) => c === v.code);
  if (v.kind !== 'failed' || !failure) throw new Error('This scaffold cannot accept a successful generation result.');
  return { kind: 'failed', workerInstance, requestId: text(v.requestId), epoch: integer(v.epoch), code: failure, message: text(v.message) };
}
export function matchesPending(reply: WorkerReply, pending: GenerateRequest): boolean {
  if (reply.kind !== 'result' || reply.workerInstance !== pending.workerInstance) return false;
  const challenge = reply.challenge;
  return challenge.requestId === pending.requestId && challenge.epoch === pending.epoch && sameVersions(challenge.versions, pending.versions) && JSON.stringify(challenge.options) === JSON.stringify(pending.options) && JSON.stringify(challenge.frame) === JSON.stringify(pending.frame);
}
