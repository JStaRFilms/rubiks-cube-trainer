import { loadEngine } from '../cube/engine';
import { QUARTERS } from '../cases/identity';
import { decodeFrame } from '../cube/validation';
import { decodeGoalOptions, integer, text } from '../store/validation';
import { createF2L, initializeF2L } from './model';
import { validateF2L, validateF2LAttempt, validateF2LTraining } from './validation';
import type { F2LReply, F2LRequest } from './protocol';
let initialized = false, instance: string | null = null;
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<F2LRequest>) => {
  const message = event.data;
  queue = queue.then(async () => {
    const base = { id: message.id, instance: message.instance }, reply = (value: F2LReply) => self.postMessage(value);
    try {
      if (instance !== null && instance !== message.instance) throw Error('F2L worker identity changed.');
      instance = message.instance;
      const engine = await loadEngine();
      if (!initialized) { initializeF2L(engine); initialized = true; }
      if (message.kind === 'initialize') reply({ ...base, kind: 'ready' });
      else if (message.kind === 'attempt') reply({ ...base, kind: 'attempt', value: validateF2LAttempt(message.value, engine) });
      else if (message.kind === 'training') reply({ ...base, kind: 'training', value: validateF2LTraining(engine, message.value) });
      else if (message.kind === 'generate') {
        const request = message.request, options = decodeGoalOptions({ trainer: 'f2l', caseId: request.caseId, slot: request.slot, hint: request.hint, mode: request.mode });
        if (options.trainer !== 'f2l' || !QUARTERS.includes(request.preAuf) || text(request.requestId) !== message.id) throw Error('Invalid F2L request correspondence or angle.');
        const challenge = createF2L(engine, { ...options, requestId: request.requestId, epoch: integer(request.epoch), preAuf: request.preAuf, frame: decodeFrame(request.frame, engine) }, message.algorithms);
        reply({ ...base, kind: 'challenge', value: validateF2L(challenge, engine) });
      } else throw Error('Unsupported F2L operation.');
    } catch (reason) { reply({ ...base, kind: 'failed', message: reason instanceof Error ? reason.message : 'F2L worker failed.' }); }
  });
};
