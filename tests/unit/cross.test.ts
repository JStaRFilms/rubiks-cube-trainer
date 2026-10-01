import { beforeAll, expect, it } from 'vitest';
import { loadEngine, SOLVED, type CubeEngine } from '../../src/cube/engine';
import { colors, type AttemptRecord } from '../../src/store/records';
import { CrossTable, CROSS_COUNT, CROSS_VERSIONS, OUTER_MOVES, checksum, pack, TABLE_SHA256 } from '../../src/cross/table';
import { generateCross } from '../../src/cross/generate';
import { crossValidator, validateChallenge } from '../../src/cross/validation';
import { geometricPermutation, geometry } from '../helpers/cube-geometry';
import { Repository } from '../../src/store/repository';
import { initializeTable } from '../../src/cross/cache';

function must<T>(value: T | undefined): T { if (value === undefined) throw new Error('Missing independent fixture value.'); return value; }
const names = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL'];
const stickers = names.map((name) => {
  const normals = [...name].map((label) => must(geometry.find((s) => s.label === label && s.index % 9 === 4)).normal);
  const position = [0, 1, 2].map((i) => normals.reduce((sum, n) => sum + must(n[i]), 0));
  return normals.map((normal) => must(geometry.find((s) => s.position.every((v, i) => v === position[i]) && s.normal.every((v, i) => v === normal[i]))).index);
});
// Cartesian sticker permutations, not cubing or production orbit transforms.
const permutations = OUTER_MOVES.map((move) => {
  let permutation = Array.from({ length: 54 }, (_, i) => i);
  for (let turn = 0; turn < (move.amount === -1 ? 3 : move.amount); turn++) {
    const quarter = geometricPermutation(move.family); permutation = quarter.map((source) => must(permutation[source]));
  }
  return permutation;
});
function applyOuter(state: string, move: typeof OUTER_MOVES[number]): string { const index = OUTER_MOVES.findIndex((m) => m.family === move.family && m.amount === move.amount); return must(permutations[index]).map((source) => state[source]).join(''); }
const transitions = permutations.map((permutation) => {
  return Array.from({ length: 24 }, (_, digit) => {
    const sourceSticker = must(must(stickers[digit >> 1])[digit % 2]);
    const destination = permutation.indexOf(sourceSticker);
    const location = stickers.findIndex((indices) => indices.includes(destination));
    return location * 2 + must(stickers[location]).indexOf(destination);
  });
});
function digits(code: number): number[] { return [Math.floor(code / 13824), Math.floor(code / 576) % 24, Math.floor(code / 24) % 24, code % 24]; }
function referenceNext(code: number, move: number): number { return digits(code).map((digit) => must(must(transitions[move])[digit])).reduce((n, digit) => n * 24 + digit, 0); }
function referenceCoordinate(state: string): number {
  return ['DF', 'DR', 'DB', 'DL'].map((name) => {
    const location = stickers.findIndex((indices) => indices.map((i) => state[i]).sort().join('') === [...name].sort().join(''));
    return location * 2 + (state[must(must(stickers[location])[0])] === name[0] ? 0 : 1);
  }).reduce((n, digit) => n * 24 + digit, 0);
}
let engine: CubeEngine, table: CrossTable;
function productionCode(index: number): number { const offset = index * 4; return pack(must(table.digits[offset]), must(table.digits[offset + 1]), must(table.digits[offset + 2]), must(table.digits[offset + 3])); }
const reference = new Uint8Array(24 ** 4).fill(255);
beforeAll(async () => {
  engine = await loadEngine(); table = new CrossTable(engine); await table.build(() => {}, () => {});
  const goal = (((8 * 24 + 10) * 24 + 12) * 24 + 14), queue = [goal]; reference[goal] = 0;
  for (let head = 0; head < queue.length; head++) for (let move = 0; move < 18; move++) {
    const next = referenceNext(must(queue[head]), move);
    if (reference[next] === 255) { reference[next] = must(reference[must(queue[head])]) + 1; queue.push(next); }
  }
  expect(queue).toHaveLength(CROSS_COUNT);
}, 60000);
it('proves bijection, every transition, complete-table optimality and trusted checksum independently', async () => {
  const seen = new Set<number>(); let zeroes = 0;
  const distribution = Array<number>(9).fill(0);
  for (let index = 0; index < CROSS_COUNT; index++) {
    const code = productionCode(index); seen.add(code);
    expect(table.index[code]).toBe(index);
    const actual = must(table.distances[index]);
    if (actual === 0) zeroes++;
    distribution[actual] = must(distribution[actual]) + 1;
    if (actual !== reference[code]) throw new Error(`Reference mismatch at ${code}`);
    let minimum = 255;
    for (let move = 0; move < 18; move++) {
      const next = referenceNext(code, move), productionNext = table.next(index, move);
      if (productionCode(productionNext) !== next) throw new Error(`Transition mismatch ${code}/${move}`);
      if (Math.abs(actual - must(reference[next])) > 1) throw new Error('Bellman edge inequality failed');
      minimum = Math.min(minimum, must(reference[next]));
    }
    if (actual > 0 && minimum + 1 !== actual) throw new Error('Bellman descending edge failed');
  }
  expect(seen.size).toBe(CROSS_COUNT); expect(zeroes).toBe(1);
  const digest = await checksum(table.distances); console.log({ digest, distribution, workingBytes: table.byteLength });
  expect(digest).toBe(TABLE_SHA256);
  const independentBytes = Uint8Array.from({ length: CROSS_COUNT }, (_, index) => must(reference[productionCode(index)]));
  expect(await checksum(independentBytes)).toBe(TABLE_SHA256);
}, 60000);
it('generates legal full states and independent optimal reveals for every K/color, with randomized unrelated pieces', async () => {
  const cornerStates = new Set<string>();
  for (const color of colors) for (const K of [1, 2, 3, 4, 5, 6, 7, 8] as const) for (let sample = 0; sample < 3; sample++) {
    const request = { kind: 'generate', protocol: 1, requestId: `test-${color}-${K}-${sample}`, epoch: 7, workerInstance: 'test', versions: CROSS_VERSIONS, frame: engine.frame(color), options: { trainer: 'cross', K }, seed: `${color}-${K}-${sample}`, budget: { timeMs: 5000, maxNodes: 200000 } } as const;
    const challenge = await generateCross(request, engine, table, () => {});
    if (challenge.proof.kind !== 'cross-optimal') throw new Error('Wrong proof');
    const actual = challenge.scramble.reduce((s, move) => applyOuter(s, move), SOLVED.facelets);
    expect(challenge.start.facelets).toBe(actual);
    expect(must(reference[referenceCoordinate(actual)])).toBe(challenge.proof.depth);
    expect(challenge.proof.depth).toBeGreaterThanOrEqual(1); expect(challenge.proof.depth).toBeLessThanOrEqual(K);
    const revealed = challenge.proof.solution.reduce((s, move) => applyOuter(s, move), actual);
    expect(referenceCoordinate(revealed)).toBe(pack(8, 10, 12, 14)); expect(challenge.proof.solution).toHaveLength(must(reference[referenceCoordinate(actual)]));
    cornerStates.add(must(engine.fromState(challenge.start).patternData.CORNERS).pieces.join(','));
  }
  expect(cornerStates.size).toBeGreaterThan(100);
  // A non-solved full cube with a solved Cross is a sufficient physical base.
  const base = [OUTER_MOVES[0], OUTER_MOVES[1]].filter((move) => move !== undefined).reduce((state, move) => applyOuter(state, move), SOLVED.facelets);
  expect(referenceCoordinate(base)).toBe(pack(8, 10, 12, 14));
  const challenge = (await attempt()).challenge;
  const physicalTarget = challenge.scramble.reduce((state, move) => applyOuter(state, move), base);
  expect(referenceCoordinate(physicalTarget)).toBe(referenceCoordinate(challenge.start.facelets));
}, 60000);
async function attempt(): Promise<AttemptRecord> {
  const challenge = await generateCross({ kind: 'generate', protocol: 1, requestId: 'record', epoch: 0, workerInstance: 'test', versions: CROSS_VERSIONS, frame: engine.frame('white'), options: { trainer: 'cross', K: 8 }, seed: 'record', budget: { timeMs: 5000, maxNodes: 200000 } }, engine, table, () => {});
  return { id: 'actual', sessionId: 'cross-session', trainer: 'cross', challenge, settingsSnapshot: { inspectionMode: '15s', audibleWarnings: false }, presentedAt: '2026-09-30T00:00:00.000Z', endedAt: '2026-09-30T00:00:20.000Z', preparationMs: 16000, timing: { status: 'completed', executionMs: 1000, inspectionMs: 15000 }, penalty: { kind: 'none', source: 'none' } };
}
it('fails closed for altered proofs/state/metric/frame/unsupported data and preserves rounded penalty ambiguity', async () => {
  const record = await attempt(), validator = crossValidator(engine, table);
  expect(await validator.validateAttempt(record)).toEqual(record);
  const plus2 = { ...record, penalty: { kind: 'plus2', source: 'inspection' } }; await expect(validator.validateAttempt(plus2)).resolves.toMatchObject(plus2);
  for (const penalty of [{ kind: 'plus2', source: 'inspection' }, { kind: 'dnf', source: 'inspection' }] as const) await expect(validator.validateAttempt({ ...record, preparationMs: 18000, timing: { ...record.timing, inspectionMs: 17000 }, penalty })).resolves.toMatchObject({ penalty });
  await expect(validator.validateAttempt({ ...record, preparationMs: 18000, timing: { ...record.timing, inspectionMs: 17500 }, penalty: { kind: 'none', source: 'manual' } })).resolves.toMatchObject({ penalty: { kind: 'none', source: 'manual' } });
  for (const field of ['runId', 'repIndex', 'review', 'selfReport']) await expect(validator.validateAttempt({ ...record, [field]: 'unsupported' })).rejects.toThrow();
  const bad = structuredClone(record); bad.challenge.start.facelets = SOLVED.facelets; await expect(validator.validateAttempt(bad)).rejects.toThrow();
  expect(() => validateChallenge({ ...record.challenge, versions: { ...CROSS_VERSIONS, tables: 'other' } }, engine, table)).toThrow();
  await expect(validator.validateTrainingData({ personalAlgorithms: [{}], practiceSets: [], runs: [] }, [], [])).rejects.toThrow();
  await expect(validator.validateAttempt({ ...record, timing: { ...record.timing, inspectionMs: 15001 } })).rejects.toThrow();
});
it('saves/reloads/exports/restores real attempts with explicit penalty edit/delete/undo and immutable raw data', async () => {
  const record = await attempt(), validator = crossValidator(engine, table), repository = new Repository(`cross-${crypto.randomUUID()}`, undefined, validator);
  await repository.saveSession({ id: record.sessionId, trainer: 'cross', label: 'Real Cross', createdAt: record.presentedAt }); await repository.saveAttempt(record);
  const original = await repository.read(); await repository.editAttempt(record.id, 'dnf', original.revision);
  const edited = await repository.read(); expect(must(edited.backup.attempts[0]).timing).toEqual(record.timing); expect(must(edited.backup.attempts[0]).penalty.source).toBe('manual');
  const undo = await repository.deleteAttempt(record.id, edited.revision); expect((await repository.read()).backup.attempts).toHaveLength(0);
  await repository.undoAttempt(undo); const restored = await repository.read(); expect(must(restored.backup.attempts[0]).penalty.kind).toBe('dnf');
  await repository.replace(original.backup, restored.revision); await repository.close(); expect((await repository.read()).backup.attempts[0]).toEqual(record); await repository.close();
});
it('repairs missing/corrupt solver cache without touching personal data', async () => {
  const { table: rebuilt, cache } = await initializeTable(engine, () => {}, () => {}); expect(cache).toBe('rebuilt'); expect(await checksum(rebuilt.distances)).toBe(TABLE_SHA256);
  const { openSolverDatabase } = await import('../../src/store/repository'); const db = await openSolverDatabase(); const keys = await db.getAllKeys('tables'); const entry = await db.get('tables', must(keys[0])); if (!entry) throw new Error('Missing table');
  const bytes = new Uint8Array(entry.bytes); bytes[0] = must(bytes[0]) ^ 1; await db.put('tables', entry); db.close();
  await expect(initializeTable(engine, () => {}, () => {}, false)).rejects.toThrow(); expect((await initializeTable(engine, () => {}, () => {})).cache).toBe('rebuilt');
}, 60000);
