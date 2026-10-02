import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { loadEngine } from '../../src/cube/engine';
import { LLClient } from '../../src/ll/client';
import { createLL, llEntry, type LLGeneration, type LLChallenge } from '../../src/ll/model';
import type { PersonalAlgorithmRecord } from '../../src/store/records';
import type { LLReply, LLRequest } from '../../src/ll/protocol';
let request: LLGeneration, actual: LLChallenge;
beforeAll(async () => { const engine = await loadEngine(); request = { trainer: 'pll', requestId: 'actual', epoch: 4, caseId: 'pll:speeden-v1:00t', preAuf: 2, yaw: 3, mode: 'recognition', frame: engine.frame('red') }; actual = createLL(engine, request); });
class WorkerFixture {
  static latest: WorkerFixture;
  messages: LLRequest[] = []; terminated = false;
  onmessage: ((event: MessageEvent<LLReply>) => void) | null = null; onerror: (() => void) | null = null;
  constructor() { WorkerFixture.latest = this; }
  postMessage(message: LLRequest) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(reply: LLReply) { this.onmessage?.(new MessageEvent('message', { data: reply })); }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function pending() { vi.stubGlobal('Worker', WorkerFixture); const client = new LLClient(), instance = client.workerInstance, snapshot = structuredClone(request), promise = client.generate(snapshot, []), worker = WorkerFixture.latest; const reply: LLReply = { kind: 'challenge', id: request.requestId, instance, value: structuredClone(actual) }; return { client, instance, snapshot, promise, worker, reply }; }
it.each(['request', 'epoch', 'frame', 'version', 'case', 'trainer', 'preU', 'yaw', 'mode', 'setup', 'guidance'] as const)('rejects mismatched actual last-layer %s', async (field) => {
  const { promise, worker, reply, client } = pending(); if (reply.kind !== 'challenge') throw Error('Wrong reply.');
  if (field === 'request') reply.value.requestId = 'stale'; if (field === 'epoch') reply.value.epoch++; if (field === 'frame') reply.value.frame.crossColor = 'blue'; if (field === 'version') reply.value.versions.dataset = 'future'; if (field === 'case') reply.value.options.caseId = 'pll:speeden-v1:00h'; if (field === 'trainer') reply.value.options.trainer = 'oll'; if (field === 'preU') reply.value.options.preAuf = 0; if (field === 'yaw') reply.value.options.yaw = 0; if (field === 'mode') reply.value.options.mode = 'execution'; if (field === 'setup') reply.value.scramble = []; if (field === 'guidance') reply.value.proof.solution.push({ family: 'U', amount: 1 });
  worker.reply(reply); await expect(promise).rejects.toThrow(/mismatch/i); client.suspend();
});
it('ignores wrong instances/IDs and caller mutation, then suspends old-worker replies', async () => {
  const { client, promise, snapshot, worker, reply, instance } = pending(); snapshot.preAuf = 0; snapshot.frame.crossColor = 'blue'; worker.reply({ ...reply, instance: 'wrong' }); worker.reply({ ...reply, id: 'wrong' }); worker.reply(reply); await expect(promise).resolves.toEqual(actual);
  const stale = client.generate(request, []), rejected = expect(stale).rejects.toThrow('cancelled'); client.suspend(); await rejected; expect(worker.terminated).toBe(true);
  const fresh = client.generate(request, []), latest = WorkerFixture.latest; expect(client.workerInstance).not.toBe(instance); worker.reply(reply); latest.reply({ ...reply, instance: client.workerInstance }); await expect(fresh).resolves.toEqual(actual);
  const engine = await loadEngine(), entry = llEntry(request.trainer, request.caseId);
  const personal: PersonalAlgorithmRecord = { caseId: entry.id, slot: 'canonical', preAuf: 0, moves: [...entry.defaultAlgorithm, { family: 'U', amount: 1 }, { family: 'x', amount: 1 }], updatedAt: '2026-10-01T00:00:00.000Z', identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: 'cubing@0.63.8' };
  const guided = createLL(engine, request, [personal]), personalized = client.generate(request, [personal]); personal.moves = [];
  latest.reply({ kind: 'challenge', id: request.requestId, instance: client.workerInstance, value: guided }); await expect(personalized).resolves.toEqual(guided); expect(guided.proof.finalAuf).toBe(3); client.suspend();
});
it('watchdog and crashes reject the same requested case without fallback', async () => { vi.useFakeTimers(); const expired = pending(), rejected = expect(expired.promise).rejects.toThrow('timed out'); await vi.advanceTimersByTimeAsync(60000); await rejected; expect(expired.worker.terminated).toBe(true); const crashed = pending(), failure = expect(crashed.promise).rejects.toThrow('crashed'); crashed.worker.onerror?.(); await failure; });
