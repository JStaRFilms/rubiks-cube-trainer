import type { AttemptRecord, Challenge, Color, CrossDepth, SemanticValidator } from '../store/records';
import { TRAINING_FRAMES } from '../cube/frame';
import { matchesPending, type GenerateRequest } from '../workers/protocol';
import { CROSS_VERSIONS } from './table';
import type { CrossReply, CrossRequest } from './protocol';

export class CrossClient {
  private worker: Worker | null = null;
  private instance = '';
  private pending = new Map<string, { resolve: (reply: CrossReply) => void; reject: (reason: Error) => void; timer: ReturnType<typeof setTimeout>; progress?: (completed: number, total: number) => void }>();
  private start(): void {
    if (this.worker) return;
    this.instance = crypto.randomUUID();
    this.worker = new Worker(new URL('./cross.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onerror = () => this.reset(new Error('Cross worker crashed. Retry; personal history is unchanged.'));
    this.worker.onmessage = (event: MessageEvent<CrossReply>) => {
      const reply = event.data;
      if (reply.instance !== this.instance) return;
      const pending = this.pending.get(reply.id); if (!pending) return;
      if (reply.kind === 'progress') { pending.progress?.(reply.completed, reply.total); return; }
      clearTimeout(pending.timer); this.pending.delete(reply.id);
      if (reply.kind === 'failed') pending.reject(new Error(reply.message)); else pending.resolve(reply);
    };
  }
  private reset(reason: Error): void {
    this.worker?.terminate(); this.worker = null;
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(reason); }
    this.pending.clear();
  }
  cancel(id: string): void {
    const pending = this.pending.get(id); if (!pending) return;
    clearTimeout(pending.timer); this.pending.delete(id); pending.reject(new Error('Cross request cancelled.'));
    this.worker?.postMessage({ kind: 'cancel', id, instance: this.instance, timeMs: 1 } satisfies CrossRequest);
  }
  private send(request: CrossRequest, progress?: (completed: number, total: number) => void): Promise<CrossReply> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.reset(new Error('Cross worker deadline exceeded. Retry with the same settings.')), request.timeMs);
      this.pending.set(request.id, { resolve, reject, timer, progress }); this.worker?.postMessage(request);
    });
  }
  async initialize(repair = true, progress?: (completed: number, total: number) => void): Promise<Extract<CrossReply, { kind: 'ready' }>> {
    this.start(); const reply = await this.send({ kind: 'initialize', id: crypto.randomUUID(), instance: this.instance, timeMs: 60000, repair }, progress);
    if (reply.kind !== 'ready') throw new Error('Invalid Cross readiness response.');
    if (reply.cache === 'memory-only') throw new Error('Cross works in this tab, but its table could not be cached. Offline readiness is incomplete. Free storage and retry setup.');
    return reply;
  }
  get workerInstance(): string | null { return this.worker ? this.instance : null; }
  async generate(id: string, epoch: number, K: CrossDepth, color: Color, progress?: (completed: number, total: number) => void): Promise<{ challenge: Challenge; instance: string }> {
    this.start();
    const frame = { crossColor: color, colorOfFace: { ...TRAINING_FRAMES[color] } };
    const request: GenerateRequest = { kind: 'generate', protocol: 1, requestId: id, epoch, workerInstance: this.instance, versions: CROSS_VERSIONS, frame, options: { trainer: 'cross', K }, seed: crypto.randomUUID(), budget: { timeMs: 5000, maxNodes: 200000 } };
    const reply = await this.send({ kind: 'generate', id, instance: this.instance, timeMs: 60000, request }, progress);
    if (reply.kind !== 'challenge' || !matchesPending({ kind: 'result', workerInstance: reply.instance, challenge: reply.value }, request)) throw new Error('Stale or mismatched Cross result.');
    // Revalidate the full returned challenge before creating a presentation.
    const verified = await this.send({ kind: 'challenge', id: crypto.randomUUID(), instance: this.instance, timeMs: 10000, value: reply.value });
    if (verified.kind !== 'challenge' || !matchesPending({ kind: 'result', workerInstance: verified.instance, challenge: verified.value }, request)) throw new Error('Cross result validation failed.');
    return { challenge: verified.value, instance: verified.instance };
  }
  readonly validator: SemanticValidator = {
    validateAttempt: async (value): Promise<AttemptRecord> => {
      this.start(); const reply = await this.send({ kind: 'attempt', id: crypto.randomUUID(), instance: this.instance, timeMs: 60000, value });
      if (reply.kind !== 'attempt') throw new Error('Invalid Cross attempt validation response.'); return reply.value;
    },
    validateTrainingData: async (data) => {
      if (Object.values(data).some((records) => records.length)) throw new Error('Algorithms, sets and runs need an unavailable compatible case validator.');
      return { personalAlgorithms: [], practiceSets: [], runs: [] };
    },
  };
}
// The facade exists before App creates its repository. Heavy work starts only in the worker.
export const crossClient = new CrossClient();
