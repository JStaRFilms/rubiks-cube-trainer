import { chromium } from '@playwright/test';
import { preview, createServer } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';

const server = await preview({ preview: { host: '127.0.0.1', port: 4185, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext(); const page = await context.newPage();
const errors = []; page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:4185/');
  const manifest = JSON.parse(readFileSync('dist/release-assets.json', 'utf8'));
  const workerAsset = manifest.assets.find((asset) => /cross.worker-.*\.js$/.test(asset.url));
  if (!workerAsset) throw new Error('Missing Cross worker');
  const cdp = await context.newCDPSession(page); await cdp.send('Performance.enable');
  const baseline = await cdp.send('Runtime.getHeapUsage');
  const session = await browser.newBrowserCDPSession();
  const replies = new Map(); let nextId = 1;
  session.on('Target.receivedMessageFromTarget', ({ message }) => { const reply = JSON.parse(message); const resolve = replies.get(reply.id); if (resolve) { replies.delete(reply.id); resolve(reply.result); } });
  let workerSession;
  const workerHeaps = [], mainHeaps = [];
  function heap() {
    if (!workerSession) return Promise.resolve(null);
    const id = nextId++;
    return new Promise((resolve) => { replies.set(id, resolve); void session.send('Target.sendMessageToTarget', { sessionId: workerSession, message: JSON.stringify({ id, method: 'Runtime.getHeapUsage' }) }); });
  }
  const sampling = setInterval(async () => {
    try {
      if (!workerSession) { const targets = await session.send('Target.getTargets'); const target = targets.targetInfos.find((t) => t.type === 'worker' && t.url.includes('cross.worker')); if (target) workerSession = (await session.send('Target.attachToTarget', { targetId: target.targetId, flatten: false })).sessionId; }
      const usage = await heap(); if (usage) workerHeaps.push(usage);
      mainHeaps.push(await cdp.send('Runtime.getHeapUsage'));
    } catch { /* Final samples disclose missing metrics rather than invent them. */ }
  }, 50);
  const runtime = await page.evaluate(async ({ workerUrl, versions }) => {
    const worker = new Worker(workerUrl, { type: 'module' }), instance = crypto.randomUUID();
    window.benchmarkWorker = worker;
    let sequence = 0; const pending = new Map();
    worker.onmessage = ({ data }) => { if (data.kind !== 'progress') { const resolve = pending.get(data.id); if (resolve) { pending.delete(data.id); resolve(data); } } };
    const rpc = (request) => new Promise((resolve) => { const id = String(++sequence); pending.set(id, resolve); worker.postMessage({ ...request, id, instance, timeMs: 60000 }); });
    const ticks = []; let last = performance.now(); const timer = setInterval(() => { const now = performance.now(); ticks.push(now - last); last = now; }, 16);
    const started = performance.now(); const cold = await rpc({ kind: 'initialize', repair: true }); const coldWallMs = performance.now() - started;
    if (cold.kind !== 'ready') throw new Error(JSON.stringify(cold));
    const warmInitialization = await rpc({ kind: 'initialize', repair: false });
    const samples = [], depths = [];
    for (let i = 0; i < 32; i++) {
      const start = performance.now(), requestId = crypto.randomUUID();
      const result = await rpc({ kind: 'generate', request: { kind: 'generate', protocol: 1, workerInstance: instance, requestId, epoch: 1, versions, frame: { crossColor: 'white', colorOfFace: { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' } }, options: { trainer: 'cross', K: 1 + i % 8 }, seed: `benchmark-${i}`, budget: { timeMs: 5000, maxNodes: 200000 } } });
      if (result.kind !== 'challenge') throw new Error(JSON.stringify(result)); samples.push(performance.now() - start); depths.push(result.value.proof.depth);
    }
    clearInterval(timer);
    return { cold, coldWallMs, warmInitialization, warmGenerationMs: samples, depths, eventLoopIntervalsMs: ticks };
  }, { workerUrl: workerAsset.url, versions: { contract: 1, engine: manifest.engine, dataset: null, tables: manifest.tables } });
  clearInterval(sampling); const workerFinal = await heap(), mainFinal = await cdp.send('Runtime.getHeapUsage');
  if (workerFinal) workerHeaps.push(workerFinal); mainHeaps.push(mainFinal);
  const bytes = manifest.assets.map((asset) => { const data = readFileSync(`dist${asset.url}`); if (asset.url.endsWith('.js') && /session-fixture|attempt-fixture|Unexpected semantic fixture|benchmarkWorker/.test(data.toString())) throw new Error(`Test code emitted in ${asset.url}`); if (data.length !== asset.byteLength || createHash('sha256').update(data).digest('hex') !== asset.sha256) throw new Error(`Manifest mismatch ${asset.url}`); return { url: asset.url, raw: data.length, gzip: gzipSync(data).length, brotli: brotliCompressSync(data).length }; });
  const sum = (items) => items.reduce((total, item) => ({ raw: total.raw + item.raw, gzip: total.gzip + item.gzip, brotli: total.brotli + item.brotli }), { raw: 0, gzip: 0, brotli: 0 });
  const sorted = [...runtime.warmGenerationMs].sort((a, b) => a - b);
  const result = { browser: browser.version(), platform: process.platform, node: process.version, releaseId: manifest.releaseId, ...runtime,
    p50Ms: sorted[Math.ceil(sorted.length * .5) - 1], p95Ms: sorted[Math.ceil(sorted.length * .95) - 1], maxEventLoopIntervalMs: Math.max(...runtime.eventLoopIntervalsMs),
    baseline, mainFinal, workerFinal, sampledMainPeakUsedBytes: Math.max(...mainHeaps.map((h) => h.usedSize)), sampledWorkerPeakUsedBytes: Math.max(...workerHeaps.map((h) => h.usedSize)), sampledWorkerPeakBackingBytes: Math.max(...workerHeaps.map((h) => h.backingStorageSize)), sampledWorkerPeakHeapAndBackingBytes: Math.max(...workerHeaps.map((h) => h.usedSize + h.backingStorageSize)), workerHeapSamples: workerHeaps.length,
    assetCount: bytes.length, allAssets: sum(bytes), javascript: sum(bytes.filter((asset) => asset.url.endsWith('.js'))), assets: bytes, errors };
  if (!workerHeaps.length) throw new Error('No worker heap samples were captured');
  writeFileSync('docs/audits/cross-runtime-evidence.json', JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify({ coldWallMs: runtime.coldWallMs, p50Ms: result.p50Ms, p95Ms: result.p95Ms, maxEventLoopIntervalMs: result.maxEventLoopIntervalMs, sampledWorkerPeakUsedBytes: result.sampledWorkerPeakUsedBytes, allAssets: result.allAssets }, null, 2));
} finally { await context.close(); await browser.close(); await new Promise((resolve) => server.httpServer.close(resolve)); }

const dev = await createServer({ server: { host: '127.0.0.1', port: 4186, strictPort: true } }); await dev.listen();
const devBrowser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await devBrowser.newPage(); const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4186/'); await page.getByRole('button', { name: 'Start Cross practice', exact: true }).click();
  const timer = page.getByRole('button', { name: /Untimed timer/ }); await timer.waitFor({ timeout: 30000 }); await timer.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Review attempt' }).waitFor(); await page.getByRole('button', { name: 'Review attempt' }).click(); await page.getByTestId('player-state').waitFor({ state: 'attached', timeout: 20000 });
  await page.getByRole('button', { name: 'Forward', exact: true }).click(); await page.waitForFunction(() => document.querySelector('[data-testid=logical-state]')?.textContent === document.querySelector('[data-testid=player-state]')?.textContent);
  if (errors.length) throw new Error(errors.join('\n')); const evidence = JSON.parse(readFileSync('docs/audits/cross-runtime-evidence.json', 'utf8')); evidence.development = { node: process.version, chrome: devBrowser.version(), workerTimerSavePlayer: 'passed', pageErrors: errors }; writeFileSync('docs/audits/cross-runtime-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(`Development Cross worker/timer/save/3D check passed on Node ${process.version}, Chrome ${devBrowser.version()}`);
} finally { await devBrowser.close(); await dev.close(); }
