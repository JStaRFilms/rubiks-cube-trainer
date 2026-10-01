import { afterEach, expect, it, vi } from 'vitest';
import { OneClient } from '../../src/cross-one/client';
import { ONE_VERSIONS } from '../../src/cross-one/model';
import type { OneRequest, OneReply } from '../../src/cross-one/protocol';
import { TRAINING_FRAMES } from '../../src/cube/frame';
import type { GenerateRequest } from '../../src/workers/protocol';
import type { OneResult } from '../../src/cross-one/generate';
import { SOLVED } from '../../src/cube/engine';

class WorkerFixture {
  static latest: WorkerFixture;
  messages: OneRequest[] = [];
  onmessage: ((event: MessageEvent<OneReply>) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;
  constructor() { WorkerFixture.latest = this; }
  postMessage(message: OneRequest) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(reply: OneReply) { this.onmessage?.(new MessageEvent('message', { data: reply })); }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function pending() {
  vi.stubGlobal('Worker', WorkerFixture);
  const client = new OneClient();
  const request: GenerateRequest = { kind: 'generate', protocol: 1, requestId: 'request', epoch: 7, workerInstance: client.workerInstance, versions: ONE_VERSIONS,
    frame: { crossColor: 'white', colorOfFace: { ...TRAINING_FRAMES.white } }, options: { trainer: 'cross1', K: 3, L: 8, pair: { kind: 'slot', slot: 'FR' } }, seed: 'test', budget: { timeMs: 5000, maxNodes: 10000 } };
  const promise = client.generate(request), worker = WorkerFixture.latest;
  // Metadata fixture, not solver evidence. Full-state proof is tested with actual generation separately.
  const result: OneResult = { challenge: { challengeId: 'fixture', requestId: request.requestId, epoch: request.epoch, versions: ONE_VERSIONS, frame: request.frame,
    options: { trainer: 'cross1', K: 3, L: 8, pair: { kind: 'slot', slot: 'FR' } }, start: SOLVED, scramble: [], proof: { kind: 'combined-bound', crossDepth: 1, cap: 8, witness: [{ family: 'R', amount: -1 }], solvedSlots: ['FR'] } }, witnessSlot: 'FR', metrics: { strategy: 'construction', candidates: 1, accepted: 1, nodes: 9, elapsedMs: 1, tailLength: 1 } };
  const reply: OneReply = { kind: 'result', id: request.requestId, instance: request.workerInstance, result };
  return { client, request, promise, worker, reply, result };
}
it.each(['requestId', 'epoch', 'versions', 'K', 'L', 'slot', 'mode', 'frame'] as const)('rejects mismatched %s without adoption', async (field) => {
  const { promise, worker, reply } = pending(), bad = structuredClone(reply);
  if (bad.kind !== 'result') throw new Error('Invalid fixture');
  const c = bad.result.challenge;
  if (field === 'requestId') c.requestId = 'stale';
  else if (field === 'epoch') c.epoch--;
  else if (field === 'versions') c.versions.tables = 'wrong';
  else if (field === 'K') c.options.K = 2;
  else if (field === 'L') c.options.L = 7;
  else if (field === 'slot') c.options.pair = { kind: 'slot', slot: 'BL' };
  else if (field === 'mode') c.options.pair = { kind: 'any' };
  else c.frame.crossColor = 'blue';
  worker.reply(bad); await expect(promise).rejects.toThrow('Stale or mismatched');
});
it('ignores other instances and request IDs, then accepts only the matching snapshot', async () => {
  const { promise, worker, reply, result } = pending();
  worker.reply({ ...reply, instance: 'other' }); worker.reply({ ...reply, id: 'other' });
  worker.reply(reply); await expect(promise).resolves.toEqual(result);
});
it.each(['cancel', 'suspend'] as const)('%s terminates work immediately and ignores old replies after recovery', async (method) => {
  const { client, promise, worker, reply, request } = pending();
  const rejected = expect(promise).rejects.toMatchObject({ code: 'cancelled' }); client[method](); await rejected;
  expect(worker.terminated).toBe(true); worker.reply(reply);
  const fresh = client.workerInstance; expect(fresh).not.toBe(request.workerInstance);
  await expect(client.generate(request)).rejects.toThrow('another');
});
it('watchdog terminates dead work and crash/exhaustion never clamp requested options', async () => {
  vi.useFakeTimers();
  const { promise, worker, request, reply } = pending(), rejected = expect(promise).rejects.toMatchObject({ code: 'budget-exhausted' });
  await vi.advanceTimersByTimeAsync(5000); await rejected; expect(worker.terminated).toBe(true); worker.reply(reply);
  expect(worker.messages[0]).toMatchObject({ request: { options: request.options } });
  const next = pending(), crash = expect(next.promise).rejects.toMatchObject({ code: 'worker-crashed' }); next.worker.onerror?.(); await crash;
  const exhausted = pending(), failure = expect(exhausted.promise).rejects.toMatchObject({ code: 'budget-exhausted' });
  exhausted.worker.reply({ kind: 'failed', id: exhausted.request.requestId, instance: exhausted.request.workerInstance, code: 'budget-exhausted', message: 'No candidate met these caps.' }); await failure;
});
it('retains an immutable request snapshot when the caller mutates its options after dispatch', async () => {
  const { promise, worker, reply, request, result } = pending();
  if (request.options.trainer !== 'cross1') throw new Error('Invalid fixture');
  request.options.L = 2; request.epoch = 99;
  worker.reply(reply); await expect(promise).resolves.toEqual(result);
});
it('rejects witness slot metadata that was not proved for the requested slot', async () => {
  const { promise, worker, reply } = pending(); if (reply.kind !== 'result') throw new Error('Invalid fixture');
  reply.result.witnessSlot = 'BL'; worker.reply(reply); await expect(promise).rejects.toThrow('witness slot');
});
