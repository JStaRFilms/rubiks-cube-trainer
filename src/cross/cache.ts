import type { CubeEngine } from '../cube/engine';
import { ENGINE_VERSION } from '../cube/version';
import { openSolverDatabase } from '../store/repository';
import { checksum, CROSS_COUNT, CrossTable, TABLE_SHA256, TABLE_VERSION } from './table';

export async function initializeTable(engine: CubeEngine, check: () => void, progress: (completed: number) => void, repair = true): Promise<{ table: CrossTable; cache: 'verified' | 'rebuilt' | 'memory-only' }> {
  const table = new CrossTable(engine); await table.initialize(check);
  let db: Awaited<ReturnType<typeof openSolverDatabase>> | undefined;
  try {
    db = await openSolverDatabase();
    const entry = await db.get('tables', TABLE_VERSION); check();
    if (entry && entry.cacheKey === TABLE_VERSION && entry.engineVersion === ENGINE_VERSION && entry.contractVersion === 1 && entry.tableVersion === TABLE_VERSION && entry.moveMetric === 'HTM18' && entry.framePolicyVersion === 'frame-v1' && entry.byteLength === CROSS_COUNT && entry.checksum === TABLE_SHA256 && entry.bytes instanceof ArrayBuffer && entry.bytes.byteLength === CROSS_COUNT && await checksum(new Uint8Array(entry.bytes)) === TABLE_SHA256) {
      table.distances.set(new Uint8Array(entry.bytes)); check(); return { table, cache: 'verified' };
    }
  } catch (reason) { check(); if (!repair) throw reason; }
  finally { db?.close(); }
  if (!repair) throw new Error('Cross table cache missing, corrupt or incompatible. Run setup to rebuild it. Personal data is unchanged.');
  await table.build(check, progress);
  if (await checksum(table.distances) !== TABLE_SHA256) throw new Error('Cross table checksum differs from the independently proven table.');
  check();
  try {
    db = await openSolverDatabase();
    await db.put('tables', { cacheKey: TABLE_VERSION, engineVersion: ENGINE_VERSION, contractVersion: 1, tableVersion: TABLE_VERSION, moveMetric: 'HTM18', framePolicyVersion: 'frame-v1', checksum: TABLE_SHA256, byteLength: CROSS_COUNT, bytes: table.distances.slice().buffer });
    return { table, cache: 'rebuilt' };
  } catch { check(); return { table, cache: 'memory-only' }; }
  finally { db?.close(); }
}
