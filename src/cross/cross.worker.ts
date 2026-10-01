import { loadEngine } from '../cube/engine';
import { decodeWorkerRequest } from '../workers/protocol';
import { generateCross } from './generate';
import { initializeTable } from './cache';
import { CROSS_COUNT, CROSS_VERSIONS, type CrossTable } from './table';
import { crossValidator, validateChallenge } from './validation';
import type { CrossReply, CrossRequest } from './protocol';

let table: CrossTable | undefined;
let queue = Promise.resolve();
const cancelled = new Set<string>();
self.onmessage = (event: MessageEvent<CrossRequest>) => {
  const message = event.data;
  if (message.kind === 'cancel') { cancelled.add(message.id); return; }
  const received = performance.now();
  queue = queue.then(async () => {
    const reply = (data: CrossReply) => self.postMessage(data);
    const base = { id: message.id, instance: message.instance };
    const check = () => {
      if (cancelled.has(message.id)) throw new Error('Request cancelled. No challenge was adopted.');
      if (!Number.isFinite(message.timeMs) || message.timeMs <= 0 || performance.now() - received >= message.timeMs) throw new Error('Cross budget exhausted. Retry with the same settings.');
    };
    try {
      check(); const engine = await loadEngine(); check();
      let cache: 'verified' | 'rebuilt' | 'memory-only' = 'verified';
      if (!table || message.kind === 'initialize') {
        const initialized = await initializeTable(engine, check, (completed) => reply({ ...base, kind: 'progress', completed, total: CROSS_COUNT }), message.kind !== 'initialize' || message.repair);
        table = initialized.table; cache = initialized.cache;
      }
      check();
      if (message.kind === 'initialize') reply({ ...base, kind: 'ready', tableBytes: table.distances.byteLength, workingBytes: table.byteLength, elapsedMs: performance.now() - received, cache });
      else if (message.kind === 'attempt') reply({ ...base, kind: 'attempt', value: await crossValidator(engine, table).validateAttempt(message.value) });
      else if (message.kind === 'challenge') reply({ ...base, kind: 'challenge', value: validateChallenge(message.value, engine, table) });
      else {
        const request = decodeWorkerRequest(message.request, engine);
        if (request.kind !== 'generate' || request.workerInstance !== message.instance || JSON.stringify(request.versions) !== JSON.stringify(CROSS_VERSIONS)) throw new Error('Cross worker instance or versions do not match.');
        if (request.options.trainer !== 'cross') throw new Error('Unsupported trainer. Only Cross is available.');
        if (request.budget.maxNodes < CROSS_COUNT) throw new Error('Cross node budget exhausted.');
        const deadline = performance.now() + request.budget.timeMs;
        const value = await generateCross(request, engine, table, () => { check(); if (performance.now() >= deadline) throw new Error('Cross generation deadline exhausted.'); });
        check(); reply({ ...base, kind: 'challenge', value });
      }
    } catch (reason) { reply({ ...base, kind: 'failed', message: reason instanceof Error ? reason.message : 'Cross worker failed.' }); }
    finally { cancelled.delete(message.id); }
  });
};
