import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/update-release';
import { cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { TrainerBackupV1 } from '../../src/store/records';
import { oracleCross, oraclePair } from '../helpers/cross-one-oracle';
import { lowerIndices, normalize, replay, solved } from '../helpers/case-oracle';
const base = '/rubiks-cube-trainer/';
async function dataPanel(page: Page) {
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await page.getByRole('button', { name: 'Local data and offline setup' }).click();
}
async function setup(page: Page) {
  await page.goto('./'); await dataPanel(page);
  await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Cross ready.*Cross\+1 ready.*F2L ready.*OLL ready.*PLL ready/ })).toBeVisible({ timeout: 30000 });
}
async function backup(page: Page): Promise<TrainerBackupV1> {
  await dataPanel(page); const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download current backup' }).click();
  const path = await (await download).path(); const value: TrainerBackupV1 = JSON.parse(readFileSync(path ?? '', 'utf8'));
  await page.getByRole('button', { name: 'Close dialog' }).click(); return value;
}
async function startCross(page: Page) {
  await page.getByRole('button', { name: 'Start Cross practice', exact: true }).click();
  await expect(page.getByRole('button', { name: /Untimed timer/ })).toBeEnabled({ timeout: 30000 });
}
async function execute(page: Page) {
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space');
  await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  await page.keyboard.press('Space'); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible();
}
test('published shell, manifest, notices and cache ownership stay inside the repository scope', async ({ page, context, request }) => {
  expect((await request.get(`${base}not-a-route`)).status()).toBe(404);
  expect((await request.get('/index.html')).status()).toBe(404);
  await setup(page);
  const registration = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration(location.href);
    return { scope: registration?.scope, script: navigator.serviceWorker.controller?.scriptURL };
  });
  expect(registration).toEqual({ scope: `http://127.0.0.1:4175${base}`, script: `http://127.0.0.1:4175${base}sw.js` });
  const manifestHref = await page.locator('link[rel=manifest]').getAttribute('href'); expect(manifestHref).toBe(`${base}manifest.webmanifest`);
  const manifest: { id: string; start_url: string; scope: string; icons: { src: string }[] } = await (await request.get(manifestHref ?? '')).json();
  for (const path of [manifest.id, manifest.start_url, manifest.scope]) expect(new URL(path, `http://127.0.0.1:4175${manifestHref}`).pathname).toBe(base);
  for (const icon of manifest.icons) { const path = new URL(icon.src, `http://127.0.0.1:4175${manifestHref}`).pathname; expect(path.startsWith(base)).toBe(true); expect((await request.get(path)).ok()).toBe(true); }
  for (const selector of ['link[rel=icon]', 'link[rel=apple-touch-icon]']) expect(await page.locator(selector).getAttribute('href')).toMatch(new RegExp(`^${base}`));
  await dataPanel(page);
  for (const link of await page.locator('dialog a').all()) { const path = await link.getAttribute('href'); expect(path?.startsWith(`${base}licenses/`)).toBe(true); expect((await request.get(path ?? '')).ok()).toBe(true); }
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.evaluate(async () => {
    await (await caches.open('other-application-cache')).put('/outside.txt', new Response('other application bytes'));
    const own = (await caches.keys()).find((name) => name.startsWith('cube-trainer-assets-%2Frubiks-cube-trainer%2F-')); if (!own) throw Error('Missing scoped cache');
    const cache = await caches.open(own);
    await cache.put('/outside.txt', new Response('must not intercept outside scope'));
    await cache.put(`${location.origin}/other-app/`, new Response('must not intercept outside navigation'));
  });
  expect(await page.evaluate(async () => (await fetch('/outside.txt')).text())).toBe('outside application scope');
  const other = await context.newPage(); await other.goto('/other-app/'); await expect(other.getByText('Other application')).toBeVisible(); await other.close();
  await context.setOffline(true);
  expect(await page.evaluate(async () => { try { await fetch('/outside.txt'); return false; } catch { return true; } })).toBe(true);
  expect(await page.evaluate(async () => (await (await caches.open('other-application-cache')).match('/outside.txt'))?.text())).toBe('other application bytes');
});
for (const trainer of ['cross', 'cross1', 'f2l', 'oll', 'pll'] as const) test(`Pages cold disconnected ${trainer} worker/model, real practice/save and never-opened player`, async ({ page, context, browser }) => {
  const requests: string[] = [], failures: string[] = [], errors: string[] = [];
  context.on('request', (request) => requests.push(request.url())); context.on('requestfailed', (request) => failures.push(request.url())); context.on('page', (opened) => opened.on('pageerror', (error) => errors.push(error.message)));
  await setup(page); expect(await page.locator('twisty-player').count()).toBe(0);
  await context.setOffline(true); await page.close(); const cold = await context.newPage();
  await cold.goto(`./cold-${trainer}`); await expect(cold.getByRole('button', { name: /OLL ready.*PLL ready/ })).toBeVisible({ timeout: 30000 });
  await cold.getByRole('combobox', { name: 'Trainer', exact: true }).selectOption(trainer);
  if (trainer === 'cross') await startCross(cold);
  else if (trainer === 'cross1') {
    await cold.getByLabel('My cube is fully solved').check(); await cold.getByRole('button', { name: 'Start Cross+1 practice', exact: true }).click();
  } else if (trainer === 'f2l') {
    await cold.getByLabel('My Cross and all four pairs').check(); await cold.getByRole('button', { name: 'Start F2L practice', exact: true }).click();
  } else {
    await cold.getByRole('button', { name: `Start ${trainer.toUpperCase()} run`, exact: true }).click();
    await expect(cold.getByRole('button', { name: 'Present next rep' })).toBeVisible({ timeout: 30000 });
    await cold.getByRole('checkbox', { name: /My F2L|My cube is fully solved/ }).check(); await cold.getByRole('button', { name: 'Present next rep', exact: true }).click();
  }
  await expect(cold.getByRole('button', { name: /Untimed timer/ })).toBeEnabled({ timeout: 30000 }); await execute(cold);
  const saved = await backup(cold), attempt = saved.attempts[0]; if (!attempt) throw Error('Missing real saved attempt');
  expect(saved.attempts).toHaveLength(1); expect(attempt.trainer).toBe(trainer); expect(attempt.timing.status).toBe('completed');
  expect(replay(solved, attempt.challenge.scramble)).toBe(attempt.challenge.start.facelets);
  const proof = attempt.challenge.proof;
  const moves = proof.kind === 'combined-bound' ? proof.witness : proof.kind === 'cross-optimal' || proof.kind === 'case' ? proof.solution : [];
  const finalAuf = proof.kind === 'case' ? proof.finalAuf : undefined;
  const completeMoves = [...moves, ...(!finalAuf ? [] : [{ family: 'U' as const, amount: finalAuf === 3 ? -1 as const : finalAuf }])];
  const final = normalize(replay(attempt.challenge.start.facelets, completeMoves));
  if (trainer === 'cross' || trainer === 'cross1') expect(oracleCross(final)).toBe(true);
  if (proof.kind === 'combined-bound') expect(proof.solvedSlots.every((slot) => oraclePair(final, slot))).toBe(true);
  if (trainer === 'f2l' || trainer === 'oll' || trainer === 'pll') expect(lowerIndices.every((index) => final[index] === solved[index])).toBe(true);
  if (trainer === 'pll') expect(final).toBe(solved);
  if (trainer === 'oll' || trainer === 'pll') { expect(saved.runs).toHaveLength(1); expect(saved.runs[0]?.cursor).toBe(1); expect(attempt.runId).toBe(saved.runs[0]?.id); }
  await cold.getByRole('button', { name: 'Review attempt' }).click();
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 }); await expect(cold.getByTestId('player-state')).toHaveText(attempt.challenge.start.facelets);
  for (let index = 0; index < completeMoves.length; index++) await cold.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(cold.getByTestId('logical-state')).toHaveText(final); await expect(cold.getByTestId('player-state')).toHaveText(final);
  await cold.getByRole('button', { name: 'Close dialog' }).click(); await cold.reload();
  await expect(cold.getByRole('combobox', { name: 'Trainer', exact: true })).toHaveValue(trainer, { timeout: 30000 }); await expect(cold.locator('.session-dock')).toContainText('1 saved attempts');
  expect((await backup(cold)).attempts).toEqual(saved.attempts);
  expect(failures).toEqual([]); expect(errors).toEqual([]); expect(requests.every((url) => url.startsWith(`http://127.0.0.1:4175${base}`))).toBe(true);
  console.log(`Pages ${trainer}: cold disconnected real timer/save/player, Chrome ${browser.version()}, ${process.platform}. No physical solve or accelerated clock.`);
});
test('Pages update ignores unrelated windows/caches, blocks real active practice and retains actual history', async ({ page, context, preparedRelease }) => {
  await setup(page);
  const beforeRelease = await page.evaluate(async () => {
    const response = await fetch(`${location.pathname}release-assets.json`); const manifest: { releaseId: string } = await response.json();
    await (await caches.open('other-application-cache')).put('/outside.txt', new Response('retain other application'));
    await (await caches.open(`cube-trainer-assets-%2F-${manifest.releaseId}`)).put('/index.html', new Response('retain root application'));
    return manifest.releaseId;
  });
  const unrelated = await context.newPage(); await unrelated.goto('/other-app/');
  const idle = await context.newPage(); await idle.goto('./'); await page.bringToFront(); await startCross(page);
  await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  await cp(preparedRelease, resolve('dist'), { recursive: true }); await dataPanel(idle); await idle.getByRole('button', { name: 'Check for update' }).click(); await idle.getByRole('button', { name: 'Close dialog' }).click();
  await expect(idle.getByRole('button', { name: 'Apply update' })).toBeVisible({ timeout: 30000 }); idle.on('dialog', (dialog) => void dialog.accept()); await idle.getByRole('button', { name: 'Apply update' }).click();
  await expect(idle.locator('.practice [role=alert]')).toContainText('other tabs'); await expect(page.getByRole('status').filter({ hasText: 'Tap to stop' })).toBeVisible();
  await page.bringToFront(); await page.keyboard.press('Space'); await expect(page.getByRole('status').filter({ hasText: 'Saved on this device' })).toBeVisible(); const before = await backup(page);
  await Promise.all([page.waitForEvent('load'), idle.getByRole('button', { name: 'Apply update' }).click()]);
  await expect(page.getByRole('button', { name: /OLL ready.*PLL ready/ })).toBeVisible({ timeout: 30000 }); expect((await backup(page)).attempts).toEqual(before.attempts);
  await expect(unrelated.getByText('Other application')).toBeVisible();
  const retained = await page.evaluate(async (releaseId) => ({
    other: await (await (await caches.open('other-application-cache')).match('/outside.txt'))?.text(),
    root: await (await (await caches.open(`cube-trainer-assets-%2F-${releaseId}`)).match('/index.html'))?.text(),
    old: (await caches.keys()).includes(`cube-trainer-assets-%2Frubiks-cube-trainer%2F-${releaseId}`),
  }), beforeRelease);
  expect(retained).toEqual({ other: 'retain other application', root: 'retain root application', old: true });
  await context.setOffline(true); await page.reload(); await expect(page.getByRole('button', { name: /OLL ready.*PLL ready/ })).toBeVisible({ timeout: 30000 }); expect((await backup(page)).attempts).toEqual(before.attempts);
});
