import { loadEngine } from '../cube/engine';
import { decodeFrame } from '../cube/validation';
import { decodeGoalOptions, integer, text } from '../store/validation';
import { createLL, initializeLL } from './model';
import { validateLL, validateLLAttempt } from './validation';
import { createRun, validateLLTraining, validateRun } from './runs';
import type { LLReply, LLRequest } from './protocol';
let initialized = false, instance: string | null = null, queue = Promise.resolve();
self.onmessage = (event: MessageEvent<LLRequest>) => {
  const message = event.data;
  queue = queue.then(async () => {
    const base = { id: message.id, instance: message.instance }, reply = (value: LLReply) => self.postMessage(value);
    try {
      if (instance !== null && instance !== message.instance) throw Error('Last-layer worker identity changed.'); instance = message.instance;
      const engine = await loadEngine(); if (!initialized) { initializeLL(engine); initialized = true; }
      if (message.kind === 'initialize') reply({ ...base, kind: 'ready' });
      else if (message.kind === 'attempt') reply({ ...base, kind: 'attempt', value: validateLLAttempt(message.value, engine) });
      else if (message.kind === 'training') reply({ ...base, kind: 'training', value: validateLLTraining(engine, message.value, message.attempts, message.sessions) });
      else if (message.kind === 'plan') {
        const run = createRun(engine, message.set, message.session, message.options, message.algorithms, message.setId);
        reply({ ...base, kind: 'plan', value: validateRun(run, engine, [], [message.session]) });
      } else if (message.kind === 'generate') {
        const request = message.request, options = decodeGoalOptions({ trainer: request.trainer, caseId: request.caseId, preAuf: request.preAuf, yaw: request.yaw, mode: request.mode });
        if ((options.trainer !== 'oll' && options.trainer !== 'pll') || text(request.requestId) !== message.id) throw Error('Invalid last-layer request.');
        const challenge = createLL(engine, { ...options, trainer: options.trainer, requestId: request.requestId, epoch: integer(request.epoch), frame: decodeFrame(request.frame, engine) }, message.algorithms);
        reply({ ...base, kind: 'challenge', value: validateLL(challenge, engine) });
      } else throw Error('Unsupported last-layer operation.');
    } catch (error) { reply({ ...base, kind: 'failed', message: error instanceof Error ? error.message : 'Last-layer worker failed.' }); }
  });
};
