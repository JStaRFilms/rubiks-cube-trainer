import { test as base } from '@playwright/test';
import { exec } from 'node:child_process';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(exec);
export const test = base.extend<{ preparedRelease: string }>({
  preparedRelease: [async ({ browserName }, use, workerInfo) => {
    await mkdir('test-results', { recursive: true });
    const directory = await mkdtemp(resolve('test-results', `update-release-${workerInfo.workerIndex}-`));
    const releaseId = `trainer-update-${randomUUID()}`, started = performance.now();
    await execute(`pnpm exec vite build --outDir "${directory}" --emptyOutDir`, {
      env: { ...process.env, RELEASE_ID: releaseId }, timeout: 110000, maxBuffer: 4 * 1024 * 1024,
    });
    const manifest: unknown = JSON.parse(await readFile(resolve(directory, 'release-assets.json'), 'utf8'));
    if (!manifest || typeof manifest !== 'object' || !('releaseId' in manifest) || manifest.releaseId !== releaseId) throw new Error('Prepared update release identity does not match.');
    console.log(`Update ${browserName} alternate-release preparation: ${Math.round(performance.now() - started)} ms`);
    await use(directory);
  }, { timeout: 120000 }],
});
