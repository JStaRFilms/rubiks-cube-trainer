import { expect, test, type Page } from '@playwright/test';
import type {} from '../helpers/timer-browser';
test.use({ baseURL: 'http://127.0.0.1:4174' });
async function open(page: Page, mode = 'untimed') {
  await page.goto(`/timer.html?mode=${mode}`);
  await expect(page.getByRole('button', { name: /timer\. Scramble/ })).toBeVisible();
}
function timer(page: Page) { return page.locator('.timer-input'); }
async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-09-30T00:00:00.000Z') });
  await page.clock.pauseAt(new Date('2026-09-30T00:00:01.000Z'));
}
declare global { interface Window { releaseTimerSave: () => void } }
async function start(page: Page) {
  await timer(page).focus(); await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await expect(timer(page)).toContainText('Tap to stop');
}
async function stop(page: Page) {
  await page.keyboard.down('Space'); await page.keyboard.up('Space'); await expect(page.getByRole('status')).toContainText('Saved on this device');
}
test('real Space hold, repeat/early release, native input isolation, guard and acknowledged IndexedDB history', async ({ page }) => {
  await open(page); await page.getByRole('textbox', { name: 'Isolated input' }).fill('text'); await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.timerHarness.controller.getSnapshot().phase)).toBe('preparation');
  await timer(page).focus(); await page.keyboard.down('Space'); await page.keyboard.down('Space'); await page.waitForTimeout(100); await page.keyboard.up('Space');
  await expect(timer(page)).toContainText('Scramble, then hold'); await start(page); await page.waitForTimeout(123); await stop(page);
  const record = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]);
  expect(record?.timing.status).toBe('completed'); expect(record?.timing.executionMs).toBeGreaterThanOrEqual(123); expect(record?.preparationMs).toBeGreaterThan(400);
  await page.keyboard.press('Space'); expect(await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts.length)).toBe(1);
  await page.waitForTimeout(260); await page.getByRole('button', { name: 'Toggle history' }).click(); await expect(page.getByRole('region', { name: 'Saved attempt history' })).toBeVisible();
  await page.locator('summary').click(); await page.getByRole('button', { name: 'Set +2' }).click(); await expect(page.locator('summary')).toContainText('+2');
  const edited = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]); expect(edited?.timing).toEqual(record?.timing); expect(edited?.challenge).toEqual(record?.challenge);
  await page.getByRole('button', { name: 'Undo latest history change' }).click(); await expect(page.locator('summary')).not.toContainText('+2');
  page.once('dialog', (dialog) => dialog.accept()); await page.getByRole('button', { name: 'Delete attempt…' }).click(); await expect(page.locator('summary')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo latest history change' }).click(); await expect(page.locator('summary')).toHaveCount(1);
  await page.getByRole('button', { name: 'Preparation statistics' }).click(); await expect(page.getByText('Preparation includes scrambling and thinking, not pure planning.', { exact: false })).toBeVisible();
});
test('strict first Space gesture only inspects, later hold/release executes; Enter cannot bypass arming', async ({ page }) => {
  await open(page, '15s'); await timer(page).focus(); await page.keyboard.down('Space'); await page.waitForTimeout(350);
  await expect(timer(page)).toContainText('Hold, then release'); await page.keyboard.up('Space'); await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.timerHarness.controller.getSnapshot().phase)).toBe('inspection');
  await start(page); await stop(page); const record = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]);
  expect(record?.timing.inspectionMs).toBeGreaterThanOrEqual(650); expect(record?.settingsSnapshot.inspectionMode).toBe('15s'); expect(record?.penalty.kind).toBe('none');
});
test('pointer hold cancels on exit/capture loss/cancel, ignores extra pointer, and touch starts/stops', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } }), page = await context.newPage(); await open(page);
  const bounds = await timer(page).boundingBox(); if (!bounds) throw new Error('Missing timer bounds');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 50); await page.mouse.down();
  await timer(page).dispatchEvent('pointerdown', { pointerId: 18, pointerType: 'touch', isPrimary: false, button: 0 });
  await timer(page).dispatchEvent('pointerup', { pointerId: 18, pointerType: 'touch', isPrimary: false });
  await timer(page).dispatchEvent('pointercancel', { pointerId: 1 }); await page.mouse.up(); await expect(timer(page)).toContainText('Scramble, then hold');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 50); await page.mouse.down(); await page.waitForTimeout(330); await page.mouse.move(0, 0); await page.mouse.up(); await expect(timer(page)).toContainText('Scramble, then hold');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 50); await page.mouse.down(); await page.waitForTimeout(330); await timer(page).dispatchEvent('lostpointercapture', { pointerId: 1 }); await page.mouse.up(); await expect(timer(page)).toContainText('Scramble, then hold');
  // CDP dispatches real touch events with browser pointer capture, not JS-only pointerup.
  const cdp = await context.newCDPSession(page), point = { x: bounds.x + bounds.width / 2, y: bounds.y + 50 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await page.waitForTimeout(330); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await expect(timer(page)).toContainText('Tap to stop');
  await page.touchscreen.tap(point.x, point.y); await expect(page.getByRole('status')).toContainText('Saved on this device'); expect(await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts.length)).toBe(1); await context.close();
});
test('quota save failure retains exact unsaved record, blocks updates/advance and offers distinct emergency file then retry', async ({ page }) => {
  await open(page); await start(page);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) {
      if (this.name === 'attempts') { IDBObjectStore.prototype.put = put; throw new DOMException('Injected test quota', 'QuotaExceededError'); }
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    };
  });
  await page.keyboard.press('Space'); await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible(); expect(await page.evaluate(() => window.timerHarness.lockUpdate('unsafe'))).toBe(false);
  const unsaved = await page.evaluate(() => window.timerHarness.controller.getSnapshot().record); expect(await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts.length)).toBe(0); await expect(page.getByRole('button', { name: 'Next challenge' })).toHaveCount(0);
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Emergency export unsaved attempt' }).click(); const file = await download; expect(file.suggestedFilename()).toContain('UNSAVED-attempt');
  const stream = await file.createReadStream(); if (!stream) throw new Error('Missing emergency file'); let content = ''; for await (const chunk of stream) content += chunk.toString(); const exported = JSON.parse(content); expect(exported.format).toBe('cube-trainer-unsaved-attempt'); expect(exported.unsaved).toBe(true); expect(exported.attempt).toEqual(unsaved);
  await page.getByRole('button', { name: 'Retry save' }).click(); await expect(page.getByRole('status')).toContainText('Saved on this device'); expect(await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0])).toEqual(unsaved);
});
test('background during execution saves interruption, never resumes and restart reads it as a failure', async ({ page }) => {
  await open(page); await start(page); await page.waitForTimeout(50);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('heading', { name: 'Interrupted. Excluded from successful times' })).toBeVisible(); await expect(page.getByRole('status')).toContainText('Saved on this device');
  const record = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]); expect(record?.timing).toMatchObject({ status: 'interrupted', phase: 'execution', reason: 'background' });
  await expect(timer(page).locator('.clock')).toHaveText('Interrupted');
  expect(record?.timing.executionMs).toBeGreaterThan(0); await expect(page.locator('.attempt-result')).toContainText(`Raw execution: ${((record?.timing.executionMs ?? 0) / 1000).toFixed(3)}`);
  await page.reload(); await expect(timer(page)).toContainText('Scramble, then hold');
  expect(await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0])).toEqual(record);
});
test('primary +2 result stays effective through save-pending, quota failure and acknowledged retry', async ({ page }) => {
  await pauseClock(page); await open(page, '15s'); await timer(page).focus(); await page.keyboard.press('Space');
  await page.clock.runFor(14700); await page.keyboard.down('Space'); await page.clock.runFor(300); await page.keyboard.up('Space');
  await page.clock.runFor(1234);
  await page.evaluate(() => {
    const save = window.timerHarness.repository.saveAttempt.bind(window.timerHarness.repository);
    window.timerHarness.repository.saveAttempt = async (record, run) => {
      await new Promise<void>((resolve) => { window.releaseTimerSave = resolve; });
      await save(record, run);
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) {
      if (this.name === 'attempts') { IDBObjectStore.prototype.put = put; throw new DOMException('Test quota', 'QuotaExceededError'); }
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    };
  });
  await page.keyboard.press('Space'); await expect(page.getByRole('status')).toHaveText('Saving attempt…');
  await expect(timer(page).locator('.clock')).toHaveText('3.234');
  await expect(page.locator('.attempt-result')).toContainText('Raw execution: 1.234 · Preparation, includes scrambling: 15.000');
  await expect(page.locator('.attempt-result')).toContainText('Inspection: 15.000');
  await page.evaluate(() => window.releaseTimerSave()); await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible();
  await expect(timer(page).locator('.clock')).toHaveText('3.234');
  await page.getByRole('button', { name: 'Retry save' }).focus(); await page.keyboard.press('Enter');
  await page.evaluate(() => window.releaseTimerSave()); await expect(page.getByRole('status')).toHaveText('Saved on this device');
  await expect(timer(page).locator('.clock')).toHaveText('3.234');
  const record = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]);
  expect(record).toMatchObject({ timing: { status: 'completed', executionMs: 1234, inspectionMs: 15000 }, preparationMs: 15000, penalty: { kind: 'plus2', source: 'inspection' } });
});
test('primary inspection DNF is a status while raw execution stays separately labeled', async ({ page }) => {
  await pauseClock(page); await open(page, '15s'); await timer(page).focus(); await page.keyboard.press('Space');
  await page.clock.runFor(16700); await page.keyboard.down('Space'); await page.clock.runFor(300); await page.keyboard.up('Space');
  await page.clock.runFor(1234); await page.keyboard.press('Space'); await expect(page.getByRole('status')).toHaveText('Saved on this device');
  await expect(timer(page).locator('.clock')).toHaveText('DNF'); await expect(page.locator('.attempt-result')).toContainText('Raw execution: 1.234');
  const record = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts[0]);
  expect(record).toMatchObject({ timing: { executionMs: 1234, inspectionMs: 17000 }, penalty: { kind: 'dnf', source: 'inspection' } });
});
test('primary inspection clock counts elapsed overtime with +2 and DNF labels, including arming', async ({ page }) => {
  await pauseClock(page); await open(page, '15s'); await timer(page).focus(); await page.keyboard.press('Space');
  // Input transitions render at the paused clock's exact time rather than the last display frame.
  await page.clock.runFor(14900); await page.keyboard.press('Space'); await expect(timer(page).locator('.clock')).toHaveText('0.100'); await expect(page.locator('[aria-label="Inspection countdown"]')).toContainText('seconds remaining');
  await page.clock.runFor(100); await page.keyboard.press('Space'); await expect(timer(page).locator('.clock')).toHaveText('0.000'); await expect(page.locator('[aria-label="Inspection countdown"]')).toHaveText('0.000 seconds overtime · +2 on start');
  await page.clock.runFor(500); await page.keyboard.down('Space'); await expect(timer(page).locator('.clock')).toHaveText('0.500'); await expect(page.locator('[aria-label="Inspection countdown"]')).toHaveText('0.500 seconds overtime · +2 on start');
  await page.clock.runFor(300); await page.evaluate(() => window.timerHarness.controller.tick()); await expect(timer(page).locator('.clock')).toHaveText('0.800');
  await page.clock.runFor(1200); await page.getByRole('textbox', { name: 'Isolated input' }).focus(); await page.keyboard.up('Space');
  await expect(timer(page).locator('.clock')).toHaveText('2.000'); await expect(page.locator('[aria-label="Inspection countdown"]')).toHaveText('2.000 seconds overtime · DNF on start');
  await page.clock.runFor(500); await timer(page).focus(); await page.keyboard.down('Space'); await expect(timer(page).locator('.clock')).toHaveText('2.500'); await expect(page.locator('[aria-label="Inspection countdown"]')).toHaveText('2.500 seconds overtime · DNF on start');
  await page.clock.runFor(300); await page.keyboard.up('Space'); await page.clock.runFor(123); await page.keyboard.press('Space'); await expect(page.getByRole('status')).toHaveText('Saved on this device');
});
test('visual 8/12-second warnings and optional real Web Audio tones use inspection elapsed', async ({ page }) => {
  await page.addInitScript(() => {
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (when?: number) {
      const marker = document.createElement('span'); marker.dataset.testTone = String(this.frequency.value); document.body.append(marker); start.call(this, when);
    };
  });
  await page.clock.install(); await page.goto('/timer.html?mode=15s&audio=1'); await expect(timer(page)).toBeVisible(); await timer(page).click();
  await page.clock.fastForward(8000); await expect(page.getByRole('status')).toContainText('8 seconds of inspection'); await expect(page.locator('[data-test-tone="660"]')).toHaveCount(1);
  await page.clock.fastForward(4000); await expect(page.getByRole('status')).toContainText('12 seconds of inspection'); await expect(page.locator('[data-test-tone="880"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Cancel attempt' }).click(); await expect(page.getByRole('heading', { name: 'Interrupted. Excluded from successful times' })).toBeVisible();
});
test('stale browser history edits cannot overwrite another tab', async ({ page, context }) => {
  await open(page); await start(page); await stop(page); await page.getByRole('button', { name: 'Toggle history' }).click(); await page.locator('summary').click();
  const other = await context.newPage(); await open(other); await other.getByRole('button', { name: 'Cancel attempt' }).click(); await expect(other.getByRole('status')).toContainText('Saved on this device');
  await page.getByRole('button', { name: 'Set +2' }).click(); await expect(page.getByRole('alert')).toContainText('Local data changed');
  const rows = await page.evaluate(async () => (await window.timerHarness.repository.read()).backup.attempts); expect(rows).toHaveLength(2); expect(rows[0]?.penalty.kind).toBe('none');
});
