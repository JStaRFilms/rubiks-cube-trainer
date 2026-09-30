import { decodeScaffoldReply, SCAFFOLD_VERSIONS, type WorkerRequest, type WorkerReply } from './protocol';
export function createGenerationWorker(): Worker { return new Worker(new URL('./generation.worker.ts', import.meta.url), { type: 'module' }); }
export async function probeGenerationScaffold(): Promise<void> {
  const worker = createGenerationWorker(), instance = crypto.randomUUID();
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Generation scaffold initialization timed out.')), 10000);
      worker.onerror = () => { clearTimeout(timeout); reject(new Error('Generation scaffold worker failed.')); };
      worker.onmessage = (event: MessageEvent<unknown>) => {
        clearTimeout(timeout);
        try {
          const reply: WorkerReply = decodeScaffoldReply(event.data);
          if (reply.kind !== 'initialization-failed' || reply.workerInstance !== instance || reply.versions.engine !== SCAFFOLD_VERSIONS.engine) throw new Error('Unexpected generation scaffold result.');
          resolve();
        } catch (reason) { reject(reason); }
      };
      const request: WorkerRequest = { kind: 'initialize', protocol: 1, workerInstance: instance, versions: SCAFFOLD_VERSIONS };
      worker.postMessage(request);
    });
  } finally { worker.terminate(); }
}
