import { expect, test, type Page } from '@playwright/test';
import { execSync } from 'node:child_process';
import type { Activity } from '../../src/pwa/activity';
import type {} from '../helpers/contract';
test.use({ baseURL: 'http://127.0.0.1:4174' });
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.pwaListeners = [];
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      if (this === navigator.serviceWorker && listener) window.pwaListeners.push({ type, listener, options });
      original.call(this, type, listener, options);
    };
  });
});
async function install(page: Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click();
  await page.getByRole('button', { name: 'Set up / retry shell' }).click(); await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 }); await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Offline shell ready/ })).toBeVisible({ timeout: 30000 });
}
async function fixture(page: Page) {
  // Replace only this isolated document. The fixture bundles the real PWA/activity
  // modules; it is not shipped in dist and does not implement a pretend timer.
  await page.evaluate(() => { for (const item of window.pwaListeners) navigator.serviceWorker.removeEventListener(item.type, item.listener, item.options); window.pwaListeners = []; });
  await page.evaluate(() => {
    document.title = 'Update contract fixture';
    document.body.replaceChildren();
    const script = document.createElement('script'); script.type = 'module'; script.src = '/contract.js'; document.body.append(script);
  });
  await page.waitForFunction(() => !!window.foundationContract);
  await page.evaluate(() => window.foundationContract.ready);
}
async function waitingUpdate(page: Page) {
  execSync('npm run build', { env: { ...process.env, RELEASE_ID: `contract-update-${Date.now()}` }, stdio: 'pipe' });
  await page.evaluate(() => window.foundationContract.controller.checkUpdate());
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/');
    return registration?.waiting?.state === 'installed';
  }), { timeout: 30000 }).toBe(true);
}
test('real browser activity phases and all-tab worker handshake block unsafe activation', async ({ page, context }) => {
  await install(page); await fixture(page); const other = await context.newPage(); await other.goto('/'); await fixture(other);
  await waitingUpdate(page);
  const before = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
  for (const phase of ['preparation', 'inspection', 'arming', 'execution', 'save-pending', 'save-failed'] satisfies Activity[]) {
    await other.evaluate((value) => window.foundationContract.enterActivity(value), phase);
    const message = await page.evaluate(async () => { try { await window.foundationContract.controller.applyUpdate(); return 'unexpected activation'; } catch (error) { return error instanceof Error ? error.message : 'unknown'; } });
    expect(message).toContain('other tabs'); expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toBe(before);
    expect(await other.evaluate(() => window.foundationContract.state().phase)).toBe(phase);
  }
  await other.evaluate(() => window.foundationContract.enterActivity('idle'));
  const waitReload = page.waitForNavigation(); await page.evaluate(() => window.foundationContract.controller.applyUpdate()).catch(() => {}); await waitReload;
  await expect(page.getByRole('button', { name: /Offline shell ready/ })).toBeVisible({ timeout: 30000 });
});
test('a deferred attempt cannot start after the browser update lock is acquired', async ({ page }) => {
  await install(page); await fixture(page);
  const race = await page.evaluate(async () => {
    const api = window.foundationContract;
    const deferred = Promise.resolve().then(() => api.enterActivity('preparation'));
    const locked = api.lockUpdate('fixture-activation'); const started = await deferred;
    const phase = api.state().phase; api.releaseUpdate('fixture-activation'); return { locked, started, phase, recovered: api.enterActivity('preparation') };
  });
  expect(race).toEqual({ locked: true, started: false, phase: 'idle', recovered: true });
});
