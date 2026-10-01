import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/update-release';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
async function dataPanel(page: Page) {
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await page.getByRole('button', { name: 'Local data and offline setup' }).click();
}
async function setup(page: Page) {
  await page.goto('/'); await dataPanel(page);
  await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
}
async function createSession(page: Page, label: string) {
  await page.getByRole('button', { name: 'Session / history', exact: true }).click();
  await page.getByLabel('Session name').fill(label); await page.getByRole('button', { name: 'New session', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Session saved on this device.' })).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
}
test('settings/session persistence, file round-trip, confirmation and unsafe-import retention', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption('blue');
  await page.getByRole('button', { name: 'Save settings' }).click(); await expect(page.getByText('Settings saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click(); await createSession(page, 'First session'); await page.reload();
  await expect(page.locator('.configuration')).toContainText('blue'); await expect(page.locator('.session-dock')).toContainText('First session');
  await dataPanel(page);
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click();
  const file = await downloaded; const path = await file.path(); expect(path).not.toBeNull();
  const backupBytes = readFileSync(path ?? '');
  const backup: unknown = JSON.parse(backupBytes.toString());
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backupBytes });
  await expect(page.getByText('Validated backup preview')).toBeVisible(); await expect(page.getByRole('button', { name: 'Replace local data', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel restore' }).click();
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'newer.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...(typeof backup === 'object' && backup !== null ? backup : {}), version: 2 })) });
  await expect(page.locator('dialog [role=alert]')).toContainText('Unsupported backup version');
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{') });
  await expect(page.locator('dialog [role=alert]')).toContainText('not valid JSON');
  await page.getByRole('button', { name: 'Clear personal data…' }).click(); await expect(page.getByRole('button', { name: 'Clear confirmed personal data' })).toBeDisabled();
  await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Clear confirmed personal data' }).click(); await expect(page.getByText('Local data replaced.')).toBeVisible();
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backupBytes }); await expect(page.getByText('Validated backup preview')).toBeVisible();
  await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(page.getByText('Local data replaced.')).toBeVisible();
  await page.reload(); await expect(page.locator('.session-dock')).toContainText('First session'); await expect(page.locator('.configuration')).toContainText('blue');
});
test('write quota error is visible and leaves saved preferences unchanged', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved on this device.')).toBeVisible();
  await page.evaluate(() => { IDBObjectStore.prototype.put = function () { throw new DOMException('Injected quota failure', 'QuotaExceededError'); }; });
  await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption('red'); await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.locator('dialog [role=alert]')).toContainText('Storage is full'); await expect(page.getByText('Settings saved on this device.')).not.toBeVisible();
  await page.reload(); await expect(page.locator('.configuration')).toContainText('white');
});
test('real replacement transaction rolls back under browser storage failure', async ({ page }) => {
  await page.goto('/'); await createSession(page, 'Keep me'); await dataPanel(page);
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click();
  const path = await (await downloaded).path(); const bytes = readFileSync(path ?? '');
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: bytes }); await expect(page.getByText('Validated backup preview')).toBeVisible();
  await page.evaluate(() => { const original = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) { if (this.name === 'sessions') throw new DOMException('Injected import quota', 'QuotaExceededError'); return key === undefined ? original.call(this, value) : original.call(this, value, key); }; });
  await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(page.locator('dialog [role=alert]')).toContainText('Storage is full');
  await page.reload(); await expect(page.locator('.session-dock')).toContainText('Keep me');
});
test('cold offline shell loads a never-opened settings view, then detects eviction and repairs it', async ({ page, context, browser }) => {
  console.log(`Browser ${browser.version()}, platform ${process.platform}`);
  await setup(page); await createSession(page, 'Offline retained');
  await context.setOffline(true); await page.close(); const cold = await context.newPage(); await cold.goto('/offline-route');
  await expect(cold.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
  await expect(cold.locator('.session-dock')).toContainText('Offline retained'); await cold.getByRole('button', { name: 'Settings', exact: true }).click(); await expect(cold.getByRole('combobox', { name: 'Cross color', exact: true })).toBeVisible(); await cold.getByRole('button', { name: 'Close dialog' }).click();
  await cold.evaluate(async () => { const names = await caches.keys(); const cache = await caches.open(names.find((name) => name.startsWith('cube-trainer-assets-')) ?? ''); await cache.delete('/icon-512.png'); });
  await dataPanel(cold); await cold.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(cold.getByRole('status').filter({ hasText: 'Offline shell incomplete' })).toBeVisible();
  await context.setOffline(false); await cold.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(cold.getByRole('status').filter({ hasText: 'Offline review ready' })).toBeVisible();
});
test('cache corruption is not declared ready and storage failures are separate', async ({ page }) => {
  await setup(page);
  await page.evaluate(async () => { const name = (await caches.keys()).find((value) => value.startsWith('cube-trainer-assets-')); if (!name) throw new Error('Missing cache'); const cache = await caches.open(name); await cache.put('/icon.svg', new Response('broken icon')); });
  await dataPanel(page); await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Offline shell incomplete' })).toBeVisible();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Offline review ready' })).toBeVisible();
  await page.evaluate(async () => { const names = await caches.keys(); const cache = await caches.open(names.find((name) => name.startsWith('cube-trainer-assets-')) ?? ''); await cache.delete('/release-assets.json'); });
  await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Offline shell incomplete: release manifest' })).toBeVisible();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Offline review ready' })).toBeVisible();
  await page.evaluate(() => { IDBObjectStore.prototype.put = function () { throw new DOMException('Probe quota', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: 'Recheck cached review' }).click(); await expect(page.getByRole('status').filter({ hasText: 'Probe quota' })).toBeVisible(); await expect(page.getByRole('status').filter({ hasText: 'Offline review ready' })).not.toBeVisible();
});
test('interrupted initial shell installation fails honestly, retains work, and retries', async ({ page, context }) => {
  await context.route('**/icon-512.png', (route) => route.abort());
  await page.goto('/'); await dataPanel(page); await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('status').filter({ hasText: /installation was interrupted|installation did not complete/ })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('status').filter({ hasText: 'Offline review ready' })).not.toBeVisible();
  expect(await page.evaluate(async () => { const names = await caches.keys(); const cache = await caches.open(names.find((name) => name.startsWith('cube-trainer-assets-')) ?? ''); return (await cache.keys()).length; })).toBeGreaterThan(1);
  await context.unroute('**/icon-512.png'); await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
});
test('stale restore preview cannot overwrite another tab\'s saved session', async ({ page, context }) => {
  await page.goto('/'); await createSession(page, 'Original'); await dataPanel(page);
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download current backup' }).click(); const path = await (await downloaded).path();
  await page.getByLabel('Restore backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: readFileSync(path ?? '') }); await expect(page.getByText('Validated backup preview')).toBeVisible();
  const other = await context.newPage(); await other.goto('/'); await createSession(other, 'Another tab');
  await page.getByLabel('I confirm replacement').check(); await page.getByRole('button', { name: 'Replace local data', exact: true }).click(); await expect(page.locator('dialog [role=alert]')).toContainText('changed since this preview');
  await page.reload(); await page.getByRole('button', { name: 'Session / history', exact: true }).click(); await expect(page.locator('.session-list')).toContainText('Another tab');
});
test('responsive desktop dock/mobile shelf fit and native dialog focus returns', async ({ page }) => {
  await page.goto('/');
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [900, 700], [901, 700], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width: width ?? 320, height: height ?? 640 });
    const bounds = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewportWidth: innerWidth, viewportHeight: innerHeight, mono: getComputedStyle(document.querySelector('.clock') ?? document.body).fontFamily }));
    expect(bounds.width).toBe(bounds.viewportWidth); expect(bounds.height).toBe(bounds.viewportHeight);
    if ((width ?? 320) <= 900) { await expect(page.locator('.session-shelf')).toBeVisible(); await expect(page.locator('.session-dock')).not.toBeVisible(); expect(bounds.mono).not.toContain('Consolas'); }
    else { await expect(page.locator('.session-dock')).toBeVisible(); await expect(page.locator('.session-shelf')).not.toBeVisible(); expect(bounds.mono).toContain('Consolas'); }
  }
  await page.getByRole('button', { name: 'Settings', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
});
test('downloaded update waits for every tab to close editing, then preserves history', async ({ page, context, preparedRelease }) => {
  await setup(page); await createSession(page, 'Update retained'); const other = await context.newPage(); await other.goto('/');
  await other.getByRole('button', { name: 'Move review', exact: true }).click();
  await other.getByLabel('Moves', { exact: true }).fill('(R U)20'); await other.getByRole('button', { name: 'Validate and review' }).click();
  await expect(other.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  await other.getByRole('button', { name: 'Play', exact: true }).click();
  await cp(preparedRelease, resolve('dist'), { recursive: true });
  await dataPanel(page); await page.getByRole('button', { name: 'Check for update' }).click(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('button', { name: 'Apply update' })).toBeVisible({ timeout: 30000 });
  page.on('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Apply update' }).click(); await expect(page.locator('.practice [role=alert]')).toContainText('other tabs');
  await expect(other.getByRole('dialog')).toBeVisible(); await expect(other.locator('twisty-player')).toHaveCount(1);
  await expect(other.getByTestId('review-step')).not.toHaveText('0'); await other.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Apply update' }).click(); await expect(page.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Apply update' })).not.toBeVisible(); await expect(page.locator('.session-dock')).toContainText('Update retained');
});
