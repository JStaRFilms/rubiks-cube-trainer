import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/update-release';
import { cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TrainerBackupV1 } from '../../src/store/records';
import { oracleCross, oraclePair, oracleReplay, oracleSolved } from '../helpers/cross-one-oracle';

async function dataPanel(page: Page) { await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click(); }
async function setup(page: Page) {
  await page.goto('/'); await dataPanel(page); await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Cross\+1 ready/ })).toBeVisible({ timeout: 30000 });
}
async function choose(page: Page, slot = 'any', K = '3', L = '8', color = 'white') {
  await page.getByRole('combobox', { name: 'Trainer', exact: true }).selectOption('cross1');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('combobox', { name: 'Maximum Cross depth', exact: true }).selectOption(K); await page.getByRole('combobox', { name: 'Combined solution cap', exact: true }).selectOption(L);
  await page.getByRole('combobox', { name: 'Pair goal', exact: true }).selectOption(slot); await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption(color);
  await page.getByRole('button', { name: 'Save settings' }).click(); await expect(page.getByText('Settings saved on this device.')).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
}
async function start(page: Page) {
  await expect(page.getByRole('button', { name: 'Start Cross+1 practice', exact: true })).toBeDisabled();
  await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click();
  await expect(page.getByRole('button', { name: /Untimed timer/ })).toBeEnabled({ timeout: 30000 });
}
async function execute(page: Page) {
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await page.keyboard.press('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
}
async function backup(page: Page) {
  await dataPanel(page); const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click();
  const path = await (await downloading).path(), bytes = readFileSync(path ?? ''), value: TrainerBackupV1 = JSON.parse(bytes.toString());
  await page.getByRole('button', { name: 'Close dialog' }).click(); return { bytes, value };
}

test('fresh unopened-trainer setup, cold offline any/target, keyboard/touch, actual history/restore and never-opened 3D', async ({ page, context, browser }) => {
  await setup(page); expect(await page.locator('twisty-player').count()).toBe(0); await context.setOffline(true); await page.close();
  const cold = await context.newPage(), failures: string[] = []; cold.on('requestfailed', (r) => failures.push(r.url())); cold.on('dialog', (d) => void d.accept());
  await cold.goto('/cross-one-offline'); await expect(cold.getByRole('button', { name: /Cross\+1 ready/ })).toBeVisible({ timeout: 30000 });
  await choose(cold); await start(cold);
  await expect(cold.getByRole('region', { name: 'Presented challenge' })).toContainText('any one pair');
  expect(await cold.locator('main').innerText()).not.toMatch(/generator solved slots|Found solution|Pair you executed|\b(FR|FL|BR|BL)\b/);
  expect(await cold.locator('main').ariaSnapshot()).not.toMatch(/generator solved slots|Found solution|\b(FR|FL|BR|BL)\b/);
  await execute(cold); await expect(cold.locator('.attempt-result')).toContainText('Pair you executed: not recorded');
  const saved = await backup(cold), attempt = saved.value.attempts[0]; if (!attempt || attempt.challenge.proof.kind !== 'combined-bound') throw new Error('Missing real Cross+1 record');
  const c = attempt.challenge; if (c.proof.kind !== 'combined-bound') throw new Error('Wrong proof'); expect(attempt.selfReport).toBeUndefined(); expect(c.options).toEqual({ trainer: 'cross1', K: 3, L: 8, pair: { kind: 'any' } });
  expect(oracleReplay(oracleSolved, c.scramble)).toBe(c.start.facelets); const final = oracleReplay(c.start.facelets, c.proof.witness);
  expect(oracleCross(final)).toBe(true); expect(c.proof.solvedSlots.every((slot) => oraclePair(final, slot))).toBe(true);
  await cold.getByRole('button', { name: 'Review attempt' }).click(); await expect(cold.getByRole('heading', { name: /Found solution/ })).toBeVisible();
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 }); await expect(cold.getByTestId('player-state')).toHaveText(c.start.facelets);
  for (let i = 0; i < c.proof.witness.length; i++) await cold.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(cold.getByTestId('logical-state')).toHaveText(final); await expect(cold.getByTestId('player-state')).toHaveText(final); await cold.getByRole('button', { name: 'Close dialog' }).click();
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.locator('.attempt-list summary').click(); await expect(cold.getByRole('region', { name: 'Saved attempt history' })).toContainText('Pair you executed: not recorded'); await cold.getByRole('button', { name: 'Set DNF', exact: true }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toHaveText('DNF');
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Delete attempt…', exact: true }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.clock')).toHaveText('Removed');
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Undo latest history change' }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toHaveText('DNF');
  await dataPanel(cold); await cold.getByLabel('Restore backup file').setInputFiles({ name: 'real-cross1.json', mimeType: 'application/json', buffer: saved.bytes }); await expect(cold.getByText('Validated backup preview')).toBeVisible();
  await cold.getByLabel('I confirm replacement').check(); await cold.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(cold.getByText('Local data replaced.')).toBeVisible(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result')).toHaveCount(0);
  await choose(cold, 'BL', '8', '12', 'red'); await cold.setViewportSize({ width: 390, height: 844 }); await start(cold); await expect(cold.getByRole('region', { name: 'Presented challenge' })).toContainText('red down, green front');
  const cdp = await context.newCDPSession(cold); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true }); const box = await cold.getByRole('button', { name: /Untimed timer/ }).boundingBox(); if (!box) throw new Error('Missing timer');
  expect(box.y + box.height).toBeLessThanOrEqual(844); const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cold.waitForTimeout(330); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(cold.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await expect(cold.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
  await cold.getByRole('button', { name: 'Next challenge' }).click(); await expect(cold.getByLabel('My cube is fully solved')).not.toBeChecked(); await expect(cold.getByRole('button', { name: 'Start Cross+1 practice', exact: true })).toBeDisabled();
  await cold.setViewportSize({ width: 1280, height: 720 }); const actual = await backup(cold); expect(actual.value.attempts).toHaveLength(2); const target = actual.value.attempts.find((record) => record.id !== attempt.id); if (!target || target.challenge.proof.kind !== 'combined-bound') throw new Error('Missing target');
  expect(target.challenge.options).toEqual({ trainer: 'cross1', K: 8, L: 12, pair: { kind: 'slot', slot: 'BL' } }); expect(oraclePair(oracleReplay(target.challenge.start.facelets, target.challenge.proof.witness), 'BL')).toBe(true);
  await cold.reload(); await expect(cold.locator('.session-dock')).toContainText('2 saved attempts'); expect(failures).toEqual([]); console.log(`Cross+1 cold offline real loop: Chrome ${browser.version()}, ${process.platform}, touch emulation only`);
});

test('cancel/settings and verified dialog deferral preserve goals; player suspends pending work', async ({ page }) => {
  await page.goto('/'); await choose(page, 'FR', '1', '12'); await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await page.getByRole('button', { name: 'Cancel generation' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await choose(page, 'FL', '3', '8', 'blue'); await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await page.getByRole('button', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Cross+1 verified. Waiting' })).toBeVisible({ timeout: 30000 }); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toContainText('the FL pair'); await expect(page.getByRole('region', { name: 'Presented challenge' })).toContainText('blue down');
  await page.getByRole('button', { name: 'Cancel attempt' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); await page.getByRole('button', { name: 'Next challenge' }).click();
  await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await page.getByRole('button', { name: 'Move review', exact: true }).click(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Generation suspended' })).toBeVisible(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
});

test('real node exhaustion and storage quota failure retain options and exact stopped record for retry', async ({ page }) => {
  await page.addInitScript(() => {
    const send = Worker.prototype.postMessage; let exhaust = true;
    Worker.prototype.postMessage = function (message: unknown) {
      if (message && typeof message === 'object' && 'kind' in message && message.kind === 'generate' && 'request' in message) {
        const value = message.request;
        if (value && typeof value === 'object' && 'options' in value && 'budget' in value && value.options && typeof value.options === 'object' && 'trainer' in value.options && value.options.trainer === 'cross1' && exhaust) { exhaust = false; Object.assign(value.budget ?? {}, { maxNodes: 0 }); }
      }
      send.call(this, message);
    };
  });
  await page.goto('/'); await choose(page, 'BR', '1', '12'); await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await expect(page.getByRole('alert').filter({ hasText: /budget exhausted/ })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.configuration')).toContainText('K ≤ 1 · L ≤ 12 · BR'); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Retry Cross+1 practice', exact: true }).click(); await expect(page.getByRole('button', { name: /Untimed timer/ })).toBeEnabled();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) {
      if (this.name === 'attempts') { IDBObjectStore.prototype.put = original; throw new DOMException('Actual attempt write fault', 'QuotaExceededError'); }
      return key === undefined ? original.call(this, value) : original.call(this, value, key);
    };
  });
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Next challenge' })).toHaveCount(0);
  const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: 'Emergency export unsaved attempt' }).click(); const path = await (await downloading).path(); const emergency: { unsaved: boolean; attempt: unknown } = JSON.parse(readFileSync(path ?? '', 'utf8')); expect(emergency.unsaved).toBe(true);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
  const saved = await backup(page); expect(saved.value.attempts).toEqual([emergency.attempt]); expect(saved.value.attempts[0]?.challenge.options).toEqual({ trainer: 'cross1', K: 1, L: 12, pair: { kind: 'slot', slot: 'BR' } });
});

test('confirmed restore cancels deferred generation and cross-tab settings fail adoption after a fresh read', async ({ page, context }) => {
  await page.goto('/'); await choose(page); await start(page); await execute(page); const saved = await backup(page);
  await page.getByRole('button', { name: 'Next challenge' }).click(); await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await dataPanel(page);
  await expect(page.getByRole('status').filter({ hasText: 'Cross+1 verified. Waiting' })).toBeVisible({ timeout: 30000 });
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'real-deferred-restore.json', mimeType: 'application/json', buffer: saved.bytes }); await expect(page.getByText('Validated backup preview')).toBeVisible();
  await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(page.getByText('Local data replaced.')).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByLabel('My cube is fully solved').check(); await page.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click(); await page.getByRole('button', { name: 'Help', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'Cross+1 verified. Waiting' })).toBeVisible({ timeout: 30000 });
  const other = await context.newPage(); await other.goto('/'); await choose(other, 'BL', '8', '12'); await page.bringToFront(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Settings changed in another tab' })).toBeVisible(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.reload(); await expect(page.locator('.configuration')).toContainText('K ≤ 8 · L ≤ 12 · BL'); await expect(page.locator('.session-dock')).toContainText('1 saved attempts');
});

test('Cross+1 active timing blocks an actual update; saved history survives activation', async ({ page, context, preparedRelease }) => {
  await setup(page); await choose(page, 'FR', '3', '8'); await start(page); const idle = await context.newPage(); await idle.goto('/');
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  await cp(preparedRelease, resolve('dist'), { recursive: true }); await dataPanel(idle); await idle.getByRole('button', { name: 'Check for update' }).click(); await idle.getByRole('button', { name: 'Close dialog' }).click();
  await expect(idle.getByRole('button', { name: 'Apply update' })).toBeVisible({ timeout: 30000 }); idle.on('dialog', (d) => void d.accept()); await idle.getByRole('button', { name: 'Apply update' }).click(); await expect(idle.locator('.practice [role=alert]')).toContainText('other tabs');
  await page.bringToFront(); await page.keyboard.press('Space'); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); await idle.getByRole('button', { name: 'Apply update' }).click();
  await expect(page.getByRole('button', { name: /Cross\+1 ready/ })).toBeVisible({ timeout: 30000 }); await expect(page.locator('.session-dock')).toContainText('1 saved attempts'); const retained = await backup(page); expect(retained.value.attempts[0]?.trainer).toBe('cross1');
});
