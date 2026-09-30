/// <reference lib="webworker" />
import { decodeManifest, verifyAsset, type ReleaseManifest } from './manifest';
declare const self: ServiceWorkerGlobalScope;
declare const __RELEASE_ID__: string;
const releaseId = __RELEASE_ID__, cacheName = `cube-trainer-assets-${releaseId}`;
let pendingToken: string | null = null;
async function manifest(download: boolean): Promise<ReleaseManifest> {
  const cache = await caches.open(cacheName);
  const stored = await cache.match('/release-assets.json');
  if (!stored && !download) throw new Error('Offline shell incomplete: release manifest. Reconnect and retry setup.');
  const response = stored ?? await fetch('/release-assets.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Release manifest download failed. Reconnect and retry.');
  const decoded = decodeManifest(await response.clone().json());
  if (decoded.releaseId !== releaseId) throw new Error('Release changed during setup. Check for an update and retry.');
  if (!stored) await cache.put('/release-assets.json', response);
  return decoded;
}
async function setup(download: boolean): Promise<{ releaseId: string; total: number }> {
  const data = await manifest(download), cache = await caches.open(cacheName);
  for (const asset of data.assets) {
    let response = await cache.match(asset.url);
    if (!response || !await verifyAsset(response.clone(), asset)) {
      if (!download) throw new Error(`Offline shell incomplete: ${asset.url}. Reconnect and retry setup.`);
      response = await fetch(asset.url, { cache: 'no-store' });
      if (!await verifyAsset(response.clone(), asset)) throw new Error(`Asset verification failed: ${asset.url}. Retry setup.`);
      await cache.put(asset.url, response);
    }
  }
  if (!await cache.match('/index.html')) throw new Error('Navigation fallback is missing.');
  return { releaseId, total: data.assets.length };
}
self.addEventListener('install', (event) => { event.waitUntil(setup(true)); });
// No clients.claim, skipWaiting on install, or automatic cache deletion.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    if (event.request.mode === 'navigate') return await cache.match('/index.html') ?? fetch(event.request);
    // Static manifest assets have identical bytes across request Origin headers.
    const cached = await cache.match(event.request, { ignoreSearch: false, ignoreVary: true });
    return cached ?? fetch(event.request);
  })());
});
async function ask(client: Client, token: string, kind: 'LOCK_UPDATE' | 'VERIFY_UPDATE'): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); resolve(false); }, 2500);
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      clearTimeout(timer); channel.port1.close();
      const data = event.data;
      resolve(typeof data === 'object' && data !== null && 'idle' in data && data.idle === true);
    };
    client.postMessage({ kind, token }, [channel.port2]);
  });
}
async function activateSafely(): Promise<void> {
  if (pendingToken) throw new Error('An update confirmation is already in progress.');
  const token = crypto.randomUUID(); pendingToken = token;
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  let success = false;
  try {
    if (!clients.length || !(await Promise.all(clients.map((client) => ask(client, token, 'LOCK_UPDATE')))).every(Boolean)) throw new Error('Close dialogs or finish practice in other tabs, then retry the update.');
    const latest = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (latest.length !== clients.length || latest.some((c) => !clients.some((old) => old.id === c.id))) throw new Error('Open tabs changed. Retry the update when all tabs are idle.');
    if (!(await Promise.all(latest.map((client) => ask(client, token, 'VERIFY_UPDATE')))).every(Boolean)) throw new Error('An attempt or edit blocked the update.');
    const finalClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (finalClients.length !== latest.length || finalClients.some((c) => !latest.some((old) => old.id === c.id))) throw new Error('Open tabs changed. Retry the update.');
    await self.skipWaiting(); success = true;
  } finally {
    if (!success) for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) client.postMessage({ kind: 'UNLOCK_UPDATE', token });
    pendingToken = null;
  }
}
self.addEventListener('message', (event) => {
  const data: unknown = event.data;
  if (!data || typeof data !== 'object' || !('kind' in data)) return;
  const port = event.ports[0];
  event.waitUntil((async () => {
    try {
      if (data.kind === 'SETUP' || data.kind === 'VERIFY_SHELL') {
        const result = await setup(data.kind === 'SETUP'); port?.postMessage({ ok: true, ...result });
      } else if (data.kind === 'APPLY_UPDATE') { await activateSafely(); port?.postMessage({ ok: true }); }
      else if (data.kind === 'HELLO' && pendingToken) {
        // A tab opened during the handshake must not begin work.
        const source = event.source;
        if (source && 'postMessage' in source) source.postMessage({ kind: 'LOCK_UPDATE', token: pendingToken });
      }
    } catch (error) { port?.postMessage({ ok: false, message: error instanceof Error ? error.message : 'Offline setup failed.' }); }
  })());
});
