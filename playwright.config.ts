import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 45000,
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
    { command: 'node tests/helpers/browser-server.mjs', url: 'http://127.0.0.1:4174', reuseExistingServer: false },
  ],
});
