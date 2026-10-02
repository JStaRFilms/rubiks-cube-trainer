import type { AttemptRecord, PersonalAlgorithmRecord, PracticeSetRecord, SemanticValidator, SessionRecord } from '../store/records';
import { loadEngine } from '../cube/engine';
import { validateLL } from './validation';
import { invertMoves } from '../cube/notation';
import { auf } from '../cases/identity';
import { LL_VERSIONS, llEntry, presentLLGuidance, yawGuidance, type LLGeneration } from './model';
import type { RunOptions } from './runs';
import type { LLReply, LLRequest } from './protocol';
export class LLClient {
  private worker: Worker | null = null;
  private instance = '';
  private initialized = false;
  private pending: { id: string; resolve: (reply: LLReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  get currentInstance(): string | null { return this.worker ? this.instance : null; }
  get workerInstance(): string { this.start(); return this.instance; }
  private start() {
    if (this.worker) return;
    this.instance = crypto.randomUUID();
    const worker = new Worker(new URL('./ll.worker.ts', import.meta.url), { type: 'module' }); this.worker = worker;
    worker.onerror = () => { if (this.worker === worker) this.reset('Last-layer worker crashed. Retry.'); };
    worker.onmessage = (event: MessageEvent<LLReply>) => {
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
  suspend() { this.reset('Last-layer request cancelled.'); }
  private send(message: LLRequest): Promise<LLReply> {
    if (this.pending) throw Error('Last-layer worker accepts one operation at a time.');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.reset('Last-layer initialization or validation timed out.'), 60000);
      this.pending = { id: message.id, resolve, reject, timer }; this.worker?.postMessage(message);
    });
  }
  async initialize() {
    this.start(); if (this.initialized) return;
    const reply = await this.send({ kind: 'initialize', id: crypto.randomUUID(), instance: this.instance });
    if (reply.kind !== 'ready') throw Error('Invalid last-layer readiness response.'); this.initialized = true;
  }
  async generate(request: LLGeneration, algorithms: PersonalAlgorithmRecord[]) {
    this.start(); const instance = this.instance, snapshot = structuredClone(request), frozenAlgorithms = structuredClone(algorithms);
    const reply = await this.send({ kind: 'generate', id: snapshot.requestId, instance: this.instance, request: snapshot, algorithms: frozenAlgorithms });
    const expectedSetup = [...yawGuidance(llEntry(snapshot.trainer, snapshot.caseId).setup, snapshot.yaw), ...auf(snapshot.preAuf)];
    if (reply.kind !== 'challenge' || reply.value.requestId !== snapshot.requestId || reply.value.epoch !== snapshot.epoch || JSON.stringify(reply.value.frame) !== JSON.stringify(snapshot.frame) || JSON.stringify(reply.value.versions) !== JSON.stringify(LL_VERSIONS) || reply.value.options.trainer !== snapshot.trainer || reply.value.options.caseId !== snapshot.caseId || reply.value.options.preAuf !== snapshot.preAuf || reply.value.options.yaw !== snapshot.yaw || reply.value.options.mode !== snapshot.mode || JSON.stringify(reply.value.scramble) !== JSON.stringify(expectedSetup)) throw Error('Stale or mismatched last-layer presentation.');
    const override = frozenAlgorithms.find((record) => record.caseId === snapshot.caseId), entry = llEntry(snapshot.trainer, snapshot.caseId);
    const expectedSolution = [...invertMoves(auf(snapshot.preAuf)), ...yawGuidance(override ? [...auf(override.preAuf), ...override.moves] : entry.defaultAlgorithm, snapshot.yaw)];
    const engine = await loadEngine();
    if (this.currentInstance !== instance) throw Error('Last-layer request cancelled.');
    const challenge = validateLL(reply.value, engine), expected = presentLLGuidance(engine, snapshot.trainer, challenge.start, expectedSolution);
    if (JSON.stringify(challenge.proof.solution) !== JSON.stringify(expected.solution) || challenge.proof.finalAuf !== expected.finalAuf) throw Error('Mismatched frozen last-layer guidance.');
    return challenge;
  }
  async plan(set: PracticeSetRecord, session: SessionRecord, options: RunOptions, algorithms: PersonalAlgorithmRecord[], setId: string | null) {
    this.start(); const frozen = structuredClone({ set, session, options, algorithms, setId });
    const reply = await this.send({ kind: 'plan', id: crypto.randomUUID(), instance: this.instance, ...frozen });
    if (reply.kind !== 'plan' || JSON.stringify(reply.value.setSnapshot) !== JSON.stringify(frozen.set) || reply.value.sessionId !== frozen.session.id || reply.value.setId !== setId || !reply.value.snapshot || JSON.stringify(reply.value.snapshot.frame) !== JSON.stringify(frozen.options.frame) || reply.value.snapshot.mode !== frozen.options.mode || reply.value.snapshot.shuffle !== frozen.options.shuffle || reply.value.snapshot.preAuf !== frozen.options.preAuf || reply.value.snapshot.yaw !== frozen.options.yaw || JSON.stringify(reply.value.snapshot.settings) !== JSON.stringify(frozen.options.settings)) throw Error('Stale or mismatched frozen run plan.');
    for (const guidance of reply.value.snapshot.guidance) {
      const entry = llEntry(frozen.set.trainer === 'oll' ? 'oll' : 'pll', guidance.caseId), override = frozen.algorithms.find((record) => record.caseId === guidance.caseId);
      if (guidance.preAuf !== (override?.preAuf ?? 0) || JSON.stringify(guidance.moves) !== JSON.stringify(override?.moves ?? entry.defaultAlgorithm)) throw Error('Mismatched run algorithm snapshot.');
    }
    return reply.value;
  }
  async validateAttempt(value: unknown) {
    this.start(); const reply = await this.send({ kind: 'attempt', id: crypto.randomUUID(), instance: this.instance, value });
    if (reply.kind !== 'attempt') throw Error('Invalid last-layer attempt response.'); return reply.value;
  }
  async validateTrainingData(value: Parameters<SemanticValidator['validateTrainingData']>[0], attempts: AttemptRecord[] = [], sessions: SessionRecord[] = []) {
    this.start(); const reply = await this.send({ kind: 'training', id: crypto.randomUUID(), instance: this.instance, value, attempts, sessions });
    if (reply.kind !== 'training') throw Error('Invalid last-layer training-data response.'); return reply.value;
  }
}
