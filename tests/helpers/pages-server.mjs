import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
const base = '/rubiks-cube-trainer/', root = resolve('dist');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
createServer(async (request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  response.setHeader('Cache-Control', 'no-store');
  if (path === '/outside.txt') { response.end('outside application scope'); return; }
  if (path === '/other-app/') { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><title>Other application</title><p>Other application</p>'); return; }
  if (path === base.slice(0, -1)) { response.writeHead(301, { Location: base }); response.end(); return; }
  if (!path.startsWith(base) || /[%\\]/.test(path)) { response.writeHead(404); response.end('Not found'); return; }
  const file = resolve(root, path === base ? 'index.html' : path.slice(base.length));
  if (!file.startsWith(`${root}${sep}`)) { response.writeHead(403); response.end(); return; }
  try {
    const bytes = await readFile(file);
    response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream'); response.end(bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(4175, '127.0.0.1');
