import type { GenerateRequest } from '../workers/protocol';
import { matchesPending } from '../workers/protocol';
import { ONE_VERSIONS, SLOTS } from './model';
import type { OneResult, Strategy } from './generate';
import type { OneReply, OneRequest } from './protocol';
import { OneFailure } from './search';
import { checkRequest, verifyWitnessSlot } from './validation';

// Prototype only. No App singleton, personal-data validator or readiness registration.
export class OneClient {
  private worker: Worker | null = null;
  private instance = '';
  private pending = new Map<string, { resolve: (reply: OneReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  private start(): void {
    if (this.worker) return;
    this.instance = crypto.randomUUID();
    this.worker = new Worker(new URL('./one.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onerror = () => this.reset(new OneFailure('worker-crashed', 'Cross+1 worker crashed. Retry with the same options.'));
    this.worker.onmessage = (event: MessageEvent<OneReply>) => {
      const reply = event.data;
      if (reply.instance !== this.instance) return;
      const pending = this.pending.get(reply.id);
      if (!pending || reply.kind === 'progress') return;
      clearTimeout(pending.timer); this.pending.delete(reply.id);
      if (reply.kind === 'failed') pending.reject(new OneFailure(reply.code, reply.message)); else pending.resolve(reply);
    };
  }
  private reset(error: Error): void {
    this.worker?.terminate(); this.worker = null;
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); }
    this.pending.clear();
  }
  cancel(): void { this.reset(new OneFailure('cancelled', 'Cross+1 request cancelled.')); }
  // Call before active timing/player work. Termination also prevents a blocked old worker competing.
  suspend(): void { this.cancel(); }
  get workerInstance(): string { this.start(); return this.instance; }
  private send(message: Exclude<OneRequest, { kind: 'cancel' }>): Promise<OneReply> {
    if (this.pending.size) throw new Error('Cross+1 prototype accepts one pending job at a time.');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.reset(new OneFailure('budget-exhausted', 'Cross+1 worker deadline exceeded. Retry with the same options.')), message.timeMs);
      this.pending.set(message.id, { resolve, reject, timer }); this.worker?.postMessage(message);
    });
  }
  async initialize(repair = true): Promise<Extract<OneReply, { kind: 'ready' }>> {
    this.start();
    const reply = await this.send({ kind: 'initialize', id: crypto.randomUUID(), instance: this.instance, versions: ONE_VERSIONS, timeMs: 60000, repair });
    if (reply.kind !== 'ready' || JSON.stringify(reply.versions) !== JSON.stringify(ONE_VERSIONS)) throw new Error('Invalid prototype initialization response.');
    return reply;
  }
  async generate(request: GenerateRequest, strategy: Strategy = 'construction'): Promise<OneResult> {
    const snapshot = structuredClone(request);
    checkRequest(snapshot); this.start();
    if (snapshot.workerInstance !== this.instance) throw new Error('Request belongs to another Cross+1 worker instance.');
    const reply = await this.send({ kind: 'generate', id: snapshot.requestId, instance: this.instance, timeMs: snapshot.budget.timeMs, request: snapshot, strategy });
    if (reply.kind !== 'result' || !matchesPending({ kind: 'result', workerInstance: reply.instance, challenge: reply.result.challenge }, snapshot)) throw new Error('Stale or mismatched Cross+1 result.');
    if (!SLOTS.includes(reply.result.witnessSlot)) throw new Error('Invalid Cross+1 witness slot.');
    verifyWitnessSlot(reply.result.challenge, reply.result.witnessSlot);
    return reply.result;
  }
}
