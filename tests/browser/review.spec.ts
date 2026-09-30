import { test, expect, type Page } from '@playwright/test';
import { geometricApply } from '../helpers/cube-geometry';
import { writeFileSync } from 'node:fs';
test.use({ reducedMotion: 'no-preference' });
const solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
async function openReview(page: Page, setup = '', moves = "R U R' U'") {
  await page.getByRole('button', { name: 'Move review', exact: true }).click();
  await page.getByLabel('Setup', { exact: true }).fill(setup); await page.getByLabel('Moves', { exact: true }).fill(moves);
  await expect(page.getByRole('button', { name: 'Validate and review' })).toBeEnabled();
  await page.getByRole('button', { name: 'Validate and review' }).click();
}
async function initializeOffline(page: Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'Help', exact: true }).click(); await page.getByRole('button', { name: 'Local data and offline setup' }).click();
  await page.getByRole('button', { name: 'Set up / retry review' }).click();
  await expect(page.getByRole('button', { name: 'Reload to finish setup' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Reload to finish setup' }).click();
  await expect(page.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
}
test('real player agrees at every forward/backward step; controls and input remain isolated', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const moves = ['U', 'R', 'F', 'D', 'L', 'B', 'Uw', 'Rw', 'Fw', 'Dw', 'Lw', 'Bw', 'M', 'E', 'S', 'x', 'y', 'z'];
  const start = performance.now(); await openReview(page, "R U2 F'", moves.join(' '));
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  console.log(`Cold online model+player review ${Math.round(performance.now() - start)} ms`);
  await page.getByText('Current sticker state, URFDLB').click();
  let expected = geometricApply(geometricApply(geometricApply(solved, 'R'), 'U', 2), 'F', -1);
  const states = [expected]; for (const move of moves) { expected = geometricApply(expected, move); states.push(expected); }
  for (let i = 0; i <= moves.length; i++) {
    await expect(page.getByTestId('review-step')).toHaveText(String(i)); await expect(page.getByTestId('player-state')).toHaveText(states[i] ?? ''); await expect(page.getByTestId('logical-state')).toHaveText(states[i] ?? '');
    if (i < moves.length) await page.getByRole('button', { name: 'Forward', exact: true }).click();
  }
  for (let i = moves.length - 1; i >= 0; i--) { await page.getByRole('button', { name: 'Back', exact: true }).click(); await expect(page.getByTestId('player-state')).toHaveText(states[i] ?? ''); }
  await page.getByLabel('Moves', { exact: true }).fill('3Rw'); await page.getByRole('button', { name: 'Validate and review' }).click();
  await expect(page.locator('.move-review [role=alert]')).toContainText('Unsupported'); await expect(page.getByTestId('canonical-moves')).toHaveText(moves.join(' '));
  await page.getByRole('button', { name: 'Replay from start' }).click(); await page.getByRole('combobox', { name: 'Speed', exact: true }).selectOption('4');
  await page.getByRole('button', { name: 'Play', exact: true }).click(); await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
  await expect(page.getByTestId('review-step')).not.toHaveText('0'); await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await page.getByTestId('review-step').textContent(); await page.waitForTimeout(400); await expect(page.getByTestId('review-step')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Replay from start' }).click(); await expect(page.getByTestId('player-state')).toHaveText(states[0] ?? '');
  const before = await page.evaluate(async () => { const player = document.querySelector('twisty-player'); if (!player) throw new Error('Missing player'); return player.experimentalModel.twistySceneModel.orbitCoordinates.get(); });
  await page.getByRole('button', { name: 'Zoom in' }).click();
  const after = await page.evaluate(async () => { const player = document.querySelector('twisty-player'); if (!player) throw new Error('Missing player'); return player.experimentalModel.twistySceneModel.orbitCoordinates.get(); });
  expect(after.distance).toBeLessThan(before.distance);
  const bounds = await page.locator('.player-host').boundingBox(); if (!bounds) throw new Error('No player bounds.');
  await page.mouse.move(bounds.x + 100, bounds.y + 100); await page.mouse.down(); await page.mouse.move(bounds.x + 160, bounds.y + 140, { steps: 8 }); await page.mouse.up();
  await expect.poll(async () => (await page.evaluate(async () => { const player = document.querySelector('twisty-player'); if (!player) throw new Error('Missing player'); return player.experimentalModel.twistySceneModel.orbitCoordinates.get(); })).longitude).not.toBe(after.longitude);
  await page.getByRole('button', { name: 'Forward', exact: true }).focus(); await page.keyboard.press('Space'); await expect(page.getByTestId('review-step')).toHaveText('1');
  await expect(page.locator('.clock')).toHaveText('--.--'); await expect(page.locator('.session-dock')).toContainText('0 saved attempts');
  await page.getByRole('button', { name: 'Close dialog' }).click(); await expect(page.getByRole('button', { name: 'Move review', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});
test('text navigation survives delayed player import and pending renderer readiness', async ({ page }) => {
  let releaseModule: (() => void) | undefined, moduleRequested = false;
  const moduleGate = new Promise<void>((resolve) => { releaseModule = resolve; });
  await page.route('**/assets/player-*.js', async (route) => { moduleRequested = true; await moduleGate; await route.continue(); });
  await page.addInitScript(() => {
    const rendererGate = new Promise<void>((resolve) => document.addEventListener('release-review-renderer', () => resolve(), { once: true }));
    const observer = new MutationObserver(() => {
      const player = document.querySelector('twisty-player'); if (!player) return;
      observer.disconnect();
      const screenshot = player.experimentalScreenshot.bind(player);
      player.experimentalScreenshot = async (options) => {
        document.documentElement.dataset.reviewRendererWaiting = 'true';
        await rendererGate; return screenshot(options);
      };
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/'); await openReview(page, '', 'R U F');
  await expect.poll(() => moduleRequested).toBe(true);
  await page.getByText('Current sticker state, URFDLB').click();
  const r = geometricApply(solved, 'R'), ru = geometricApply(r, 'U'), ruf = geometricApply(ru, 'F');
  const forward = page.getByRole('button', { name: 'Forward', exact: true }), back = page.getByRole('button', { name: 'Back', exact: true });
  await forward.click(); await expect(page.getByTestId('review-step')).toHaveText('1'); await expect(page.getByTestId('logical-state')).toHaveText(r);
  await expect(page.locator('twisty-player')).toHaveCount(0);
  if (!releaseModule) throw new Error('Player module gate was not created.'); releaseModule();
  await expect(page.locator('html')).toHaveAttribute('data-review-renderer-waiting', 'true');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();
  await expect(page.getByTestId('review-step')).toHaveText('1');
  await forward.click(); await back.click(); await forward.click();
  await expect(page.getByTestId('review-step')).toHaveText('2'); await expect(page.getByTestId('logical-state')).toHaveText(ru);
  await page.evaluate(() => document.dispatchEvent(new Event('release-review-renderer')));
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  await expect(page.getByTestId('review-step')).toHaveText('2'); await expect(page.getByTestId('logical-state')).toHaveText(ru); await expect(page.getByTestId('player-state')).toHaveText(ru);
  await forward.click(); await expect(page.getByTestId('player-state')).toHaveText(ruf); await expect(page.getByTestId('logical-state')).toHaveText(ruf);
  await back.click(); await expect(page.getByTestId('review-step')).toHaveText('2'); await expect(page.getByTestId('player-state')).toHaveText(ru);
  expect(errors).toEqual([]);
});
test('failed review module stays in the drawer and reload can recover', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/assets/MoveReview-*.js', (route) => route.abort()); await page.goto('/');
  await page.getByRole('button', { name: 'Move review', exact: true }).click();
  await expect(page.locator('dialog [role=alert]')).toContainText('Move review could not load');
  await expect(page.locator('.clock')).toHaveText('--.--');
  await page.unroute('**/assets/MoveReview-*.js');
  await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Reload to retry', exact: true }).click()]);
  await openReview(page); await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  expect(errors).toEqual([]);
});
test('first-use never-opened renderer initializes on cold offline navigation and warm retry', async ({ page, context, browser }) => {
  const requests: string[] = [], failures: string[] = [];
  context.on('request', (request) => requests.push(request.url())); context.on('requestfailed', (request) => failures.push(request.url()));
  await initializeOffline(page);
  expect(await page.locator('twisty-player').count()).toBe(0);
  expect(requests.some((url) => /twisty-dynamic-3d/.test(url))).toBe(true); // Setup downloaded it, never rendered it.
  await context.setOffline(true); await page.close(); const cold = await context.newPage();
  const cdp = await context.newCDPSession(cold); await cdp.send('Performance.enable');
  const started = performance.now(); await cold.goto('/never-opened-review');
  await expect(cold.getByRole('button', { name: /Offline review ready/ })).toBeVisible({ timeout: 30000 });
  const coldShellMs = Math.round(performance.now() - started), baseline = await cdp.send('Performance.getMetrics'), first = performance.now();
  await openReview(cold, 'M x Rw', "Rw' x' M'");
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  const coldPlayerMs = Math.round(performance.now() - first);
  await cold.getByText('Current sticker state, URFDLB').click();
  for (let i = 0; i < 3; i++) await cold.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(cold.getByTestId('player-state')).toHaveText(solved);
  const metrics = await cdp.send('Performance.getMetrics');
  const warm = performance.now(); await cold.getByLabel('Show interactive 3D').uncheck(); await cold.getByLabel('Show interactive 3D').check();
  await expect(cold.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
  await expect(cold.getByTestId('review-step')).toHaveText('3'); await expect(cold.getByTestId('player-state')).toHaveText(solved);
  const evidence = { browser: browser.version(), platform: process.platform, coldShellMs, coldPlayerMs, warmPlayerMs: Math.round(performance.now() - warm), baseline, metrics, requests: [...new Set(requests)], failures };
  console.log(JSON.stringify(evidence)); writeFileSync('test-results/review-measurements.json', JSON.stringify(evidence, null, 2));
  expect(requests.every((url) => url.startsWith('http://127.0.0.1:4173/'))).toBe(true); expect(failures).toEqual([]);
});
test.describe('physical frames and touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('all six physical frames color actual center materials; touch orbit and pinch do not change state', async ({ page, context }) => {
    test.setTimeout(90000);
    const fixtures = {
      white: ['yellow', 'red', 'green', 'white', 'orange', 'blue'], yellow: ['white', 'orange', 'green', 'yellow', 'red', 'blue'],
      green: ['blue', 'red', 'yellow', 'green', 'orange', 'white'], blue: ['green', 'orange', 'yellow', 'blue', 'red', 'white'],
      red: ['orange', 'yellow', 'green', 'red', 'white', 'blue'], orange: ['red', 'white', 'green', 'orange', 'yellow', 'blue'],
    };
    const hex: Record<string, number> = { white: 0xffffff, yellow: 0xffff00, red: 0xff0000, green: 0x00ff00, blue: 0x2266ff, orange: 0xff9900 };
    await page.goto('/');
    for (const [cross, expected] of Object.entries(fixtures)) {
      await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.getByRole('combobox', { name: 'Cross color', exact: true }).selectOption(cross);
      await page.getByRole('button', { name: 'Save settings' }).click(); await expect(page.getByText('Settings saved on this device.')).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
      await openReview(page, '', 'R'); await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
      const actual = await page.evaluate(async () => {
        const player = document.querySelector('twisty-player'); if (!player) throw new Error('Missing player');
        const object = await player.experimentalCurrentThreeJSPuzzleObject(); object.updateMatrixWorld(true);
        const result: Record<string, number> = {};
        object.traverse((child) => {
          if (!('material' in child) || typeof child.material !== 'object' || !child.material || !('color' in child.material) || !('side' in child.material) || child.material.side !== 0) return;
          const color = child.material.color;
          if (!color || typeof color !== 'object' || !('r' in color) || !('g' in color) || !('b' in color) || typeof color.r !== 'number' || typeof color.g !== 'number' || typeof color.b !== 'number') return;
          const pos = child.matrixWorld.elements.slice(12, 15), nonzero = pos.filter((v) => Math.abs(v) > 0.001);
          if (nonzero.length !== 1 || Math.max(...pos.map(Math.abs)) < 0.3) return;
          const [x = 0, y = 0, z = 0] = pos, face = y > 0.3 ? 'U' : y < -0.3 ? 'D' : x > 0.3 ? 'R' : x < -0.3 ? 'L' : z > 0.3 ? 'F' : 'B';
          result[face] = (Math.round(color.r * 255) << 16) | (Math.round(color.g * 255) << 8) | Math.round(color.b * 255);
        });
        return ['U', 'R', 'F', 'D', 'L', 'B'].map((face) => result[face]);
      });
      expect(actual).toEqual(expected.map((color) => hex[color]));
      await page.getByRole('button', { name: 'Close dialog' }).click();
    }
    await openReview(page, '', 'R'); await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled({ timeout: 20000 });
    const bounds = await page.locator('.player-host').boundingBox(); if (!bounds) throw new Error('No player bounds');
    const cdp = await context.newCDPSession(page);
    const orbit = () => page.evaluate(async () => { const p = document.querySelector('twisty-player'); if (!p) throw new Error('Missing player'); return p.experimentalModel.twistySceneModel.orbitCoordinates.get(); });
    const before = await orbit(), x = bounds.x + 130, y = bounds.y + 130;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 40, y: y + 20 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await orbit()).longitude).not.toBe(before.longitude);
    const zoom = (await orbit()).distance;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 20, y, id: 1 }, { x: x + 20, y, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 55, y, id: 1 }, { x: x + 55, y, id: 2 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await orbit()).distance).toBeLessThan(zoom);
    await expect(page.getByTestId('review-step')).toHaveText('0'); await expect(page.locator('.clock')).toHaveText('--.--');
  });
});
test('reduced motion has usable text stepping; 3D initialization error keeps text and supports retry', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await openReview(page, '', "[R, U]");
  await expect(page.getByText('Reduced motion.', { exact: false })).toBeVisible(); await expect(page.locator('twisty-player')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled(); await page.getByRole('button', { name: 'Forward', exact: true }).click();
  await page.getByText('Current sticker state, URFDLB').click(); await expect(page.getByTestId('logical-state')).toHaveText(geometricApply(solved, 'R'));
  await context.route('**/*twisty-dynamic-3d*', (route) => route.abort());
  await page.getByLabel('Show interactive 3D').check(); await expect(page.locator('.move-review [role=alert]')).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId('canonical-moves')).toHaveText("R U R' U'");
  await page.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(page.getByTestId('review-step')).toHaveText('2'); await expect(page.getByTestId('logical-state')).toHaveText(geometricApply(geometricApply(solved, 'R'), 'U'));
  await page.getByRole('button', { name: 'Back', exact: true }).click(); await expect(page.getByTestId('logical-state')).toHaveText(geometricApply(solved, 'R'));
  await context.unroute('**/*twisty-dynamic-3d*'); await page.getByRole('button', { name: 'Retry 3D' }).click();
  // A failed ESM import is cached by the browser, so reload is the supported recovery if retry cannot repair it.
  await page.getByRole('button', { name: 'Close dialog' }).click(); await page.reload(); await openReview(page);
  await page.getByLabel('Show interactive 3D').check(); await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeEnabled({ timeout: 20000 });
  expect(await page.evaluate(async () => { const player = document.querySelector('twisty-player'); if (!player) throw new Error('Missing player'); return (await player.experimentalCurrentCanvases()).length; })).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();
});
