import { crossClient } from '../cross/client';
import { OneClient } from '../cross-one/client';
import { F2LClient } from '../f2l/client';
import { activityStore, lockUpdate, releaseUpdate } from './activity';
declare const __RELEASE_ID__: string;
export type SetupState = 'not-started' | 'downloading' | 'initializing' | 'verifying' | 'ready' | 'failed';
export interface OfflineState { phase: SetupState; message: string; waiting: boolean }
function request(worker: ServiceWorker, kind: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Service worker did not respond. Retry setup.')); }, 30000);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      clearTimeout(timer); channel.port1.close();
      if (typeof event.data !== 'object' || event.data === null) { reject(new Error('Invalid service worker response.')); return; }
      const data = event.data as Record<string, unknown>;
      if (data.ok !== true) reject(new Error(typeof data.message === 'string' ? data.message : 'Offline operation failed.'));
      else resolve(data);
    };
    worker.postMessage({ kind }, [channel.port2]);
  });
}
async function activeWorker(registration: ServiceWorkerRegistration): Promise<ServiceWorker> {
  if (registration.active) return registration.active;
  const installing = registration.installing;
  if (!installing) throw new Error('Shell installation did not complete. Reconnect and retry setup.');
  return new Promise((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); installing.removeEventListener('statechange', changed); };
    const changed = () => {
      if (installing.state === 'activated') { cleanup(); resolve(installing); }
      else if (installing.state === 'redundant') { cleanup(); reject(new Error('Shell installation was interrupted or failed verification. Reconnect and retry setup.')); }
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Shell installation timed out. Reconnect and retry setup.')); }, 30000);
    installing.addEventListener('statechange', changed); changed();
  });
}
export class PwaController {
  private readonly oneSetup = new OneClient();
  private readonly f2lSetup = new F2LClient();
  private registration: ServiceWorkerRegistration | null = null;
  private state: OfflineState = { phase: 'not-started', message: 'Offline shell not checked.', waiting: false };
  constructor(private readonly publish: (state: OfflineState) => void, private readonly probe: () => Promise<void>) {}
  private set(state: Partial<OfflineState>) { this.state = { ...this.state, ...state }; this.publish(this.state); }
  async start(): Promise<void> {
    if (!('serviceWorker' in navigator)) { this.set({ phase: 'failed', message: 'Service workers are unavailable in this browser.' }); return; }
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || !('token' in data) || typeof data.token !== 'string' || !('kind' in data)) return;
      const token = data.token;
      if (data.kind === 'LOCK_UPDATE') event.ports[0]?.postMessage({ idle: lockUpdate(token) });
      else if (data.kind === 'VERIFY_UPDATE') event.ports[0]?.postMessage({ idle: activityStore.getState().updateToken === token && activityStore.getState().phase === 'idle' });
      else if (data.kind === 'UNLOCK_UPDATE') releaseUpdate(token);
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (activityStore.getState().updateToken && activityStore.getState().phase === 'idle') location.reload();
      else this.set({ phase: 'not-started', message: 'Shell version changed. Recheck offline setup.' });
    });
    try {
      this.registration = await navigator.serviceWorker.getRegistration('/') ?? await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      const registration = this.registration;
      const observe = () => this.set({ waiting: !!registration.waiting });
      registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', observe));
      observe();
      registration.waiting?.postMessage({ kind: 'HELLO' });
      if (navigator.serviceWorker.controller) await this.verify(false);
      else this.set({ message: 'Set up offline Cross, Cross+1 and F2L practice, including verified tables, the 41-case library, cube models and player.' });
    } catch (error) { this.set({ phase: 'failed', message: error instanceof Error ? error.message : 'Shell setup failed.' }); }
  }
  async verify(download: boolean): Promise<void> {
    try {
      this.set({ phase: download ? 'downloading' : 'verifying', message: download ? 'Checking and downloading missing Cross, Cross+1, F2L and review assets…' : 'Verifying cached Cross, Cross+1, F2L and review assets…' });
      let registration = this.registration;
      if (download && !registration?.active) registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      if (!registration) throw new Error('No shell worker is installed. Set up the offline shell first.');
      this.registration = registration;
      const worker = navigator.serviceWorker.controller ?? await activeWorker(registration);
      const result = await request(worker, download ? 'SETUP' : 'VERIFY_SHELL');
      if (result.releaseId !== __RELEASE_ID__) throw new Error('App and offline shell versions differ. Finish or recover any attempt, then reload before setup.');
      this.set({ phase: 'initializing', message: 'Checking local storage…' });
      await this.probe();
      this.set({ phase: 'initializing', message: 'Initializing cached cube model and player module…' });
      const { initializeReview } = await import('../cube/initialize');
      await initializeReview();
      this.set({ phase: 'initializing', message: 'Checking the independently proven Cross table…' });
      await crossClient.initialize(download, (completed, total) => this.set({ message: `Building Cross table: ${completed} / ${total} coordinates` }));
      this.set({ phase: 'initializing', message: 'Initializing Cross+1 model and memory-only pair tables…' });
      await this.oneSetup.initialize(download);
      // Readiness initialization must not leave solver work competing with practice/player use.
      this.oneSetup.suspend();
      this.set({ phase: 'initializing', message: 'Validating the actual 41-case F2L library and cube model…' });
      await this.f2lSetup.initialize();
      this.f2lSetup.suspend();
      if (!navigator.serviceWorker.controller) {
        this.set({ phase: 'not-started', message: 'Shell downloaded. Reload to finish setup.' });
        if (download && activityStore.getState().phase === 'idle' && !activityStore.getState().updateToken) location.reload();
        return;
      }
      this.set({ phase: 'ready', message: `Offline review ready · Cross ready · Cross+1 ready · F2L ready · ${String(result.releaseId)}. All three trainers, timing, history and review included.` });
    } catch (error) { this.set({ phase: 'failed', message: error instanceof Error ? error.message : 'Shell setup failed. Retry.' }); }
  }
  async checkUpdate(): Promise<void> { await this.registration?.update(); this.set({ waiting: !!this.registration?.waiting }); }
  async applyUpdate(): Promise<void> {
    const worker = this.registration?.waiting;
    if (!worker) return;
    if (activityStore.getState().phase !== 'idle') throw new Error('Finish practice or close the open dialog before applying an update.');
    await request(worker, 'APPLY_UPDATE');
  }
}
