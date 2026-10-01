import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';

const server = await createServer({ server: { host: '127.0.0.1', port: 4186, strictPort: true }, logLevel: 'error' });
let browser;
try {
  const { loadEngine } = await server.ssrLoadModule('/src/cube/engine.ts');
  const { parseNotation } = await server.ssrLoadModule('/src/cube/notation.ts');
  const { CrossTable, OUTER_MOVES } = await server.ssrLoadModule('/src/cross/table.ts');
  const { OneModel, ONE_VERSIONS, SLOTS } = await server.ssrLoadModule('/src/cross-one/model.ts');
  const { generateOne } = await server.ssrLoadModule('/src/cross-one/generate.ts');
  const { WorkBudget } = await server.ssrLoadModule('/src/cross-one/search.ts');
  const { validateOneAttempt } = await server.ssrLoadModule('/src/cross-one/validation.ts');
  const oracle = await server.ssrLoadModule('/tests/helpers/cross-one-oracle.ts');
  const started = performance.now(), engine = await loadEngine(), cross = new CrossTable(engine);
  await cross.build(() => {}, () => {}); const model = new OneModel(engine, cross); await model.initialize(() => {});
  const initializationMs = performance.now() - started, distances = oracle.oracleDistances(OUTER_MOVES), samples = [];
  for (const color of ['white', 'yellow', 'green', 'blue', 'red', 'orange']) for (const slot of [null, 'FR', 'FL', 'BR', 'BL']) {
    const request = { kind: 'generate', protocol: 1, requestId: `smoke-${color}-${slot}`, epoch: 1, workerInstance: 'node', versions: ONE_VERSIONS, frame: engine.frame(color), options: { trainer: 'cross1', K: 3, L: 8, pair: slot ? { kind: 'slot', slot } : { kind: 'any' } }, seed: `smoke-${color}-${slot}`, budget: { timeMs: 5000, maxNodes: 10000 } };
    const start = performance.now(), { challenge: c } = await generateOne(request, model, new WorkBudget(5000, 10000));
    const actual = oracle.oracleReplay(oracle.oracleSolved, c.scramble), final = oracle.oracleReplay(actual, c.proof.witness);
    if (actual !== c.start.facelets || distances[oracle.oracleCrossCode(actual)] !== c.proof.crossDepth || c.proof.crossDepth > 3 || c.proof.witness.length > 8 || !oracle.oracleCross(final) || !c.proof.solvedSlots.every((s) => oracle.oraclePair(final, s)) || (slot && !oracle.oraclePair(final, slot)) || !SLOTS.some((s) => oracle.oraclePair(final, s))) throw new Error('Independent Node proof failed');
    const record = { id: request.requestId, sessionId: 'node', trainer: 'cross1', challenge: c, settingsSnapshot: { inspectionMode: 'untimed', audibleWarnings: false }, presentedAt: '2026-10-01T00:00:00.000Z', endedAt: '2026-10-01T00:00:01.000Z', preparationMs: 400, timing: { status: 'completed', executionMs: 600, inspectionMs: null }, penalty: { kind: 'none', source: 'none' } };
    validateOneAttempt(record, engine, model); samples.push(performance.now() - start);
  }
  console.log(JSON.stringify({ node: process.version, platform: process.platform, checkedRealChallenges: samples.length, initializationMs, requestMinMs: Math.min(...samples), requestMaxMs: Math.max(...samples), typedArrayBytes: model.byteLength, processMemory: process.memoryUsage(), memoryScope: 'whole Node/Vite SSR process, not isolated solver or peak memory' }));
  await server.listen(); browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4186'); await page.getByRole('combobox', { name: 'Trainer', exact: true }).selectOption('cross1');
  for (const slot of ['any', 'BR']) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('combobox', { name: 'Pair goal', exact: true }).selectOption(slot);
    await page.getByRole('button', { name: 'Save settings' }).click(); await page.getByText('Settings saved on this device.').waitFor(); await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await page.getByRole('button', { name: /Untimed timer/ }).waitFor();
    await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await page.getByRole('status').filter({ hasText: 'Tap to stop' }).waitFor(); await page.keyboard.press('Space'); await page.getByRole('status').filter({ hasText: 'Saved on this device' }).waitFor();
    await page.getByRole('button', { name: 'Review attempt' }).click(); await page.getByRole('button', { name: 'Play', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('.review-controls button:nth-child(3)')?.disabled);
    const steps = Number((await page.getByRole('heading', { name: /Found solution/ }).innerText()).match(/(\d+) HTM/)?.[1]);
    for (let i = 0; i < steps; i++) await page.getByRole('button', { name: 'Forward', exact: true }).click();
    const final = oracle.oracleReplay(oracle.oracleReplay(oracle.oracleSolved, parseNotation(await page.getByTestId('canonical-setup').innerText())), parseNotation(await page.getByTestId('canonical-moves').innerText()));
    if (!oracle.oracleCross(final) || !(slot === 'any' ? SLOTS.some((s) => oracle.oraclePair(final, s)) : oracle.oraclePair(final, slot))) throw new Error('Vite witness goal failed');
    await expect(page.getByTestId('review-step')).toHaveText(String(steps));
    await expect(page.getByTestId('logical-state')).toHaveText(final); await expect(page.getByTestId('player-state')).toHaveText(final);
    await page.getByRole('button', { name: 'Close dialog' }).click(); await page.getByRole('button', { name: 'Next challenge' }).click();
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Vite development real any/BR generation, background Space, acknowledged saves and 3D goals passed in Chrome ${browser.version()}. No development offline-readiness claim.`);
} finally { await browser?.close(); await server.close(); }
