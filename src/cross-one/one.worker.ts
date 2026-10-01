import { loadEngine } from '../cube/engine';
import { initializeTable } from '../cross/cache';
import { CROSS_COUNT } from '../cross/table';
import { decodeWorkerRequest } from '../workers/protocol';
import { generateOne } from './generate';
import { ONE_VERSIONS, OneModel } from './model';
import type { OneReply, OneRequest } from './protocol';
import { OneFailure, WorkBudget } from './search';
import { checkRequest, validateOne, validateOneAttempt } from './validation';

let model: OneModel | undefined;
let workerInstance: string | null = null;
let queue = Promise.resolve();
const cancelled = new Set<string>();
self.onmessage = (event: MessageEvent<OneRequest>) => {
  const message = event.data;
  if (message.kind === 'cancel') { if (message.instance === workerInstance) cancelled.add(message.id); return; }
  const received = performance.now();
  queue = queue.then(async () => {
    const base = { id: message.id, instance: message.instance }, reply = (data: OneReply) => self.postMessage(data);
    try {
      if (workerInstance !== null && workerInstance !== message.instance) throw new OneFailure('version-mismatch', 'Cross+1 worker instance changed.');
      workerInstance = message.instance;
      const outerBudget = new WorkBudget(Math.max(0, message.timeMs - (performance.now() - received)), Number.MAX_SAFE_INTEGER, () => cancelled.has(message.id));
      outerBudget.check();
      const engine = await loadEngine(); outerBudget.check();
      if (message.kind === 'initialize' && JSON.stringify(message.versions) !== JSON.stringify(ONE_VERSIONS)) throw new OneFailure('version-mismatch', 'Cross+1 initialization versions do not match.');
      if (!model || message.kind === 'initialize') {
        const initialized = await initializeTable(engine, () => outerBudget.check(), (completed) => reply({ ...base, kind: 'progress', completed, total: CROSS_COUNT }), message.kind !== 'initialize' || message.repair);
        const pairStart = performance.now(), initializedModel = new OneModel(engine, initialized.table);
        await initializedModel.initialize(() => outerBudget.check()); model = initializedModel;
        if (message.kind === 'initialize') {
          outerBudget.check();
          reply({ ...base, kind: 'ready', versions: ONE_VERSIONS, elapsedMs: performance.now() - received, pairInitMs: performance.now() - pairStart, workingBytes: model.byteLength, cache: initialized.cache }); return;
        }
      }
      if (message.kind === 'attempt' || message.kind === 'challenge') {
        if (message.kind === 'attempt') {
          const value = validateOneAttempt(message.value, engine, model); outerBudget.check(); reply({ ...base, kind: 'attempt', value });
        } else {
          const value = validateOne(message.value, engine, model); outerBudget.check(); reply({ ...base, kind: 'challenge', value });
        }
        return;
      }
      if (message.kind !== 'generate') throw new OneFailure('invalid-result', 'Invalid Cross+1 operation.');
      const request = decodeWorkerRequest(message.request, engine);
      if (request.kind !== 'generate' || request.requestId !== message.id || request.workerInstance !== message.instance) throw new OneFailure('version-mismatch', 'Cross+1 request/worker correspondence failed.');
      checkRequest(request);
      if (message.strategy !== 'construction' && message.strategy !== 'random-search') throw new OneFailure('unsupported-options', 'Unknown prototype strategy.');
      const budget = new WorkBudget(Math.max(0, Math.min(request.budget.timeMs, outerBudget.deadline - performance.now())),  request.budget.maxNodes, () => cancelled.has(message.id));
      const result = await generateOne(request, model, budget, message.strategy);
      outerBudget.check(); reply({ ...base, kind: 'result', result });
    } catch (reason) {
      reply({ ...base, kind: 'failed', code: reason instanceof OneFailure ? reason.code : 'invalid-result', message: reason instanceof Error ? reason.message : 'Cross+1 worker failed.' });
    } finally { cancelled.delete(message.id); }
  });
};
