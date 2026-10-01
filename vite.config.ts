import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { ENGINE_VERSION, ENGINE_SOURCE, ENGINE_INTEGRITY, INITIALIZATION } from './src/cube/version';

import { TABLE_VERSION } from './src/cross/table';
const releaseId = process.env.RELEASE_ID ?? `review-${Date.now()}`;
function assetManifest(): Plugin {
  return {
    name: 'complete-release-manifest', enforce: 'post',
    generateBundle: { order: 'post', handler(_, bundle) {
      const assets = Object.values(bundle).map((item) => {
        const bytes = Buffer.from(item.type === 'chunk' ? item.code : item.source);
        return { url: `/${item.fileName}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
      });
      for (const file of ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest', ...readdirSync('public/licenses').map((file) => `licenses/${file}`)]) {
        const bytes = readFileSync(`public/${file}`);
        assets.push({ url: `/${file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
      this.emitFile({ type: 'asset', fileName: 'release-assets.json', source: JSON.stringify({
        releaseId, cubeContract: 'cube3-facelets-v1', engine: ENGINE_VERSION, engineSource: ENGINE_SOURCE, engineIntegrity: ENGINE_INTEGRITY, dataset: null, tables: TABLE_VERSION,
        scope: 'cross-practice', initialization: [...INITIALIZATION], assets,
      }) });
    } },
  };
}
export default defineConfig({
  define: { __RELEASE_ID__: JSON.stringify(releaseId) },
  plugins: [react(), tailwind(), assetManifest(), VitePWA({
    strategies: 'injectManifest', srcDir: 'src/pwa', filename: 'sw.ts', injectRegister: false,
    manifest: false, injectManifest: { injectionPoint: undefined },
  })],
  worker: { format: 'es' },
  build: { sourcemap: false },
});
