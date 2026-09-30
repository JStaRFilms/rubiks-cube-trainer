/// <reference lib="webworker" />
import { loadEngine } from '../cube/engine';
import { decodeWorkerRequest, GenerationScaffold, SCAFFOLD_VERSIONS, type WorkerReply } from './protocol';
const scaffold = new GenerationScaffold();
self.addEventListener('message', (event: MessageEvent<unknown>) => {
  void loadEngine().then((engine) => scaffold.handle(decodeWorkerRequest(event.data, engine))).catch((reason: unknown): WorkerReply => ({ kind: 'initialization-failed', workerInstance: 'uninitialized', versions: SCAFFOLD_VERSIONS, message: reason instanceof Error ? reason.message : 'Worker initialization failed.' })).then((reply) => self.postMessage(reply));
});
