import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { loadEngine } from '../../src/cube/engine';
import { F2LClient } from '../../src/f2l/client';
import { createF2L, type F2LChallenge } from '../../src/f2l/model';
import type { F2LGeneration, F2LReply, F2LRequest } from '../../src/f2l/protocol';
let actual: F2LChallenge, request: F2LGeneration;
beforeAll(async () => {
  const engine = await loadEngine(); request = { requestId: 'actual-request', epoch: 7, caseId: 'f2l:lieberkind-v1:041', slot: 'BR', hint: true, mode: 'recognition', preAuf: 3, frame: engine.frame('blue') };
  actual = createF2L(engine, request);
});
class WorkerFixture {
  static latest: WorkerFixture;
  messages: F2LRequest[] = []; terminated = false;
  onmessage: ((event: MessageEvent<F2LReply>) => void) | null = null; onerror: (() => void) | null = null;
  constructor() { WorkerFixture.latest = this; }
  postMessage(message: F2LRequest) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(reply: F2LReply) { this.onmessage?.(new MessageEvent('message', { data: reply })); }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function pending() {
  vi.stubGlobal('Worker', WorkerFixture);
  const client = new F2LClient(), instance = client.workerInstance, snapshot = structuredClone(request), promise = client.generate(snapshot, []), worker = WorkerFixture.latest;
  const reply: F2LReply = { kind: 'challenge', id: request.requestId, instance, value: structuredClone(actual) };
  return { client, instance, snapshot, promise, worker, reply };
}
it.each(['request', 'epoch', 'frame', 'version', 'case', 'slot', 'hint', 'mode', 'preU'] as const)('rejects mismatched %s from an actual generated presentation', async (field) => {
  const { promise, worker, reply } = pending(); if (reply.kind !== 'challenge') throw Error('Wrong reply.');
  if (field === 'request') reply.value.requestId = 'stale';
  if (field === 'epoch') reply.value.epoch++;
  if (field === 'frame') reply.value.frame.crossColor = 'white';
  if (field === 'version') reply.value.versions.dataset = 'future';
  if (field === 'case') reply.value.options.caseId = 'f2l:lieberkind-v1:001';
  if (field === 'slot') reply.value.options.slot = 'FL';
  if (field === 'hint') reply.value.options.hint = false;
  if (field === 'mode') reply.value.options.mode = 'execution';
  if (field === 'preU') reply.value.scramble.push({ family: 'U', amount: 1 });
  worker.reply(reply); await expect(promise).rejects.toThrow('Stale or mismatched');
});
it('ignores unrelated IDs/instances and keeps the original request immutable', async () => {
  const { promise, snapshot, worker, reply } = pending(); snapshot.slot = 'BL'; snapshot.epoch++;
  worker.reply({ ...reply, instance: 'other' }); worker.reply({ ...reply, id: 'other' }); worker.reply(reply);
  await expect(promise).resolves.toEqual(actual);
});
it('terminates stale work and ignores late replies from an old worker after recovery', async () => {
  const { client, promise, worker, reply, instance } = pending(); const rejected = expect(promise).rejects.toThrow('cancelled');
  client.suspend(); await rejected; expect(worker.terminated).toBe(true); expect(client.currentInstance).toBeNull();
  const fresh = client.generate(request, []), latest = WorkerFixture.latest; expect(client.workerInstance).not.toBe(instance);
  worker.reply(reply); latest.reply({ ...reply, instance: client.workerInstance }); await expect(fresh).resolves.toEqual(actual); client.suspend();
});
it('watchdog/crash reject without silently changing options', async () => {
  vi.useFakeTimers(); const expired = pending(), rejected = expect(expired.promise).rejects.toThrow('timed out');
  await vi.advanceTimersByTimeAsync(60000); await rejected; expect(expired.worker.terminated).toBe(true);
  expect(expired.worker.messages[0]).toMatchObject({ request });
  const crashed = pending(), failure = expect(crashed.promise).rejects.toThrow('crashed'); crashed.worker.onerror?.(); await failure;
});
