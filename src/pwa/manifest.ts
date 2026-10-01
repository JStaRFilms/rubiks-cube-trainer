import { ENGINE_VERSION, ENGINE_SOURCE, ENGINE_INTEGRITY, INITIALIZATION } from '../cube/version';
import { TABLE_VERSION } from '../cross/table';
export interface ReleaseManifest {
  releaseId: string; cubeContract: 'cube3-facelets-v1'; scope: 'cross-practice';
  engine: typeof ENGINE_VERSION; engineSource: typeof ENGINE_SOURCE; engineIntegrity: typeof ENGINE_INTEGRITY;
  dataset: null; tables: typeof TABLE_VERSION; initialization: string[];
  assets: { url: string; byteLength: number; sha256: string }[];
}
export function decodeManifest(value: unknown): ReleaseManifest {
  if (!value || typeof value !== 'object') throw new Error('Missing release manifest.');
  const v = value as Record<string, unknown>;
  const initialization = v.initialization;
  if (typeof v.releaseId !== 'string' || v.cubeContract !== 'cube3-facelets-v1' || v.scope !== 'cross-practice' || v.engine !== ENGINE_VERSION || v.engineSource !== ENGINE_SOURCE || v.engineIntegrity !== ENGINE_INTEGRITY || v.dataset !== null || v.tables !== TABLE_VERSION || !Array.isArray(initialization) || initialization.length !== INITIALIZATION.length || !INITIALIZATION.every((task, i) => initialization[i] === task) || !Array.isArray(v.assets) || !v.assets.length) throw new Error('Incompatible release manifest.');
  const assets = v.assets.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid asset record.');
    const asset = item as Record<string, unknown>;
    if (typeof asset.url !== 'string' || !asset.url.startsWith('/') || asset.url.startsWith('//') || typeof asset.byteLength !== 'number' || !Number.isSafeInteger(asset.byteLength) || asset.byteLength < 0 || typeof asset.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error('Invalid asset evidence.');
    return { url: asset.url, byteLength: asset.byteLength, sha256: asset.sha256 };
  });
  if (new Set(assets.map((a) => a.url)).size !== assets.length || !assets.some((a) => a.url === '/index.html')) throw new Error('Incomplete release manifest.');
  return { releaseId: v.releaseId, cubeContract: 'cube3-facelets-v1', scope: 'cross-practice', engine: ENGINE_VERSION, engineSource: ENGINE_SOURCE, engineIntegrity: ENGINE_INTEGRITY, dataset: null, tables: TABLE_VERSION, initialization: [...INITIALIZATION], assets };
}
export async function verifyAsset(response: Response, asset: ReleaseManifest['assets'][number]): Promise<boolean> {
  if (!response.ok) return false;
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return bytes.byteLength === asset.byteLength && hex === asset.sha256;
}
