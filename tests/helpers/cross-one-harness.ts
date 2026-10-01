import { OneClient } from '../../src/cross-one/client';
import { ONE_VERSIONS } from '../../src/cross-one/model';
import { TRAINING_FRAMES } from '../../src/cube/frame';
import type { OneRequest, OneReply } from '../../src/cross-one/protocol';
import type { Strategy } from '../../src/cross-one/generate';
import type { GenerateRequest } from '../../src/workers/protocol';
import type { CrossDepth, Slot } from '../../src/store/records';

const client = new OneClient();
function request(instance: string, K: CrossDepth, L: number, slot: Slot | null, seed: string, timeMs = 5000, maxNodes = 10000): GenerateRequest {
  return { kind: 'generate', protocol: 1, requestId: crypto.randomUUID(), epoch: 1, workerInstance: instance, versions: ONE_VERSIONS,
    frame: { crossColor: 'white', colorOfFace: { ...TRAINING_FRAMES.white } }, options: { trainer: 'cross1', K, L, pair: slot ? { kind: 'slot', slot } : { kind: 'any' } }, seed, budget: { timeMs, maxNodes } };
}
Object.assign(window, { oneHarness: {
  initialize: () => client.initialize(),
  stop: () => client.suspend(),
  async sample(K: CrossDepth, L: number, slot: Slot | null, seed: string, strategy: Strategy = 'construction', timeMs = 5000, maxNodes = 10000) {
    const req = request(client.workerInstance, K, L, slot, seed, timeMs, maxNodes), start = performance.now();
    try {
      const result = await client.generate(req, strategy);
      return { status: 'result', elapsedMs: performance.now() - start, candidates: result.metrics.candidates, nodes: result.metrics.nodes, witnessLength: result.challenge.proof.witness.length, crossDepth: result.challenge.proof.crossDepth, witnessSlot: result.witnessSlot, challenge: result.challenge };
    } catch (error) { return { status: error instanceof Error && 'code' in error ? error.code : 'error', message: error instanceof Error ? error.message : String(error), elapsedMs: performance.now() - start }; }
  },
  async wireChecks() {
    const worker = new Worker(new URL('../../src/cross-one/one.worker.ts', import.meta.url), { type: 'module' }), instance = crypto.randomUUID();
    const pending = new Map<string, (reply: OneReply) => void>();
    worker.onmessage = ({ data }: MessageEvent<OneReply>) => { if (data.kind !== 'progress') pending.get(data.id)?.(data); };
    const send = (message: Exclude<OneRequest, { kind: 'cancel' }>) => new Promise<OneReply>((resolve) => { pending.set(message.id, resolve); worker.postMessage(message); });
    const ready = await send({ kind: 'initialize', id: 'init', instance, versions: ONE_VERSIONS, timeMs: 60000, repair: true });
    if (ready.kind !== 'ready') throw new Error('Wire-check initialization failed');
    const results = [];
    for (const field of ['versions', 'K', 'L', 'slot', 'frame', 'requestId', 'workerInstance', 'instance', 'zeroNodes', 'zeroTime'] as const) {
      const req = request(instance, 3, 8, 'FR', `wire-${field}`);
      if (req.options.trainer !== 'cross1') throw new Error('Invalid harness options');
      if (field === 'versions') req.versions = { ...ONE_VERSIONS, tables: 'wrong' };
      else if (field === 'K') req.options.K = 0 as CrossDepth;
      else if (field === 'L') req.options.L = 13;
      else if (field === 'slot') req.options.pair = { kind: 'slot', slot: 'invalid' as Slot };
      else if (field === 'frame') req.frame.crossColor = 'blue';
      else if (field === 'workerInstance') req.workerInstance = 'wrong';
      else if (field === 'zeroNodes') req.budget.maxNodes = 0;
      else if (field === 'zeroTime') req.budget.timeMs = 0;
      const message: OneRequest = { kind: 'generate', id: field === 'requestId' ? 'wrong-id' : req.requestId, instance: field === 'instance' ? 'wrong-instance' : instance, timeMs: 5000, request: req, strategy: 'construction' };
      results.push({ field, reply: await send(message) });
    }
    worker.terminate(); return results;
  },
  async cooperativeCancel() {
    const worker = new Worker(new URL('../../src/cross-one/one.worker.ts', import.meta.url), { type: 'module' }), instance = crypto.randomUUID();
    const pending = new Map<string, (reply: OneReply) => void>();
    worker.onmessage = ({ data }: MessageEvent<OneReply>) => { if (data.kind !== 'progress') pending.get(data.id)?.(data); };
    const send = (message: Exclude<OneRequest, { kind: 'cancel' }>) => new Promise<OneReply>((resolve) => { pending.set(message.id, resolve); worker.postMessage(message); });
    const ready = await send({ kind: 'initialize', id: 'init', instance, versions: ONE_VERSIONS, timeMs: 60000, repair: true });
    if (ready.kind !== 'ready') throw new Error('Cancellation initialization failed');
    const req = request(instance, 8, 12, 'FR', 'hard-cancel', 5000, 1000000);
    const promise = send({ kind: 'generate', id: req.requestId, instance, timeMs: 5000, request: req, strategy: 'random-search' });
    await new Promise((resolve) => setTimeout(resolve, 10)); const start = performance.now();
    worker.postMessage({ kind: 'cancel', id: req.requestId, instance } satisfies OneRequest);
    const reply = await promise; worker.terminate(); return { latencyMs: performance.now() - start, reply };
  },
} });
