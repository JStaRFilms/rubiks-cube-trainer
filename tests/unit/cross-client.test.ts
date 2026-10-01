import { afterEach, expect, it, vi } from 'vitest';
import { CrossClient } from '../../src/cross/client';
import type { CrossRequest, CrossReply } from '../../src/cross/protocol';
import { attempt } from './fixtures';
import { CROSS_VERSIONS } from '../../src/cross/table';

class WorkerFixture {
  static latest: WorkerFixture;
  messages: CrossRequest[] = [];
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;
  constructor() { WorkerFixture.latest = this; }
  postMessage(request: CrossRequest) { this.messages.push(request); }
  terminate() { this.terminated = true; }
  reply(reply: CrossReply) { this.onmessage?.(new MessageEvent('message', { data: reply })); }
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function pending() {
  vi.stubGlobal('Worker', WorkerFixture); const client = new CrossClient(), promise = client.generate('request', 7, 8, 'white');
  const worker = WorkerFixture.latest, message = worker.messages[0]; if (!message || message.kind !== 'generate') throw new Error('No generation request');
  const value = { ...structuredClone(attempt.challenge), challengeId: 'real', requestId: message.request.requestId, epoch: message.request.epoch, versions: CROSS_VERSIONS, options: message.request.options, frame: message.request.frame };
  return { client, promise, worker, message, value };
}
it.each(['requestId', 'epoch', 'versions', 'options', 'frame'] as const)('rejects a stale or mismatched %s without adopting a challenge', async (field) => {
  const { promise, worker, message, value } = pending();
  const altered = { ...value, [field]: field === 'requestId' ? 'stale' : field === 'epoch' ? 6 : field === 'versions' ? { ...CROSS_VERSIONS, tables: 'other' } : field === 'options' ? { trainer: 'cross', K: 7 } : { ...value.frame, crossColor: 'blue' } };
  // The fixture sends unknown wire input to the real client metadata guard.
  worker.onmessage?.(new MessageEvent('message', { data: { kind: 'challenge', id: message.id, instance: message.instance, value: altered } }));
  await expect(promise).rejects.toThrow('Stale or mismatched'); expect(worker.messages).toHaveLength(1);
});
it('ignores another worker instance, cancels immediately, and cannot adopt its late reply', async () => {
  const { client, promise, worker, message } = pending();
  worker.reply({ kind: 'failed', id: message.id, instance: 'another-worker', message: 'ignored' }); expect(worker.terminated).toBe(false);
  const rejected = expect(promise).rejects.toThrow('cancelled'); client.cancel(message.id); await rejected;
  worker.reply({ kind: 'failed', id: message.id, instance: message.instance, message: 'late' }); expect(worker.messages.at(-1)?.kind).toBe('cancel');
});
it('enforces the main-thread watchdog, terminates a dead worker and rejects a late reply', async () => {
  vi.useFakeTimers(); const { promise, worker, message } = pending(), rejected = expect(promise).rejects.toThrow('deadline exceeded');
  await vi.advanceTimersByTimeAsync(60000); await rejected; expect(worker.terminated).toBe(true);
  worker.reply({ kind: 'failed', id: message.id, instance: message.instance, message: 'late' });
});
it('reports a worker crash without silently lowering requested caps', async () => {
  const { promise, worker, message } = pending(), rejected = expect(promise).rejects.toThrow('crashed'); worker.onerror?.(); await rejected;
  expect(message.kind === 'generate' && message.request.options).toEqual({ trainer: 'cross', K: 8 }); expect(worker.terminated).toBe(true);
});
