import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/update-release';
import { cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { F2L_CASES } from '../../src/data/f2l';
import { OLL_CASES, PLL_CASES } from '../../src/data';
import { canonicalText } from '../../src/cube/notation';
import type { TrainerBackupV1 } from '../../src/store/records';
import { lowerIndices, normalize, replay, solved } from '../helpers/case-oracle';
async function dataPanel(page: Page) { await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click(); }
async function setup(page: Page) {
  await page.goto('/'); await dataPanel(page); await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /F2L ready/ })).toBeVisible({ timeout: 30000 });
}
async function choose(page: Page, mode = 'recognition', hint = 'hidden', slot = 'FR', color = 'white', inspection = 'untimed') {
  await page.getByRole('combobox', { name: 'Trainer', exact: true }).selectOption('f2l');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('combobox', { name: 'F2L mode', exact: true }).selectOption(mode); await page.getByRole('combobox', { name: 'Rotation view hint', exact: true }).selectOption(hint);
  await page.getByRole('combobox', { name: 'F2L slot policy', exact: true }).selectOption(slot); await page.getByRole('combobox', { name: 'Setup pre-U', exact: true }).selectOption('2');
  await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption(color); await page.getByRole('combobox', { name: 'Inspection', exact: true }).selectOption(inspection);
  await page.getByRole('button', { name: 'Clear case selection' }).click(); await expect(page.getByRole('button', { name: 'Save settings' })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'F2L 1 ·', exact: false }).check(); await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved on this device.')).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
}
async function start(page: Page, inspection = 'Untimed') {
  await expect(page.getByRole('button', { name: 'Start F2L practice', exact: true })).toBeDisabled();
  await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click();
  await expect(page.getByRole('button', { name: new RegExp(`${inspection}.*timer`) })).toBeEnabled({ timeout: 30000 });
}
async function execute(page: Page) {
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await page.keyboard.press('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
}
async function backup(page: Page) {
  await dataPanel(page); const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click();
  const path = await (await downloading).path(), bytes = readFileSync(path ?? ''), value: TrainerBackupV1 = JSON.parse(bytes.toString());
  await page.getByRole('button', { name: 'Close dialog' }).click(); return { value, bytes };
}
async function recognitionHidden(page: Page) {
  const output = `${await page.locator('main').innerText()}\n${await page.locator('main').ariaSnapshot()}`;
  expect(output).not.toMatch(/F2L 1\b|f2l:lieberkind|Guidance:|Speeden default|Lieberkind numbering|both_top|corner_in|edge_in/);
  expect(await page.locator('.f2l-guidance').count()).toBe(0); expect(await page.locator('twisty-player').count()).toBe(0);
}

test('never-opened cold offline F2L/3D, recognition accessibility, real history/restore and phone touch loop', async ({ page, context, browser }) => {
  await setup(page); expect(await page.locator('twisty-player').count()).toBe(0); await context.setOffline(true); await page.close();
  const cold = await context.newPage(), failures: string[] = []; cold.on('requestfailed', (request) => failures.push(request.url())); cold.on('dialog', (dialog) => void dialog.accept());
  await cold.goto('/f2l-cold-offline'); await expect(cold.getByRole('button', { name: /F2L ready/ })).toBeVisible({ timeout: 30000 });
  await choose(cold, 'recognition', 'hidden', 'random'); await start(cold); await recognitionHidden(cold);
  for (const [width, height] of [[320, 640], [390, 844], [1440, 900]] as const) {
    await cold.setViewportSize({ width, height }); const timer = await cold.locator('.timer-input').boundingBox(); if (!timer) throw Error('Missing F2L timer.');
    expect(timer.y + timer.height).toBeLessThanOrEqual(height); expect(await cold.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  expect(await cold.locator('main').innerText()).not.toMatch(/Requested FR view|rotation needed/); await execute(cold);
  await expect(cold.locator('.f2l-guidance')).toContainText('F2L 1'); const saved = await backup(cold), attempt = saved.value.attempts[0];
  if (!attempt || attempt.challenge.options.trainer !== 'f2l' || attempt.challenge.proof.kind !== 'case') throw Error('Missing real F2L attempt.');
  const c = attempt.challenge; if (c.options.trainer !== 'f2l' || c.proof.kind !== 'case') throw Error('Wrong F2L proof.');
  const final = normalize(replay(c.start.facelets, c.proof.solution));
  expect(replay(solved, c.scramble)).toBe(c.start.facelets); expect(lowerIndices.every((i) => final[i] === solved[i])).toBe(true); expect(attempt.selfReport).toBeUndefined(); expect(c.options.hint).toBe(false);
  await cold.getByRole('button', { name: 'Review attempt' }).click(); await expect(cold.getByText('Last layer is representative', { exact: false })).toBeVisible();
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 }); await expect(cold.getByTestId('player-state')).toHaveText(c.start.facelets);
  for (let i = 0; i < c.proof.solution.length; i++) await cold.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(cold.getByTestId('logical-state')).toHaveText(final); await expect(cold.getByTestId('player-state')).toHaveText(final); await cold.getByRole('button', { name: 'Close dialog' }).click();
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.locator('.attempt-list summary').click(); await cold.getByRole('button', { name: 'Set +2', exact: true }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toContainText('+2');
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Delete attempt…', exact: true }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.clock')).toHaveText('Removed');
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Undo latest history change' }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toContainText('+2');
  await dataPanel(cold); await cold.getByLabel('Restore backup file').setInputFiles({ name: 'actual-f2l.json', mimeType: 'application/json', buffer: saved.bytes }); await expect(cold.getByText('Validated backup preview')).toBeVisible();
  await cold.getByLabel('I confirm replacement').check(); await cold.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(cold.getByText('Local data replaced.')).toBeVisible(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result')).toHaveCount(0);
  await cold.setViewportSize({ width: 390, height: 844 }); await start(cold); await recognitionHidden(cold);
  const timer = cold.locator('.timer-input'), bounds = await timer.boundingBox(); if (!bounds) throw Error('Missing phone timer.'); expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  const cdp = await context.newCDPSession(cold), point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }; await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cold.waitForTimeout(330); await expect(timer).toHaveCSS('outline-style', 'none'); expect(await cold.evaluate(() => getSelection()?.toString())).toBe(''); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(cold.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await expect(cold.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
  await cold.getByRole('button', { name: 'Next challenge' }).click(); await expect(cold.getByLabel('My Cross and all four pairs')).not.toBeChecked(); await expect(cold.getByRole('button', { name: 'Start F2L practice', exact: true })).toBeDisabled();
  await cold.reload(); await expect(cold.locator('.session-shelf')).toContainText('2 saved attempts'); expect(failures).toEqual([]); console.log(`F2L cold offline: Chrome ${browser.version()}, ${process.platform}, phone viewport and touch emulation only.`);
});

test('canonical/slot algorithm editor, explicit pre-AUF, wrong-case and quota atomicity, reset and frozen historical review', async ({ page }) => {
  const entry = F2L_CASES[0]; if (!entry) throw Error('Missing sourced case.'); const source = canonicalText(entry.defaultAlgorithm);
  await page.goto('/'); await choose(page, 'execution', 'shown'); await start(page); await expect(page.locator('.f2l-guidance')).toContainText('F2L 1');
  await page.setViewportSize({ width: 320, height: 640 }); const timerBounds = await page.locator('.timer-input').boundingBox(); if (!timerBounds) throw Error('Missing execution timer.'); expect(timerBounds.y + timerBounds.height).toBeLessThanOrEqual(640);
  await page.setViewportSize({ width: 1280, height: 720 }); await execute(page); const original = await backup(page);
  await page.getByRole('button', { name: 'Personal algorithms', exact: true }).click(); await expect(page.getByRole('textbox', { name: 'Personal algorithm', exact: true })).toHaveValue(source);
  await page.getByRole('combobox', { name: 'Algorithm pre-AUF', exact: true }).selectOption('1'); await page.getByRole('textbox', { name: 'Personal algorithm', exact: true }).fill(`U' ${source} U`);
  await page.getByRole('button', { name: 'Validate algorithm' }).click(); await expect(page.getByText('Valid for this intended case. Not saved yet.')).toBeVisible();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) { if (this.name === 'personalAlgorithms') { IDBObjectStore.prototype.put = put; throw new DOMException('Actual algorithm quota fault', 'QuotaExceededError'); } return key === undefined ? put.call(this, value) : put.call(this, value, key); };
  });
  await page.getByRole('button', { name: 'Save algorithm' }).click(); await expect(page.getByRole('alert').filter({ hasText: 'Storage is full' })).toBeVisible(); await expect(page.getByText('Algorithm saved on this device.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save algorithm' }).click(); await expect(page.getByText('Algorithm saved on this device.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Algorithm scope', exact: true }).selectOption('FR'); await expect(page.getByRole('textbox', { name: 'Personal algorithm', exact: true })).toHaveValue(source);
  await page.getByRole('combobox', { name: 'Algorithm pre-AUF', exact: true }).selectOption('3'); await page.getByRole('textbox', { name: 'Personal algorithm', exact: true }).fill(`U ${source} U2`);
  await page.getByRole('button', { name: 'Validate algorithm' }).click(); await expect(page.getByText('Valid for this intended case. Not saved yet.')).toBeVisible(); await page.getByRole('button', { name: 'Save algorithm' }).click(); await expect(page.getByText('Algorithm saved on this device.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Personal algorithm', exact: true }).fill('R'); await page.getByRole('button', { name: 'Validate algorithm' }).click(); await expect(page.getByRole('alert')).toContainText('previous algorithms and history are unchanged'); await expect(page.getByRole('button', { name: 'Save algorithm' })).toBeDisabled();
  await page.getByRole('button', { name: 'Close dialog' }).click(); const overridden = await backup(page); expect(overridden.value.personalAlgorithms).toHaveLength(2); expect(overridden.value.attempts).toEqual(original.value.attempts);
  await page.getByRole('button', { name: 'Review attempt' }).click(); await expect(page.getByTestId('canonical-moves')).toHaveText(canonicalText(original.value.attempts[0]?.challenge.proof.kind === 'case' ? original.value.attempts[0].challenge.proof.solution : [])); await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Next challenge' }).click(); await start(page); await execute(page); const actual = await backup(page), previous = original.value.attempts[0], latest = actual.value.attempts.find((attempt) => attempt.id !== previous?.id);
  if (!previous || !latest || latest.challenge.proof.kind !== 'case') throw Error('Missing real frozen reps.'); expect(latest.challenge.scramble).toEqual(previous.challenge.scramble); expect(latest.challenge.proof.identityKey).toBe(entry.identityKey); expect(latest.challenge.proof.solution.at(-1)).toEqual({ family: 'U', amount: 2 });
  await page.getByRole('button', { name: 'Personal algorithms', exact: true }).click(); await page.getByRole('combobox', { name: 'Algorithm scope', exact: true }).selectOption('FR'); await expect(page.getByRole('button', { name: 'Use default' })).toBeEnabled(); await page.getByRole('button', { name: 'Use default' }).click(); await expect(page.getByText('Override removed.', { exact: false })).toBeVisible();
  await page.getByRole('combobox', { name: 'Algorithm scope', exact: true }).selectOption('canonical'); await expect(page.getByRole('button', { name: 'Use default' })).toBeEnabled(); await page.getByRole('button', { name: 'Use default' }).click(); await expect(page.getByText('Override removed.', { exact: false })).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
  const reset = await backup(page); expect(reset.value.personalAlgorithms).toEqual([]); expect(reset.value.attempts).toEqual(actual.value.attempts);
  await page.reload(); await page.getByRole('button', { name: 'Session / history', exact: true }).click(); await page.locator('.attempt-list summary').first().click(); await page.getByRole('button', { name: 'Review saved attempt' }).first().click(); await expect(page.getByTestId('canonical-moves')).toHaveText(canonicalText(latest.challenge.proof.solution));
});

test('mixed OLL/PLL and canonical/slot F2L guidance survives real F2L generation and saving', async ({ page }) => {
  await page.goto('/');
  for (const trainer of ['oll', 'pll'] as const) {
    const entry = (trainer === 'oll' ? OLL_CASES : PLL_CASES)[0]; if (!entry) throw Error('Missing actual LL case.');
    await page.getByRole('combobox', { name: 'Trainer', exact: true }).selectOption(trainer);
    await page.getByRole('button', { name: 'Personal algorithms', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Personal algorithm', exact: true })).toHaveValue(canonicalText(entry.defaultAlgorithm));
    await page.getByRole('button', { name: 'Validate algorithm' }).click(); await expect(page.getByText('Valid for this intended case. Not saved yet.')).toBeVisible();
    await page.getByRole('button', { name: 'Save algorithm' }).click(); await expect(page.getByText('Algorithm saved on this device. Frozen runs are unchanged.')).toBeVisible();
    await page.getByRole('button', { name: 'Close dialog' }).click();
  }
  const ll = await backup(page); expect(ll.value.attempts).toEqual([]); expect(ll.value.personalAlgorithms).toHaveLength(2);
  await choose(page, 'execution', 'hidden'); const entry = F2L_CASES[0]; if (!entry) throw Error('Missing actual F2L case.'); const source = canonicalText(entry.defaultAlgorithm);
  await page.getByRole('button', { name: 'Personal algorithms', exact: true }).click();
  for (const scope of ['canonical', 'FR'] as const) {
    await page.getByRole('combobox', { name: 'Algorithm scope', exact: true }).selectOption(scope);
    await page.getByRole('combobox', { name: 'Algorithm pre-AUF', exact: true }).selectOption(scope === 'canonical' ? '1' : '3');
    await page.getByRole('textbox', { name: 'Personal algorithm', exact: true }).fill(scope === 'canonical' ? `U' ${source} U` : `U ${source} U2`);
    await page.getByRole('button', { name: 'Validate algorithm' }).click(); await expect(page.getByText('Valid for this intended case. Not saved yet.')).toBeVisible();
    await page.getByRole('button', { name: 'Save algorithm' }).click(); await expect(page.getByText('Algorithm saved on this device.', { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Close dialog' }).click(); const before = await backup(page);
  expect(before.value.personalAlgorithms).toHaveLength(4); expect(before.value.personalAlgorithms.filter((record) => !record.caseId.startsWith('f2l:'))).toEqual(ll.value.personalAlgorithms); expect(before.value.attempts).toEqual([]);
  await start(page); await execute(page); const after = await backup(page);
  expect(after.value.personalAlgorithms).toEqual(before.value.personalAlgorithms); expect(after.value.attempts).toHaveLength(1);
  const attempt = after.value.attempts[0]; if (!attempt || attempt.challenge.options.trainer !== 'f2l' || attempt.challenge.proof.kind !== 'case') throw Error('Missing actual saved F2L rep.');
  expect(attempt.timing.status).toBe('completed'); expect(attempt.challenge.options).toMatchObject({ caseId: entry.id, slot: 'FR', mode: 'execution' }); expect(attempt.challenge.proof.identityKey).toBe(entry.identityKey);
  expect(replay(solved, attempt.challenge.scramble)).toBe(attempt.challenge.start.facelets); expect(attempt.challenge.proof.solution.at(-1)).toEqual({ family: 'U', amount: 2 });
  const final = normalize(replay(attempt.challenge.start.facelets, attempt.challenge.proof.solution)); expect(lowerIndices.every((i) => final[i] === solved[i])).toBe(true);
  await page.getByRole('button', { name: 'Review attempt' }).click(); await expect(page.getByTestId('canonical-moves')).toHaveText(canonicalText(attempt.challenge.proof.solution)); await page.getByRole('button', { name: 'Close dialog' }).click();
});

test('actual F2L request deferral/cancel, settings/session/restore and post-read cross-tab ownership', async ({ page, context }) => {
  await page.addInitScript(() => {
    const send = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (message: unknown) { if (message && typeof message === 'object' && 'kind' in message && message.kind === 'generate' && 'algorithms' in message) { setTimeout(send.bind(this, message), 500); } else send.call(this, message); };
  });
  await page.goto('/'); await choose(page); await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click(); await page.getByRole('button', { name: 'Cancel generation' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click(); await page.getByRole('button', { name: 'Help', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'F2L verified. Waiting' })).toBeVisible(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('button', { name: /Untimed timer/ })).toBeEnabled(); await execute(page); const saved = await backup(page);
  await page.getByRole('button', { name: 'Next challenge' }).click(); await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click(); await dataPanel(page); await expect(page.getByRole('status').filter({ hasText: 'F2L verified. Waiting' })).toBeVisible();
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'actual-deferred-f2l.json', mimeType: 'application/json', buffer: saved.bytes }); await expect(page.getByText('Validated backup preview')).toBeVisible(); await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(page.getByText('Local data replaced.')).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click(); await page.getByRole('button', { name: 'Help', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'F2L verified. Waiting' })).toBeVisible();
  const other = await context.newPage(); await other.goto('/'); await choose(other, 'execution', 'shown', 'random', 'blue'); await page.bringToFront(); await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('alert').filter({ hasText: 'Settings changed in another tab' })).toBeVisible(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.reload(); await expect(page.locator('.configuration')).toContainText('Random slot'); await expect(page.locator('.session-dock')).toContainText('1 saved attempts');
  await page.getByLabel('My Cross and all four pairs').check(); await page.getByRole('button', { name: 'Start F2L practice', exact: true }).click(); await page.getByRole('button', { name: 'Move review', exact: true }).click(); await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Generation suspended' })).toBeVisible();
});

test('15-second F2L native input/keyboard/pointer isolation, actual quota recovery and interrupted recognition reveal', async ({ page }) => {
  await page.goto('/'); await choose(page, 'recognition', 'shown', 'random', 'orange', '15s'); await start(page, '15 second inspection'); await recognitionHidden(page); await expect(page.getByRole('region', { name: 'Presented challenge' })).toContainText('View hint requested, no physical turn recorded');
  await page.keyboard.down('Space'); await page.waitForTimeout(350); await page.keyboard.up('Space'); await expect(page.locator('.timer-input')).toContainText('Hold, then release');
  await page.locator('.timer-input').focus(); await page.keyboard.press('Enter'); await expect(page.locator('.timer-input')).toContainText('Hold, then release'); await executeStartOnly(page);
  await recognitionHidden(page); await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) { if (this.name === 'attempts') { IDBObjectStore.prototype.put = put; throw new DOMException('Actual attempt quota fault', 'QuotaExceededError'); } return key === undefined ? put.call(this, value) : put.call(this, value, key); };
  });
  await page.keyboard.press('Space'); await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible(); await expect(page.getByRole('button', { name: 'Next challenge' })).toHaveCount(0);
  const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: 'Emergency export unsaved attempt' }).click(); const path = await (await downloading).path(); const emergency: { unsaved: boolean; attempt: unknown } = JSON.parse(readFileSync(path ?? '', 'utf8')); expect(emergency.unsaved).toBe(true);
  await page.getByRole('button', { name: 'Retry save' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); const saved = await backup(page); expect(saved.value.attempts).toEqual([emergency.attempt]);
  await page.getByRole('button', { name: 'Next challenge' }).click(); await start(page, '15 second inspection'); await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); await recognitionHidden(page); await expect(page.locator('.attempt-result')).toContainText('Interrupted'); await page.getByRole('button', { name: 'Review attempt' }).click(); await expect(page.getByRole('heading', { name: /F2L 1/ })).toBeVisible();
});
async function executeStartOnly(page: Page) { await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); }

test('corrupt F2L worker asset downgrades readiness; real cache repair retains saved history', async ({ page, context }) => {
  await setup(page); await choose(page); await start(page); await execute(page); const before = await backup(page); await context.setOffline(true);
  await page.evaluate(async () => {
    const names = await caches.keys(), name = names.find((value) => value.startsWith('cube-trainer-assets-')); if (!name) throw Error('No actual release cache.');
    const cache = await caches.open(name), manifest = await cache.match('/release-assets.json'); if (!manifest) throw Error('No actual manifest.');
    const value: { assets: { url: string }[] } = await manifest.json(), asset = value.assets.find((entry) => /f2l.worker-.*\.js$/.test(entry.url)); if (!asset) throw Error('No actual F2L worker.');
    await cache.put(asset.url, new Response('corrupt actual F2L cached bytes'));
  });
  await dataPanel(page); await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: /Offline shell incomplete:.*f2l.worker/ })).toBeVisible();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: /Failed to fetch/ })).toBeVisible();
  await context.setOffline(false); await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: /Offline review ready.*F2L ready/ })).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
  const repaired = await backup(page); expect(repaired.value.attempts).toEqual(before.value.attempts); await context.setOffline(true); await page.reload(); await expect(page.getByRole('button', { name: /F2L ready/ })).toBeVisible(); await expect(page.locator('.session-dock')).toContainText('1 saved attempts');
});

test('active real F2L attempt blocks an actual release update and saved history survives activation', async ({ page, context, preparedRelease }) => {
  await setup(page); await choose(page, 'recognition', 'hidden'); await start(page); const idle = await context.newPage(); await idle.goto('/');
  await executeStartOnly(page); await recognitionHidden(page); await cp(preparedRelease, resolve('dist'), { recursive: true }); await dataPanel(idle); await idle.getByRole('button', { name: 'Check for update' }).click(); await idle.getByRole('button', { name: 'Close dialog' }).click();
  await expect(idle.getByRole('button', { name: 'Apply update' })).toBeVisible({ timeout: 30000 }); idle.on('dialog', (dialog) => void dialog.accept()); await idle.getByRole('button', { name: 'Apply update' }).click(); await expect(idle.locator('.practice [role=alert]')).toContainText('other tabs');
  await page.bringToFront(); await page.keyboard.press('Space'); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); const saved = await backup(page);
  await idle.getByRole('button', { name: 'Apply update' }).click(); await expect(page.getByRole('button', { name: /F2L ready/ })).toBeVisible({ timeout: 30000 }); await expect(page.locator('.session-dock')).toContainText('1 saved attempts'); const retained = await backup(page); expect(retained.value.attempts).toEqual(saved.value.attempts);
});
