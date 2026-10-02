import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', testMatch: 'pages.spec.ts', workers: 1, timeout: 45000,
  use: { channel: 'chrome', baseURL: 'http://127.0.0.1:4175/rubiks-cube-trainer/', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/helpers/pages-server.mjs', url: 'http://127.0.0.1:4175/rubiks-cube-trainer/', reuseExistingServer: false },
});
