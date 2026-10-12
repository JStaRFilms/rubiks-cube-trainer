import { loadEngine } from '../cube/engine';
import { decodeFrame } from '../cube/validation';
import { decodeGoalOptions, integer, text } from '../store/validation';
import { exact } from '../ll/validation';
import { createZBLL, initializeZBLL } from './model';
import { validateZBLL, validateZBLLAttempt } from './validation';
import type { ZBLLReply, ZBLLRequest } from './protocol';
let initialized = false, instance: string | null = null, queue = Promise.resolve();
self.onmessage = (event: MessageEvent<ZBLLRequest>) => {
  const message = event.data;
  queue = queue.then(async () => {
    const base = { id: message.id, instance: message.instance }, reply = (value: ZBLLReply) => self.postMessage(value);
    try {
      if (instance !== null && instance !== message.instance) throw Error('ZBLL worker identity changed.'); instance = message.instance;
      const engine = await loadEngine();
      if (message.kind === 'initialize') {
        if (!initialized) { initializeZBLL(engine); initialized = true; }
        reply({ ...base, kind: 'ready' });
      }
      else if (message.kind === 'attempt') reply({ ...base, kind: 'attempt', value: validateZBLLAttempt(message.value, engine) });
      else if (message.kind === 'generate') {
        const request = message.request;
        exact(request, ['requestId', 'epoch', 'caseId', 'preAuf', 'yaw', 'frame', 'selection']);
        const options = decodeGoalOptions({ trainer: 'zbll', caseId: request.caseId, preAuf: request.preAuf, yaw: request.yaw, mode: request.selection.mode, selection: request.selection });
        if (options.trainer !== 'zbll' || text(request.requestId) !== message.id) throw Error('Invalid ZBLL request.');
        const value = createZBLL(engine, { requestId: request.requestId, epoch: integer(request.epoch), caseId: options.caseId, preAuf: options.preAuf, yaw: options.yaw, frame: decodeFrame(request.frame, engine), selection: options.selection }, message.algorithms);
        reply({ ...base, kind: 'challenge', value: validateZBLL(value, engine) });
      } else throw Error('Unsupported ZBLL operation.');
    } catch (error) { reply({ ...base, kind: 'failed', message: error instanceof Error ? error.message : 'ZBLL worker failed.' }); }
  });
};
