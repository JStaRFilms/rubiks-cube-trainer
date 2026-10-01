import { build, preview, createServer } from 'vite';
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { cpus, totalmem } from 'node:os';

async function verifyEvidence(evidence) {
  const loader = await createServer({ configFile: false, server: { middlewareMode: true } });
  try {
    const oracle = await loader.ssrLoadModule('/tests/helpers/cross-one-oracle.ts');
    const { OUTER_MOVES } = await loader.ssrLoadModule('/src/cross/table.ts');
    const distances = oracle.oracleDistances(OUTER_MOVES), slots = ['FR', 'FL', 'BR', 'BL'];
    const samples = [...evidence.coldGeneration, ...evidence.groups.flatMap((g) => g.samples), ...evidence.exhausted, ...evidence.mobileSamples];
    let checked = 0;
    for (const sample of samples) {
      if (sample.status !== 'result') continue;
      const c = sample.challenge;
      if (!c) throw new Error('Missing retained challenge for independent replay');
      const actual = oracle.oracleReplay(oracle.oracleSolved, c.scramble), final = oracle.oracleReplay(actual, c.proof.witness);
      const permitted = c.options.pair.kind === 'any' ? slots : [c.options.pair.slot];
      if (actual !== c.start.facelets || distances[oracle.oracleCrossCode(actual)] !== c.proof.crossDepth || c.proof.crossDepth > c.options.K || c.proof.cap !== c.options.L || !c.proof.witness.length || c.proof.witness.length > c.options.L || !oracle.oracleCross(final) || !permitted.some((s) => oracle.oraclePair(final, s)) || (oracle.oracleCross(actual) && permitted.some((s) => oracle.oraclePair(actual, s))) || !permitted.includes(sample.witnessSlot) || !oracle.oraclePair(final, sample.witnessSlot) || JSON.stringify(slots.filter((s) => oracle.oraclePair(final, s))) !== JSON.stringify(c.proof.solvedSlots)) throw new Error('Independent benchmark full-state proof failed');
      checked++;
      // Latencies/metadata remain raw; repeated full wire snapshots add no measurement value.
      delete sample.challenge;
    }
    evidence.independentReplay = { checkedReturnedChallenges: checked, method: 'Cartesian scramble/witness replay, independent Cross BFS, simultaneous goals and slots' };
  } finally { await loader.close(); }
}
if (process.argv.includes('--verify-retained')) {
  const evidence = JSON.parse(readFileSync('docs/audits/cross-one-runtime-evidence.json', 'utf8'));
  await verifyEvidence(evidence);
  writeFileSync('docs/audits/cross-one-runtime-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(evidence.independentReplay); process.exit(0);
}
const outDir = 'test-results/cross-one-benchmark';
const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const summarize = (samples) => ({ count: samples.length, p50Ms: percentile(samples.map((s) => s.elapsedMs), .5), p95Ms: percentile(samples.map((s) => s.elapsedMs), .95), successes: samples.filter((s) => s.status === 'result').length, hitRate: samples.filter((s) => s.status === 'result').length / samples.length, successfulRequestCandidateHitRate: samples.some((s) => s.candidates) ? samples.filter((s) => s.status === 'result').length / samples.filter((s) => s.status === 'result').reduce((n, s) => n + s.candidates, 0) : null });
const loader = await createServer({ configFile: false, server: { middlewareMode: true } });
let node;
try { node = await (await loader.ssrLoadModule('/tests/helpers/cross-one-node.ts')).nodeBenchmark(); } finally { await loader.close(); }
await build({ configFile: false, publicDir: false, worker: { format: 'es' }, build: { outDir, emptyOutDir: true, rollupOptions: { input: 'tests/helpers/cross-one-harness.html' } } });
const server = await preview({ configFile: false, build: { outDir }, preview: { host: '127.0.0.1', port: 4185, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const url = 'http://127.0.0.1:4185/tests/helpers/cross-one-harness.html';
const errors = [], cold = [], warmInit = [], coldGeneration = [], groups = [], cancellation = [];
let browserMemory;
try {
  for (let i = 0; i < 5; i++) {
    const context = await browser.newContext(), page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url); await page.waitForFunction(() => window.oneHarness);
    cold.push(await page.evaluate(async () => { const start = performance.now(), reply = await window.oneHarness.initialize(); return { ...reply, wallMs: performance.now() - start }; }));
    coldGeneration.push(await page.evaluate((i) => window.oneHarness.sample(8, 12, null, `cold-${i}`), i));
    warmInit.push(await page.evaluate(async () => { window.oneHarness.stop(); const start = performance.now(), reply = await window.oneHarness.initialize(); return { ...reply, wallMs: performance.now() - start }; }));
    await context.close();
  }
  const context = await browser.newContext(), page = await context.newPage(); page.on('pageerror', (e) => errors.push(e.message)); await page.goto(url); await page.waitForFunction(() => window.oneHarness);
  const cdp = await context.newCDPSession(page), session = await browser.newBrowserCDPSession();
  const replies = new Map(); let nextId = 0, workerSession, workerTarget;
  session.on('Target.receivedMessageFromTarget', ({ message }) => { const data = JSON.parse(message), resolve = replies.get(data.id); if (resolve) { replies.delete(data.id); resolve(data.result); } });
  const workerHeaps = [], mainHeaps = [];
  const heap = () => {
    if (!workerSession) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = ++nextId, timer = setTimeout(() => { replies.delete(id); resolve(null); }, 150);
      replies.set(id, (value) => { clearTimeout(timer); resolve(value); });
      void session.send('Target.sendMessageToTarget', { sessionId: workerSession, message: JSON.stringify({ id, method: 'Runtime.getHeapUsage' }) }).catch(() => { clearTimeout(timer); replies.delete(id); resolve(null); });
    });
  };
  const sampling = setInterval(async () => {
    try {
      const targets = await session.send('Target.getTargets');
      const target = targets.targetInfos.find((t) => t.type === 'worker' && t.url.includes('one.worker'));
      if (target && target.targetId !== workerTarget) { workerTarget = target.targetId; workerSession = (await session.send('Target.attachToTarget', { targetId: target.targetId, flatten: false })).sessionId; }
      if (!target) workerSession = undefined;
      const value = await heap(); if (value) workerHeaps.push(value); mainHeaps.push(await cdp.send('Runtime.getHeapUsage'));
    } catch { /* Samples are reported, not treated as a peak guarantee. */ }
  }, 50);
  await page.evaluate(async () => {
    window.tickSamples = []; window.tickLast = performance.now();
    window.tickTimer = setInterval(() => { const now = performance.now(); window.tickSamples.push(now - window.tickLast); window.tickLast = now; }, 16);
    await window.oneHarness.initialize();
  });
  for (const [K, L, slot] of [[1, 1, null], [1, 12, null], [1, 12, 'FR'], [3, 8, 'FL'], [8, 12, 'BR'], [8, 12, 'BL']]) {
    const samples = [];
    for (let i = 0; i < 32; i++) samples.push(await page.evaluate(({ K, L, slot, i }) => window.oneHarness.sample(K, L, slot, `chrome-${K}-${L}-${slot}-${i}`), { K, L, slot, i }));
    groups.push({ K, L, slot, samples, summary: summarize(samples) });
  }
  const exhausted = [];
  for (let i = 0; i < 8; i++) {
    exhausted.push(await page.evaluate((i) => window.oneHarness.sample(1, 12, null, `zero-${i}`, 'construction', 5000, 0), i));
    exhausted.push(await page.evaluate((i) => window.oneHarness.sample(8, 12, 'FR', `hard-${i}`, 'random-search', 300, 20000), i));
    await page.evaluate(() => window.oneHarness.initialize());
    // CDP sampling rediscovers replacement workers after watchdog recovery.
  }
  for (let i = 0; i < 5; i++) cancellation.push(await page.evaluate(() => window.oneHarness.cooperativeCancel()));
  const wireChecks = await page.evaluate(() => window.oneHarness.wireChecks());
  if (wireChecks.some((c) => c.reply.kind !== 'failed')) throw new Error('Invalid worker request was accepted');
  clearInterval(sampling);
  const workerFinal = await heap(), mainFinal = await cdp.send('Runtime.getHeapUsage'); if (workerFinal) workerHeaps.push(workerFinal); mainHeaps.push(mainFinal);
  browserMemory = { scope: 'initialization, construction and hard/exhausted requests; cancellation may sample the idle primary worker rather than the short-lived secondary worker', workerSamples: workerHeaps.length, mainSamples: mainHeaps.length, maxWorkerHeapBytes: Math.max(...workerHeaps.map((h) => h.usedSize)), maxWorkerBackingBytes: Math.max(...workerHeaps.map((h) => h.backingStorageSize)), maxWorkerPairedBytes: Math.max(...workerHeaps.map((h) => h.usedSize + h.backingStorageSize)), maxMainHeapBytes: Math.max(...mainHeaps.map((h) => h.usedSize)), workerFinal, mainFinal };
  if (!workerHeaps.length) throw new Error('Worker memory sampling unavailable');
  const intervals = await page.evaluate(() => { clearInterval(window.tickTimer); return window.tickSamples; });
  const responsiveness = { samples: intervals.length, p50Ms: percentile(intervals, .5), p95Ms: percentile(intervals, .95), maxMs: Math.max(...intervals) };
  await context.close();
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }), mobilePage = await mobile.newPage(); await mobilePage.goto(url); await mobilePage.waitForFunction(() => window.oneHarness);
  const mobileCdp = await mobile.newCDPSession(mobilePage); await mobileCdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const mobileInit = await mobilePage.evaluate(() => window.oneHarness.initialize()), mobileSamples = [];
  for (let i = 0; i < 32; i++) mobileSamples.push(await mobilePage.evaluate((i) => window.oneHarness.sample(i % 2 ? 1 : 8, 12, i % 2 ? 'FR' : null, `emulated-${i}`), i));
  await mobile.close();
  const assets = [];
  function visit(directory) { for (const file of readdirSync(directory)) { const path = `${directory}/${file}`; if (statSync(path).isDirectory()) visit(path); else { const bytes = readFileSync(path); assets.push({ path: path.replace(`${outDir}/`, ''), raw: bytes.length, gzip: gzipSync(bytes).length, brotli: brotliCompressSync(bytes).length }); } } }
  visit(outDir);
  const nodeGroups = [];
  for (const strategy of ['construction', 'random-search']) for (const [K, L] of [[1, 12], [3, 8], [8, 6], [8, 12]]) { const samples = node.samples.filter((s) => s.strategy === strategy && s.K === K && s.L === L); nodeGroups.push({ strategy, K, L, summary: summarize(samples) }); }
  const evidence = { capturedAt: new Date().toISOString(), conditions: { browser: browser.version(), node: process.version, platform: process.platform, cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalRamBytes: totalmem(), mode: 'headless installed Chrome, localhost optimized standalone prototype; no application/personal data', percentiles: 'nearest rank', memory: '50 ms CDP sampled V8 heap/backing storage; not process/GPU peaks', mobile: '390x844 touch emulation, page-target 4x CPU throttling; worker throttling not independently established; no physical phone' }, cold, warmInit, coldGeneration, coldSummary: { p50Ms: percentile(cold.map((s) => s.wallMs), .5), p95Ms: percentile(cold.map((s) => s.wallMs), .95) }, warmInitSummary: { p50Ms: percentile(warmInit.map((s) => s.wallMs), .5), p95Ms: percentile(warmInit.map((s) => s.wallMs), .95) }, coldGenerationSummary: summarize(coldGeneration), groups, exhausted, exhaustedSummary: summarize(exhausted), cancellation, wireChecks, responsiveness, browserMemory, mobileInit, mobileSamples, mobileSummary: summarize(mobileSamples), node, nodeGroups, assets, errors };
  if (errors.length || groups.some((g) => g.summary.successes !== 32) || cancellation.some((c) => c.reply.code !== 'cancelled')) throw new Error('Prototype benchmark has failed requests, errors or cancellation');
  await verifyEvidence(evidence);
  writeFileSync('docs/audits/cross-one-runtime-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ cold: evidence.coldSummary, warmInit: evidence.warmInitSummary, coldGeneration: evidence.coldGenerationSummary, groups: groups.map(({ K, L, slot, summary }) => ({ K, L, slot, ...summary })), exhausted: evidence.exhaustedSummary, cancellationMs: cancellation.map((c) => c.latencyMs), responsiveness, browserMemory, mobile: evidence.mobileSummary, nodeGroups }, null, 2));
} finally { await browser.close(); await new Promise((resolve) => server.httpServer.close(resolve)); }
