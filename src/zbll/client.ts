import { loadEngine } from '../cube/engine';
import type { PersonalAlgorithmRecord } from '../store/records';
import { createZBLL, type ZBLLGeneration } from './model';
import { validateZBLL } from './validation';
import type { ZBLLReply, ZBLLRequest } from './protocol';
export class ZBLLClient {
  private worker: Worker | null = null;
  private instance = '';
  private initialized = false;
  private pending: { id: string; resolve: (reply: ZBLLReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  get currentInstance(): string | null { return this.worker ? this.instance : null; }
  get workerInstance(): string { this.start(); return this.instance; }
  private start() {
    if (this.worker) return;
    this.instance = crypto.randomUUID();
    const worker = new Worker(new URL('./zbll.worker.ts', import.meta.url), { type: 'module' }); this.worker = worker;
    worker.onerror = () => { if (this.worker === worker) this.reset('ZBLL worker crashed. Retry.'); };
    worker.onmessage = (event: MessageEvent<ZBLLReply>) => {
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
  suspend() { this.reset('ZBLL request cancelled.'); }
  private send(message: ZBLLRequest): Promise<ZBLLReply> {
    if (this.pending) throw Error('ZBLL accepts one operation at a time.');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.reset('ZBLL initialization or validation timed out.'), 60000);
      this.pending = { id: message.id, resolve, reject, timer }; this.worker?.postMessage(message);
    });
  }
  async initialize() {
    this.start(); if (this.initialized) return;
    const instance = this.instance, reply = await this.send({ kind: 'initialize', id: crypto.randomUUID(), instance });
    if (this.currentInstance !== instance || reply.kind !== 'ready') throw Error('Invalid ZBLL readiness response.'); this.initialized = true;
  }
  async generate(request: ZBLLGeneration, algorithms: PersonalAlgorithmRecord[]) {
    this.start(); const instance = this.instance, snapshot = structuredClone(request), frozenAlgorithms = structuredClone(algorithms);
    const reply = await this.send({ kind: 'generate', id: snapshot.requestId, instance, request: snapshot, algorithms: frozenAlgorithms });
    if (reply.kind !== 'challenge') throw Error('Invalid ZBLL challenge response.');
    const engine = await loadEngine();
    if (this.currentInstance !== instance) throw Error('ZBLL request cancelled.');
    const challenge = validateZBLL(reply.value, engine), expected = validateZBLL(createZBLL(engine, snapshot, frozenAlgorithms), engine);
    if (JSON.stringify({ ...challenge, challengeId: '' }) !== JSON.stringify({ ...expected, challengeId: '' })) throw Error('Stale or mismatched frozen ZBLL presentation.');
    return challenge;
  }
  async validateAttempt(value: unknown) {
    this.start(); const instance = this.instance, reply = await this.send({ kind: 'attempt', id: crypto.randomUUID(), instance, value });
    if (this.currentInstance !== instance || reply.kind !== 'attempt') throw Error('Invalid ZBLL attempt response.'); return reply.value;
  }
}
