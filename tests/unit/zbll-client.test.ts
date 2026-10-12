import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { loadEngine } from '../../src/cube/engine';
import { ZBLLClient } from '../../src/zbll/client';
import { createZBLL, defaultZBLLPreferences, type ZBLLGeneration, type ZBLLChallenge } from '../../src/zbll/model';
import type { ZBLLReply, ZBLLRequest } from '../../src/zbll/protocol';
import { ZBLL_CASES } from '../../src/data/zbll';
let request: ZBLLGeneration, actual: ZBLLChallenge;
beforeAll(async () => { const engine = await loadEngine(), entry = ZBLL_CASES[0]; if (!entry) throw Error('Missing actual case.'); request = { requestId: 'actual', epoch: 2, caseId: entry.id, preAuf: 2, yaw: 3, frame: engine.frame('blue'), selection: defaultZBLLPreferences }; actual = createZBLL(engine, request); });
class WorkerFixture {
  static latest: WorkerFixture;
  messages: ZBLLRequest[] = []; terminated = false;
  onmessage: ((event: MessageEvent<ZBLLReply>) => void) | null = null; onerror: (() => void) | null = null;
  constructor() { WorkerFixture.latest = this; }
  postMessage(message: ZBLLRequest) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(reply: ZBLLReply) { this.onmessage?.(new MessageEvent('message', { data: reply })); }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function pending() { vi.stubGlobal('Worker', WorkerFixture); const client = new ZBLLClient(), instance = client.workerInstance, snapshot = structuredClone(request), promise = client.generate(snapshot, []), worker = WorkerFixture.latest; const reply: ZBLLReply = { kind: 'challenge', id: request.requestId, instance, value: structuredClone(actual) }; return { client, instance, snapshot, promise, worker, reply }; }
it.each(['request', 'epoch', 'frame', 'version', 'case', 'preU', 'yaw', 'mode', 'pool', 'policy', 'setup', 'guidance', 'membership'] as const)('rejects actual ZBLL reply %s mismatch', async (field) => {
  const { promise, worker, reply, client } = pending(); if (reply.kind !== 'challenge') throw Error('Wrong response.'); const c = reply.value;
  if (field === 'request') c.requestId = 'stale'; if (field === 'epoch') c.epoch++; if (field === 'frame') c.frame.crossColor = 'red'; if (field === 'version') c.versions.dataset = 'future'; if (field === 'case') c.options.caseId = 'unknown'; if (field === 'preU') c.options.preAuf = 0; if (field === 'yaw') c.options.yaw = 0; if (field === 'mode') { c.options.mode = 'recognition'; c.options.selection.mode = 'recognition'; } if (field === 'pool') c.options.selection.caseIds = [c.options.caseId]; if (field === 'policy') c.options.selection.shuffle = false; if (field === 'setup') c.scramble = []; if (field === 'guidance') c.proof.solution.push({ family: 'U', amount: 1 }); if (field === 'membership') c.proof.membership.datasetVersion = 'future';
  worker.reply(reply); await expect(promise).rejects.toThrow(); client.suspend();
});
it('freezes caller inputs, ignores wrong ID/instance and cancels late old-worker replies', async () => {
  const { client, promise, snapshot, worker, reply, instance } = pending(); snapshot.selection.caseIds = []; snapshot.frame.crossColor = 'red'; worker.reply({ ...reply, instance: 'wrong' }); worker.reply({ ...reply, id: 'wrong' }); worker.reply(reply); await expect(promise).resolves.toEqual(actual);
  const stale = client.generate(request, []), rejected = expect(stale).rejects.toThrow('cancelled'); client.suspend(); await rejected; expect(worker.terminated).toBe(true);
  const fresh = client.generate(request, []), latest = WorkerFixture.latest; expect(client.workerInstance).not.toBe(instance); worker.reply(reply); latest.reply({ ...reply, instance: client.workerInstance }); await expect(fresh).resolves.toEqual(actual); client.suspend();
});
it('rejects a mathematically valid substituted guide and cancellation after the reply before engine validation', async () => {
  const substituted = pending(); if (substituted.reply.kind !== 'challenge') throw Error('Wrong response.'); substituted.reply.value.proof.solution.push({ family: 'U', amount: 1 }); substituted.reply.value.proof.finalAuf = 3; substituted.worker.reply(substituted.reply); await expect(substituted.promise).rejects.toThrow('mismatched'); substituted.client.suspend();
  const cancelled = pending(); cancelled.worker.reply(cancelled.reply); cancelled.client.suspend(); await expect(cancelled.promise).rejects.toThrow('cancelled');
});
it('watchdog and crashes reject without fallback or invented history', async () => { vi.useFakeTimers(); const expired = pending(), rejected = expect(expired.promise).rejects.toThrow('timed out'); await vi.advanceTimersByTimeAsync(60000); await rejected; expect(expired.worker.terminated).toBe(true); const crashed = pending(), failure = expect(crashed.promise).rejects.toThrow('crashed'); crashed.worker.onerror?.(); await failure; });
