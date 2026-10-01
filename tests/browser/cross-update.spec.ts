import { test as base, expect } from '@playwright/test';
import { exec } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(exec);
const test = base.extend<Record<never, never>, { preparedRelease: string }>({
  preparedRelease: [async ({ browserName }, use, workerInfo) => {
    await mkdir('test-results', { recursive: true });
    const directory = await mkdtemp(resolve('test-results', `cross-update-release-${workerInfo.workerIndex}-`));
    const releaseId = `cross-update-${randomUUID()}`, started = performance.now();
    await execute(`pnpm exec vite build --outDir "${directory}" --emptyOutDir`, {
      env: { ...process.env, RELEASE_ID: releaseId }, timeout: 110000, maxBuffer: 4 * 1024 * 1024,
    });
    const manifest: unknown = JSON.parse(await readFile(resolve(directory, 'release-assets.json'), 'utf8'));
    if (!manifest || typeof manifest !== 'object' || !('releaseId' in manifest) || manifest.releaseId !== releaseId) throw new Error('Prepared update release identity does not match.');
    console.log(`Cross update ${browserName} alternate-release preparation: ${Math.round(performance.now() - started)} ms`);
    await use(directory);
  }, { scope: 'worker', timeout: 120000 }],
});

test('a real Cross execution blocks another tab update; acknowledged save allows activation with history retained', async ({ page, context, preparedRelease }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click();
  await page.getByRole('button', { name: 'Set up / retry review' }).click(); await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Cross ready/ })).toBeVisible({ timeout: 30000 });
  const idle = await context.newPage(); await idle.goto('/');
  await page.getByRole('button', { name: 'Start Cross practice', exact: true }).click(); const timer = page.getByRole('button', { name: /Untimed timer/ }); await expect(timer).toBeEnabled();
  await timer.focus(); await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  const publishing = performance.now();
  await cp(preparedRelease, resolve('dist'), { recursive: true });
  console.log(`Cross update artifact publication: ${Math.round(performance.now() - publishing)} ms`);
  await idle.getByRole('button', { name: 'Help', exact: true }).click(); await idle.getByRole('button', { name: 'Local data and offline setup' }).click(); await idle.getByRole('button', { name: 'Check for update' }).click(); await idle.getByRole('button', { name: 'Close dialog' }).click();
  await expect(idle.getByRole('button', { name: 'Apply update' })).toBeVisible({ timeout: 30000 }); idle.on('dialog', (dialog) => void dialog.accept()); await idle.getByRole('button', { name: 'Apply update' }).click();
  await expect(idle.locator('.practice [role=alert]')).toContainText('other tabs'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  await page.bringToFront(); await timer.focus(); await page.keyboard.press('Space'); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
  await idle.getByRole('button', { name: 'Apply update' }).click(); await expect(idle.getByRole('button', { name: /Cross ready/ })).toBeVisible({ timeout: 30000 }); await expect(page.getByRole('button', { name: /Cross ready/ })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.session-dock')).toContainText('1 saved attempts'); await expect(page.getByRole('button', { name: 'Start Cross practice', exact: true })).toBeVisible();
});
