import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { build } from 'vite';
const manifest = JSON.parse(await readFile('dist/release-assets.json', 'utf8'));
const result = await build({ configFile: false, logLevel: 'silent', worker: { format: 'es' }, define: { __RELEASE_ID__: JSON.stringify(manifest.releaseId), 'process.env.NODE_ENV': JSON.stringify('production') }, build: { write: false, minify: false, lib: { entry: { contract: 'tests/helpers/contract.ts', timer: 'tests/helpers/timer-browser.tsx' }, formats: ['es'], fileName: (_format, name) => `${name}.js`, cssFileName: 'timer-fixture' } } });
const output = Array.isArray(result) ? result[0]?.output : 'output' in result ? result.output : [];
const script = output?.find((item) => item.type === 'chunk' && item.fileName === 'contract.js')?.code;
const fixtureAssets = new Map(output?.map((item) => [`/${item.fileName}`, item.type === 'chunk' ? item.code : item.source]));
if (!script) throw new Error('Browser contract fixture did not build.');
const root = resolve('dist');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
createServer(async (request, response) => {
  try {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (path === '/timer.html') { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/timer-fixture.css"></head><body><div id="root"></div><script type="module" src="/timer.js"></script></body></html>'); return; }
    if (path === '/contract.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(script); return; }
    const fixture = fixtureAssets.get(path);
    if (fixture !== undefined) { response.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'text/javascript'); response.end(fixture); return; }
    let file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
    if (!file.startsWith(`${root}${sep}`)) { response.writeHead(403); response.end(); return; }
    let bytes;
    try { bytes = await readFile(file); } catch { file = resolve(root, 'index.html'); bytes = await readFile(file); }
    const extension = file.slice(file.lastIndexOf('.'));
    response.setHeader('Content-Type', types[extension] ?? 'application/octet-stream'); response.setHeader('Cache-Control', 'no-store'); response.end(bytes);
  } catch { response.writeHead(500); response.end('Fixture request failed'); }
}).listen(4174, '127.0.0.1');
