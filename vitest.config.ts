import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { maxWorkers: 1, include: ['tests/unit/**/*.test.ts'], setupFiles: ['tests/unit/setup.ts'] } });
