import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const releaseId = process.env.RELEASE_ID ?? `foundation-${Date.now()}`;
function assetManifest(): Plugin {
  return {
    name: 'complete-release-manifest', enforce: 'post',
    generateBundle(_, bundle) {
      const assets = Object.values(bundle).map((item) => {
        const bytes = Buffer.from(item.type === 'chunk' ? item.code : item.source);
        return { url: `/${item.fileName}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
      });
      for (const file of ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest']) {
        const bytes = readFileSync(`public/${file}`);
        assets.push({ url: `/${file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
      this.emitFile({ type: 'asset', fileName: 'release-assets.json', source: JSON.stringify({
        releaseId, cubeContract: 'cube3-facelets-v1', engine: null, dataset: null, tables: null,
        scope: 'foundation-shell', initialization: [], assets,
      }) });
    },
  };
}
export default defineConfig({
  define: { __RELEASE_ID__: JSON.stringify(releaseId) },
  plugins: [react(), tailwind(), assetManifest(), VitePWA({
    strategies: 'injectManifest', srcDir: 'src/pwa', filename: 'sw.ts', injectRegister: false,
    manifest: false, injectManifest: { injectionPoint: undefined },
  })],
  build: { sourcemap: false },
});
