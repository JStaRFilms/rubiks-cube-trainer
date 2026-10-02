import { expect, it } from 'vitest';
import { decodeManifest } from '../../src/pwa/manifest';
import { isScopedPath, isScopedUrl, normalizeBasePath, releaseCacheName } from '../../src/pwa/scope';
import { ENGINE_VERSION, ENGINE_SOURCE, ENGINE_INTEGRITY, INITIALIZATION } from '../../src/cube/version';
import { ONE_VERSIONS } from '../../src/cross-one/model';
const base = '/rubiks-cube-trainer/';
function manifest(url = `${base}index.html`) {
  return { releaseId: 'test', cubeContract: 'cube3-facelets-v1', scope: 'cross-cross1-f2l-oll-pll-practice', engine: ENGINE_VERSION, engineSource: ENGINE_SOURCE, engineIntegrity: ENGINE_INTEGRITY, dataset: 'cfop-libraries-v1', tables: ONE_VERSIONS.tables, initialization: [...INITIALIZATION], assets: [{ url, byteLength: 1, sha256: 'a'.repeat(64) }] };
}
it('keeps root default paths and normalizes a configured repository path', () => {
  expect(normalizeBasePath('/')).toBe('/'); expect(normalizeBasePath('/rubiks-cube-trainer')).toBe(base);
  expect(decodeManifest(manifest('/index.html')).assets[0]?.url).toBe('/index.html');
  expect(decodeManifest(manifest(), base).assets[0]?.url).toBe(`${base}index.html`);
  expect(isScopedPath(`${base}assets/player-abc.js`, base)).toBe(true);
});
it.each(['//evil/', 'https://evil/', '../repo/', '/repo/../', '/repo//', '/repo/%2e/', '/repo?x/', '/repo\\escape/', '/repo#x/'])('rejects unsafe build base %s', (path) => {
  expect(() => normalizeBasePath(path)).toThrow();
});
it.each(['/index.html', '/rubiks-cube-trainer-other/index.html', '//evil/index.html', 'https://evil/index.html', `${base}../index.html`, `${base}assets/../../index.html`, `${base}%2e%2e/index.html`, `${base}assets/%2Fescape.js`, `${base}assets/%5cescape.js`, `${base}assets/./escape.js`, `${base}assets//escape.js`, `${base}assets/a.js?x`, `${base}assets/a.js#x`, `${base}assets/\\escape.js`, `${base}assets/\u0000escape.js`])('rejects out-of-scope or ambiguous manifest path %s', (url) => {
  expect(() => decodeManifest({ ...manifest(), assets: [...manifest().assets, { url, byteLength: 1, sha256: 'a'.repeat(64) }] }, base)).toThrow();
});
it('requires the scoped index, unique paths and unchanged SHA/length evidence', () => {
  expect(() => decodeManifest(manifest(`${base}icon.svg`), base)).toThrow('Incomplete');
  expect(() => decodeManifest({ ...manifest(), assets: [...manifest().assets, ...manifest().assets] }, base)).toThrow('Incomplete');
  for (const evidence of [{ sha256: 'bad' }, { byteLength: -1 }, { byteLength: 1.5 }]) expect(() => decodeManifest({ ...manifest(), assets: [{ ...manifest().assets[0], ...evidence }] }, base)).toThrow('evidence');
});
it('isolates same-release cache ownership by scope and bounds same-origin requests/clients', () => {
  const scope = new URL(`https://example.test${base}`);
  expect(releaseCacheName(base, 'test')).not.toBe(releaseCacheName('/', 'test'));
  expect(releaseCacheName(base, 'test')).not.toBe(releaseCacheName('/other-app/', 'test'));
  for (const path of [base, `${base}index.html`, `${base}offline-route`, `${base}assets/a.js?cache=1`]) expect(isScopedUrl(new URL(path, scope), scope)).toBe(true);
  for (const path of ['/other-app/', '/rubiks-cube-trainer', '/rubiks-cube-trainer-other/', `${base}../escape`, `${base}%2e%2e/escape`, `${base}a%2fb`, `https://elsewhere.test${base}`]) expect(isScopedUrl(new URL(path, scope), scope)).toBe(false);
});
