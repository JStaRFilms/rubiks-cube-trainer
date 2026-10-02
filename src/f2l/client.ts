import type { PersonalAlgorithmRecord, SemanticValidator } from '../store/records';
import type { F2LGeneration, F2LReply, F2LRequest } from './protocol';
import { f2lEntry, F2L_VERSIONS, rotateGuidance } from './model';
import { auf } from '../cases/identity';
export class F2LClient {
  private worker: Worker | null = null;
  private instance = '';
  private pending: { id: string; resolve: (reply: F2LReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  private initialized = false;
  get currentInstance(): string | null { return this.worker ? this.instance : null; }
  get workerInstance(): string { this.start(); return this.instance; }
  private start() {
    if (this.worker) return;
    this.instance = crypto.randomUUID();
    const worker = new Worker(new URL('./f2l.worker.ts', import.meta.url), { type: 'module' }); this.worker = worker;
    worker.onerror = () => { if (this.worker === worker) this.reset('F2L worker crashed. Retry with the same options.'); };
    worker.onmessage = (event: MessageEvent<F2LReply>) => {
      const reply = event.data, pending = this.pending;
      if (this.worker !== worker || reply.instance !== this.instance || !pending || reply.id !== pending.id) return;
      clearTimeout(pending.timer); this.pending = null;
      if (reply.kind === 'failed') pending.reject(new Error(reply.message)); else pending.resolve(reply);
    };
  }
  private reset(message: string) {
    this.worker?.terminate(); this.worker = null; this.initialized = false;
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.reject(new Error(message)); this.pending = null; }
  }
  suspend() { this.reset('F2L request cancelled.'); }
  private send(message: F2LRequest): Promise<F2LReply> {
    if (this.pending) throw Error('F2L accepts one pending operation at a time.');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.reset('F2L initialization or validation timed out. Retry.'), 60000);
      this.pending = { id: message.id, resolve, reject, timer }; this.worker?.postMessage(message);
    });
  }
  async initialize() {
    this.start();
    if (this.initialized) return;
    const reply = await this.send({ kind: 'initialize', id: crypto.randomUUID(), instance: this.instance });
    if (reply.kind !== 'ready') throw Error('Invalid F2L readiness response.');
    this.initialized = true;
  }
  async generate(request: F2LGeneration, algorithms: PersonalAlgorithmRecord[]) {
    this.start(); const snapshot = structuredClone(request), instance = this.instance;
    const reply = await this.send({ kind: 'generate', id: snapshot.requestId, instance, request: snapshot, algorithms: structuredClone(algorithms) });
    if (reply.kind !== 'challenge' || reply.value.requestId !== snapshot.requestId || reply.value.epoch !== snapshot.epoch || JSON.stringify(reply.value.frame) !== JSON.stringify(snapshot.frame) || JSON.stringify(reply.value.versions) !== JSON.stringify(F2L_VERSIONS) || reply.value.options.trainer !== 'f2l' || reply.value.options.caseId !== snapshot.caseId || reply.value.options.slot !== snapshot.slot || reply.value.options.hint !== snapshot.hint || reply.value.options.mode !== snapshot.mode || JSON.stringify(reply.value.scramble) !== JSON.stringify([...rotateGuidance(f2lEntry(snapshot.caseId).setup, snapshot.slot), ...auf(snapshot.preAuf)])) throw Error('Stale or mismatched F2L presentation.');
    return reply.value;
  }
  async validateAttempt(value: unknown) {
    this.start(); const reply = await this.send({ kind: 'attempt', id: crypto.randomUUID(), instance: this.instance, value });
    if (reply.kind !== 'attempt') throw Error('Invalid F2L attempt response.'); return reply.value;
  }
  async validateTrainingData(value: Parameters<SemanticValidator['validateTrainingData']>[0]) {
    this.start(); const reply = await this.send({ kind: 'training', id: crypto.randomUUID(), instance: this.instance, value });
    if (reply.kind !== 'training') throw Error('Invalid F2L training-data response.'); return reply.value;
  }
}
