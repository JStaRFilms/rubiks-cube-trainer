import { afterEach, expect, it } from 'vitest';
import { activityStore, enterActivity, lockUpdate, releaseUpdate, type Activity } from '../../src/pwa/activity';
import { decodeManifest, verifyAsset } from '../../src/pwa/manifest';
import { ONE_VERSIONS } from '../../src/cross-one/model';
import { ENGINE_VERSION, ENGINE_SOURCE, ENGINE_INTEGRITY, INITIALIZATION } from '../../src/cube/version';
afterEach(() => activityStore.setState({ phase: 'idle', updateToken: null }));
it.each<Activity>(['preparation', 'inspection', 'arming', 'execution', 'save-pending', 'save-failed', 'editing'])('blocks update activation during %s', (phase) => {
  expect(enterActivity(phase)).toBe(true); expect(lockUpdate('update')).toBe(false); expect(activityStore.getState().updateToken).toBeNull();
});
it('guards a deferred attempt start after update confirmation', async () => {
  const deferredStart = Promise.resolve().then(() => enterActivity('preparation'));
  expect(lockUpdate('update')).toBe(true); expect(await deferredStart).toBe(false);
  expect(activityStore.getState().phase).toBe('idle'); releaseUpdate('other-token'); expect(enterActivity('execution')).toBe(false);
  releaseUpdate('update'); expect(enterActivity('preparation')).toBe(true);
});
it('does not let a second activation replace the first token', () => { expect(lockUpdate('first')).toBe(true); expect(lockUpdate('second')).toBe(false); });
it('validates the pinned review manifest and required initialization without weakening evidence', () => {
  const value = { releaseId: 'test', cubeContract: 'cube3-facelets-v1', scope: 'cross-cross1-practice', engine: ENGINE_VERSION, engineSource: ENGINE_SOURCE, engineIntegrity: ENGINE_INTEGRITY, dataset: null, tables: ONE_VERSIONS.tables, initialization: [...INITIALIZATION], assets: [{ url: '/index.html', byteLength: 1, sha256: 'a'.repeat(64) }] };
  expect(decodeManifest(value).assets).toHaveLength(1); expect(() => decodeManifest({ ...value, assets: [] })).toThrow(); expect(() => decodeManifest({ ...value, engine: 'not-integrated' })).toThrow();
  expect(() => decodeManifest({ ...value, initialization: [] })).toThrow();
  expect(() => decodeManifest({ ...value, engineSource: 'wrong-revision' })).toThrow();
  expect(() => decodeManifest({ ...value, engineIntegrity: 'wrong-integrity' })).toThrow();
});
it('checks cache bytes instead of network connectivity or response status alone', async () => {
  const bytes = new TextEncoder().encode('shell'), digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  const asset = { url: '/index.html', byteLength: bytes.length, sha256 };
  expect(await verifyAsset(new Response(bytes), asset)).toBe(true); expect(await verifyAsset(new Response('corrupt'), asset)).toBe(false);
});
