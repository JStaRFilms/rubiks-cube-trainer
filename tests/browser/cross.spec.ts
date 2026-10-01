import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { geometricApply, geometry } from '../helpers/cube-geometry';
import type { TrainerBackupV1 } from '../../src/store/records';

async function dataPanel(page: Page) { await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click(); }
async function setup(page: Page) {
  await page.goto('/'); await dataPanel(page); await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Offline review ready.*Cross ready/ })).toBeVisible({ timeout: 30000 });
}
async function saveWithSpace(page: Page) {
  const timer = page.getByRole('button', { name: /Untimed timer/ }); await expect(timer).toBeEnabled(); await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await page.keyboard.press('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
}
async function backup(page: Page): Promise<{ value: TrainerBackupV1; bytes: Buffer }> {
  await dataPanel(page); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click();
  const path = await (await download).path(), bytes = readFileSync(path ?? ''); const value: TrainerBackupV1 = JSON.parse(bytes.toString());
  await page.getByRole('button', { name: 'Close dialog' }).click(); return { value, bytes };
}
test('fresh setup, cold disconnected generation, Space/touch saves, never-opened optimal 3D, history and confirmed restore', async ({ page, context, browser }) => {
  await setup(page); expect(await page.locator('twisty-player').count()).toBe(0);
  context.on('page', (opened) => opened.on('dialog', (dialog) => void dialog.accept()));
  await context.setOffline(true); await page.close(); const cold = await context.newPage();
  const failed: string[] = []; cold.on('requestfailed', (request) => failed.push(request.url()));
  await cold.goto('/cross-offline-cold'); await expect(cold.getByRole('button', { name: /Cross ready/ })).toBeVisible({ timeout: 30000 });
  await cold.getByRole('button', { name: 'Start Cross practice', exact: true }).click();
  await expect(cold.getByRole('region', { name: 'Presented challenge' })).toBeVisible({ timeout: 30000 }); await saveWithSpace(cold);
  const saved = await backup(cold); expect(saved.value.attempts).toHaveLength(1);
  const attempt = saved.value.attempts[0]; if (!attempt || attempt.challenge.proof.kind !== 'cross-optimal') throw new Error('Missing real Cross record');
  const solved = 'URFDLB'.split('').map((f) => f.repeat(9)).join('');
  const start = attempt.challenge.scramble.reduce((state, move) => geometricApply(state, move.family, move.amount), solved);
  expect(start).toBe(attempt.challenge.start.facelets);
  const final = attempt.challenge.proof.solution.reduce((state, move) => geometricApply(state, move.family, move.amount), start);
  const crossStickers = geometry.filter((sticker) => sticker.position[1] === -1 && sticker.position.filter((v) => v !== 0).length === 2).map((s) => s.index);
  expect(crossStickers.every((index) => final[index] === solved[index])).toBe(true);
  await cold.getByRole('button', { name: 'Review attempt' }).click(); await expect(cold.getByRole('heading', { name: /Optimal Cross/ })).toBeVisible();
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 }); await expect(cold.getByTestId('player-state')).toHaveText(start);
  for (let step = 0; step < attempt.challenge.proof.depth; step++) await cold.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(cold.getByTestId('logical-state')).toHaveText(final); await expect(cold.getByTestId('player-state')).toHaveText(final);
  await cold.getByRole('button', { name: 'Close dialog' }).click();
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.locator('.attempt-list summary').click(); await cold.getByRole('button', { name: 'Set DNF', exact: true }).click();
  await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toHaveText('DNF');
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Delete attempt…', exact: true }).click();
  await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.getByRole('status').filter({ hasText: 'no longer in saved history' })).toBeVisible(); await expect(cold.getByRole('button', { name: 'Review attempt' })).toHaveCount(0);
  await cold.setViewportSize({ width: 320, height: 640 });
  expect(await cold.locator('.clock').evaluate((clock) => clock.scrollWidth <= clock.clientWidth)).toBe(true);
  await cold.setViewportSize({ width: 1280, height: 720 });
  await cold.getByRole('button', { name: 'Session / history', exact: true }).click(); await cold.getByRole('button', { name: 'Undo latest history change' }).click(); await cold.getByRole('button', { name: 'Close dialog' }).click(); await expect(cold.locator('.attempt-result h2')).toHaveText('DNF');
  await dataPanel(cold); await cold.getByLabel('Restore backup file').setInputFiles({ name: 'actual-cross.json', mimeType: 'application/json', buffer: saved.bytes }); await expect(cold.getByText('Validated backup preview')).toBeVisible();
  await cold.getByLabel('I confirm replacement').check(); await cold.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(cold.getByText('Local data replaced.')).toBeVisible(); await cold.getByRole('button', { name: 'Close dialog' }).click();
  await expect(cold.locator('.attempt-result')).toHaveCount(0);
  await cold.setViewportSize({ width: 390, height: 844 });
  await cold.getByRole('button', { name: 'Start Cross practice', exact: true }).click(); await expect(cold.getByRole('button', { name: /Untimed timer/ })).toBeEnabled();
  const cdp = await context.newCDPSession(cold); await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true }); const target = await cold.getByRole('button', { name: /Untimed timer/ }).boundingBox(); if (!target) throw new Error('Timer missing');
  const point = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cold.waitForTimeout(330); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(cold.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(cold.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); await cold.reload(); await expect(cold.locator('.session-shelf')).toBeVisible(); await expect(cold.locator('.session-shelf')).toContainText('2 saved attempts'); expect(failed).toEqual([]);
  console.log(`Cross offline loop: Chrome ${browser.version()} on ${process.platform}`);
});
test('cancel and settings invalidate pending generation; dialog defers DOM presentation; physical frame and phone timer fit', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Start Cross practice', exact: true }).click(); await page.getByRole('button', { name: 'Cancel generation' }).click();
  await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption('red'); await page.getByRole('combobox', { name: 'Maximum Cross depth', exact: true }).selectOption('8'); await page.getByRole('button', { name: 'Save settings' }).click(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Start Cross practice', exact: true }).click(); await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.waitForTimeout(1000); await expect(page.getByRole('region', { name: 'Presented challenge' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toContainText('red down');
  for (const [width, height] of [[320, 640], [390, 844], [1440, 900]]) {
    await page.setViewportSize({ width: width ?? 320, height: height ?? 640 }); const box = await page.getByRole('button', { name: /Untimed timer/ }).boundingBox(); if (!box) throw new Error('Timer not visible');
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(height ?? 640); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeDisabled(); await page.getByRole('button', { name: 'Cancel attempt' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
  const saved = await backup(page); expect(saved.value.attempts[0]?.timing.status).toBe('interrupted'); expect(saved.value.attempts[0]?.challenge.options).toEqual({ trainer: 'cross', K: 8 });
});
test('corrupt and absent Cross cache downgrade readiness and repair offline without deleting a real attempt', async ({ page, context }) => {
  await setup(page); await page.getByRole('button', { name: 'Start Cross practice' }).click(); await expect(page.getByRole('region', { name: 'Presented challenge' })).toBeVisible(); await saveWithSpace(page);
  const corrupt = () => page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('cube-trainer-solver'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const tx = db.transaction('tables', 'readwrite'), store = tx.objectStore('tables'); const get = store.getAll(); get.onsuccess = () => { const entry = get.result[0]; new Uint8Array(entry.bytes)[100] = 255; store.put(entry); }; await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
  });
  await context.setOffline(true); await corrupt(); await dataPanel(page); await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Cross table cache missing, corrupt' })).toBeVisible();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: /Offline review ready.*Cross ready/ })).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('cube-trainer-solver'); request.onsuccess = () => resolve(request.result); });
    const tx = db.transaction('tables', 'readwrite'); tx.objectStore('tables').clear(); await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); }); db.close();
  });
  await dataPanel(page); await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Cross table cache missing, corrupt' })).toBeVisible();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: /Offline review ready.*Cross ready/ })).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
  const actual = await backup(page); expect(actual.value.attempts).toHaveLength(1); await page.reload(); await expect(page.locator('.session-dock')).toContainText('1 saved attempts');
});
