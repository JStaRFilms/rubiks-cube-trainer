import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { ENGINE_VERSION, loadEngine, SOLVED, type CubeEngine } from '../../src/cube/engine';
import { canonicalText, families, invertMoves, parseNotation } from '../../src/cube/notation';
import { CASE_DATASET_VERSION, CASE_MANIFESTS, F2L_CASES, OLL_CASES, PLL_CASES, type CaseEntry } from '../../src/data';
import sources from '../../src/data/sources.json';
import numbering from '../fixtures/case-numbering.json';
import { auf, caseIdentity, f2lSolved, isolatedContext, QUARTERS, SLOTS } from '../../src/cases/identity';
import { presentCase, validateCase, validateGuidance, validateOverride } from '../../src/cases/validation';
import { resetOverride, validateOverrideImport } from '../../src/cases/overrides';
import type { PersonalAlgorithmRecord } from '../../src/store/records';
import { geometricConjugate } from '../helpers/cube-geometry';
import { indices, llBases, llIndices, llOrientations, lowerIndices, normalize, normalizedPermutation, oracleKey, pairPlacements, permutation, replay, solved } from '../helpers/case-oracle';

let engine: CubeEngine;
const library = [...F2L_CASES, ...OLL_CASES, ...PLL_CASES];
const groups = { f2l: F2L_CASES, oll: OLL_CASES, pll: PLL_CASES };
beforeAll(async () => { engine = await loadEngine(); });
function state(facelets: string) { return { format: 'cube3-facelets-v1' as const, facelets }; }
function lowerSolved(facelets: string): boolean { return lowerIndices.every((i) => facelets[i] === solved[i]); }
function upperOriented(facelets: string): boolean { return [0, 1, 2, 3, 5, 6, 7, 8].every((i) => facelets[i] === 'U'); }
function override(entry: CaseEntry, moves = [...entry.defaultAlgorithm]): PersonalAlgorithmRecord {
  return { caseId: entry.id, slot: 'canonical', moves, preAuf: 0, updatedAt: '2026-09-30T00:00:00.000Z',
    identityPolicyVersion: entry.identityPolicyVersion, identityKey: entry.identityKey,
    validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
}
function first(entries: readonly CaseEntry[]): CaseEntry { const entry = entries[0]; if (!entry) throw Error('Missing test case.'); return entry; }

describe('sourced inventories and independent Cartesian equivalence', () => {
  it('retains exact pinned artifacts, MIT permissions and unchanged source defaults', () => {
    for (const artifact of sources.artifacts) {
      const bytes = readFileSync(`tests/fixtures/case-sources/${artifact.file}`);
      expect(bytes.length).toBe(artifact.bytes);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(artifact.sha256);
    }
    for (const prefix of ['speeden-LICENSE', 'lieberkind-LICENSE.md']) {
      const license = readFileSync(`tests/fixtures/case-sources/${prefix}.txt`, 'utf8');
      expect(license).toContain('Permission is hereby granted');
      expect(license).toContain('The above copyright notice');
      expect(readFileSync(`docs/data/licenses/${prefix.startsWith('speeden') ? 'Speeden' : 'Lieberkind'}_MIT.txt`, 'utf8')).toBe(license);
    }
    for (const trainer of ['f2l', 'oll', 'pll'] as const) {
      const raw = readFileSync(`tests/fixtures/case-sources/speeden-${trainer}.ts.txt`, 'utf8');
      const records = [...raw.matchAll(/\{ id: "([^"]+)", label: "([^"]+)", name: "[^"]+", group: "([^"]+)"[^]*?algs: \["([^"]+)"/g)];
      expect(records).toHaveLength(groups[trainer].length);
      for (const entry of groups[trainer]) {
        const record = records.find((m) => m[2] === entry.sourceLabel);
        expect(record).toBeDefined();
        expect(entry.defaultAlgorithm).toEqual(parseNotation(record?.[4] ?? ''));
        expect(entry.setup).toEqual(invertMoves(entry.defaultAlgorithm));
        expect(entry.family).toBe(record?.[3]);
      }
    }
  });
  it('maps every numbered standard F2L case 1..41 independently, excluding extended source cases', () => {
    const raw = readFileSync('tests/fixtures/case-sources/lieberkind-algs.ts.txt', 'utf8');
    const records = [...raw.matchAll(/id: (\d+),\s*scramble: `([^`]+)`/g)].filter((m) => Number(m[1]) <= 41);
    const keys = new Set<string>();
    expect(records).toHaveLength(41);
    for (const record of records) {
      const label = record[1], setup = record[2] ?? '';
      const entry = F2L_CASES.find((e) => e.label === label); if (!entry) throw Error('Missing source case.');
      const fixed = normalize(replay(solved, parseNotation(setup)));
      const locations = { FR: ['DRF', 'FR'], FL: ['DFL', 'FL'], BR: ['DBR', 'BR'], BL: ['DLB', 'BL'] };
      const slots = SLOTS.filter((slot) => locations[slot].some((name) => indices(name).some((i) => fixed[i] !== solved[i])));
      expect(slots).toHaveLength(1);
      const slot = slots[0]; if (!slot) throw Error('Missing oracle slot.');
      const yaw = { FR: 0, FL: 3, BR: 1, BL: 2 }[slot];
      const canonical = geometricConjugate(fixed, yaw), key = oracleKey('f2l', canonical);
      expect(oracleKey('f2l', entry.representative.facelets)).toBe(key);
      expect(keys.has(key)).toBe(false); keys.add(key);
      const mapping = numbering.find((m) => m.id === entry.id);
      expect(mapping?.numberingSetup).toBe(setup);
      expect(mapping?.numberingState).toBe(canonical);
      expect(mapping?.oracleKey).toBe(key);
      expect(mapping?.sourceLabel).toBe(entry.sourceLabel);
    }
    expect(keys.size).toBe(41);
  });
  it.each(['f2l', 'oll', 'pll'] as const)('proves exact %s coverage, legality, solved exclusion and quotient without production expectations', (trainer) => {
    const enumeration = trainer === 'f2l' ? pairPlacements() : trainer === 'oll' ? llOrientations() : llBases();
    expect(enumeration).toHaveLength({ f2l: 150, oll: 216, pll: 288 }[trainer]);
    const expectedKeys = new Set<string>(), actualKeys = new Set<string>(), productionKeys = new Set<string>();
    const correspondence = new Map<string, string>();
    for (const facelets of enumeration) {
      expect(engine.toState(engine.fromState(state(facelets))).facelets).toBe(facelets);
      if (trainer === 'f2l') expect(isolatedContext(engine, state(facelets), 'FR')).toBe(true);
      else expect(f2lSolved(engine, state(facelets))).toBe(true);
      const oracle = oracleKey(trainer, facelets), production = caseIdentity(engine, trainer, state(facelets));
      const previous = correspondence.get(oracle);
      if (previous !== undefined) expect(production).toBe(previous);
      correspondence.set(oracle, production); expectedKeys.add(oracle); productionKeys.add(production);
    }
    expect(expectedKeys.size).toBe({ f2l: 42, oll: 58, pll: 22 }[trainer]);
    expect(productionKeys.size).toBe(expectedKeys.size);
    expectedKeys.delete(oracleKey(trainer, solved));
    for (const entry of groups[trainer]) {
      validateCase(engine, entry);
      expect(entry.datasetVersion).toBe(CASE_DATASET_VERSION);
      actualKeys.add(oracleKey(trainer, entry.representative.facelets));
    }
    expect([...actualKeys].sort()).toEqual([...expectedKeys].sort());
    const manifest = CASE_MANIFESTS.find((m) => m.trainer === trainer);
    expect(manifest?.expectedCount).toBe({ f2l: 41, oll: 57, pll: 21 }[trainer]);
    expect(manifest?.expectedIds).toEqual(groups[trainer].map((e) => e.id));
    expect(new Set(groups[trainer].map((e) => e.identityKey)).size).toBe(groups[trainer].length);
    expect(new Set(groups[trainer].map((e) => e.id)).size).toBe(groups[trainer].length);
  }, 15000);
  it('does not merge inverse PLL labels or count AUF-solved permutations', () => {
    for (const [a, b] of [['Ua', 'Ub'], ['Aa', 'Ab'], ['Ga', 'Gb'], ['Gc', 'Gd']]) {
      expect(PLL_CASES.find((e) => e.label === a)?.identityKey).not.toBe(PLL_CASES.find((e) => e.label === b)?.identityKey);
    }
    for (const pre of QUARTERS) expect(caseIdentity(engine, 'pll', engine.apply(SOLVED, auf(pre)))).toBe(caseIdentity(engine, 'pll', SOLVED));
  });
});

describe('presentations, preserved pieces and permutation proofs', () => {
  it('proves normalized symbolic permutations for outer/wide/slice moves and regripped guidance independently', () => {
    for (const family of families) for (const amount of [1, 2, -1] as const) {
      const moves = [...parseNotation("R U2 F' M E S Rw Uw Fw x y' z"), { family, amount }];
      expect(engine.stickerPermutation(moves)).toEqual(normalizedPermutation(moves));
    }
    for (const entry of [first(F2L_CASES), first(OLL_CASES), first(PLL_CASES)]) for (const rotation of engine.orientations) {
      const moves = [...entry.defaultAlgorithm, ...rotation.moves];
      expect(validateGuidance(engine, entry, moves)).toBe(0);
    }
  });
  it('replays all 656 F2L slot/pre-U presentations with independent proper transforms', () => {
    for (const entry of F2L_CASES) for (const slot of SLOTS) for (const preAuf of QUARTERS) {
      const yaw = { FR: 0, FL: 1, BR: 3, BL: 2 }[slot];
      const result = presentCase(engine, entry, { slot, preAuf, yaw: 0 });
      const expected = replay(geometricConjugate(entry.representative.facelets, yaw), auf(preAuf));
      expect(replay(solved, result.setup)).toBe(expected);
      expect(result.start.facelets).toBe(expected);
      expect(isolatedContext(engine, result.start, slot)).toBe(true);
      expect(caseIdentity(engine, 'f2l', result.start, slot)).toBe(entry.identityKey);
      expect(lowerSolved(normalize(replay(expected, result.solution)))).toBe(true);
    }
  });
  it('solves every legal pair placement with different LL fillers, and proves guidance uses no LL stickers to solve F2L', () => {
    const cases = new Map(F2L_CASES.map((e) => [oracleKey('f2l', e.representative.facelets), e]));
    for (const facelets of pairPlacements()) {
      const key = oracleKey('f2l', facelets), entry = cases.get(key);
      if (!entry) { expect(key).toBe(oracleKey('f2l', solved)); continue; }
      const partial = (s: string) => {
        const groups = ['UFR', 'URB', 'UBL', 'ULF', 'DRF', 'UF', 'UR', 'UB', 'UL', 'FR'];
        return groups.flatMap((name) => {
          const labels = indices(name).map((i) => s[i]).join('');
          return labels.includes('U') ? [] : [`${name}:${labels}`];
        }).join('|');
      };
      const pre = QUARTERS.find((q) => partial(replay(facelets, auf(q))) === partial(entry.representative.facelets));
      expect(pre).toBeDefined(); if (pre === undefined) throw Error('No independent pre-AUF alignment.');
      expect(lowerSolved(normalize(replay(facelets, [...auf(pre), ...entry.defaultAlgorithm])))).toBe(true);
    }
    for (const entry of [...F2L_CASES, ...OLL_CASES]) {
      const p = permutation(entry.defaultAlgorithm);
      expect(engine.stickerPermutation(entry.defaultAlgorithm)).toEqual(p);
      for (const destination of lowerIndices) {
        const source = p[destination]; if (source === undefined) throw Error('Bad independent permutation.');
        const location = indicesAt(source);
        expect(location.some((i) => entry.representative.facelets[i] === 'U')).toBe(false);
        expect(entry.representative.facelets[source]).toBe(solved[destination]);
      }
    }
  });
  it('proves OLL setups and defaults for all 288 legal LL bases at every pre-U/proper-yaw angle', () => {
    const bases = llBases();
    let checked = 0;
    for (const entry of OLL_CASES) for (const yaw of QUARTERS) for (const preAuf of QUARTERS) {
      const presented = presentCase(engine, entry, { slot: 'FR', preAuf, yaw });
      const setupP = permutation(presented.setup), solutionP = permutation(presented.solution);
      const representativeMask = llIndices.map((i) => presented.start.facelets[i] === 'U');
      for (const base of bases) {
        const start = setupP.map((from) => base[from]).join('');
        if (!lowerSolved(start) || !llIndices.every((i, n) => (start[i] === 'U') === representativeMask[n])) throw Error(`OLL setup failed ${entry.id}, yaw ${yaw}, pre-U ${preAuf}, base ${base}`);
        const final = solutionP.map((from) => start[from]).join('');
        if (!lowerSolved(final) || !upperOriented(final)) throw Error(`OLL guidance failed ${entry.id}, yaw ${yaw}, pre-U ${preAuf}, base ${base}`);
        checked++;
      }
    }
    expect(checked).toBe(57 * 16 * 288);
  }, 60000);
  it('replays 336 PLL presentations from solved/aligned, including explicit final AUF', () => {
    for (const entry of PLL_CASES) for (const yaw of QUARTERS) for (const preAuf of QUARTERS) {
      const presented = presentCase(engine, entry, { slot: 'FR', preAuf, yaw });
      const expected = replay(geometricConjugate(entry.representative.facelets, yaw), auf(preAuf));
      expect(replay(solved, presented.setup)).toBe(expected);
      expect(lowerSolved(expected)).toBe(true); expect(upperOriented(expected)).toBe(true);
      expect(caseIdentity(engine, 'pll', presented.start)).toBe(entry.identityKey);
      expect(normalize(replay(expected, [...presented.solution, ...auf(presented.finalAuf)]))).toBe(solved);
    }
  });
  it('normalizes all 24 proper regrips without changing a case or the six physical-frame contracts', () => {
    for (const entry of library) for (const rotation of engine.orientations) {
      const facelets = replay(entry.representative.facelets, rotation.moves);
      expect(caseIdentity(engine, entry.trainer, state(facelets))).toBe(entry.identityKey);
      expect(normalize(facelets)).toBe(entry.representative.facelets);
    }
    for (const color of ['white', 'yellow', 'green', 'blue', 'red', 'orange'] as const) expect(new Set(Object.values(engine.frame(color).colorOfFace)).size).toBe(6);
  }, 60000);
});
function indicesAt(index: number): number[] {
  const all = ['UF', 'UR', 'UB', 'UL', 'DF', 'DR', 'DB', 'DL', 'FR', 'FL', 'BR', 'BL', 'UFR', 'URB', 'UBL', 'ULF', 'DRF', 'DFL', 'DLB', 'DBR'];
  return all.map(indices).find((piece) => piece.includes(index)) ?? [];
}

describe('intended-case guidance and pure override imports', () => {
  it('accepts every default and transformed F2L slot override without changing canonical identity/setup', () => {
    const before = JSON.stringify(library);
    expect(validateOverrideImport(engine, library, library.map((entry) => override(entry)))).toHaveLength(119);
    for (const entry of F2L_CASES) for (const slot of SLOTS) {
      const presented = presentCase(engine, entry, { slot, yaw: 0, preAuf: 0 });
      const record = { ...override(entry, presented.solution), slot };
      expect(validateOverrideImport(engine, library, [record])).toEqual([record]);
    }
    expect(JSON.stringify(library)).toBe(before);
  });
  it('accepts a correct permutation-changing OLL override on every permitted base', () => {
    const entry = first(OLL_CASES), pll = PLL_CASES.find((e) => e.label === 'T'); if (!pll) throw Error('Missing sourced T perm.');
    const moves = [...entry.defaultAlgorithm, ...pll.defaultAlgorithm], before = JSON.stringify(entry);
    expect(validateOverride(engine, entry, canonicalText(moves)).finalAuf).toBe(0);
    expect(validateOverrideImport(engine, library, [override(entry, moves)])).toHaveLength(1);
    let changed = 0;
    for (const base of llBases()) {
      const start = replay(base, entry.setup), final = replay(start, moves);
      expect(lowerSolved(final)).toBe(true); expect(upperOriented(final)).toBe(true);
      if (final !== base) changed++;
    }
    expect(changed).toBe(288); expect(JSON.stringify(entry)).toBe(before);
  });
  it('records nonzero PLL final AUF rather than claiming an aligned physical finish', () => {
    const entry = first(PLL_CASES), moves = [...entry.defaultAlgorithm, ...auf(1)];
    expect(validateGuidance(engine, entry, moves)).toBe(3);
    expect(replay(replay(entry.representative.facelets, moves), auf(3))).toBe(solved);
    expect(validateGuidance(engine, entry, [...invertMoves(auf(1)), ...entry.defaultAlgorithm], 1)).toBe(0);
  });
  it('rejects wrong cases, malformed notation, invalid import identity/version/slots and duplicate overrides without mutating old data', () => {
    const old = [override(first(F2L_CASES))], before = JSON.stringify(old);
    for (const entries of [F2L_CASES, OLL_CASES, PLL_CASES]) {
      const entry = first(entries), wrong = entries.find((e) => e.identityKey !== entry.identityKey); if (!wrong) throw Error('No wrong-case fixture.');
      expect(() => validateOverride(engine, entry, canonicalText(wrong.defaultAlgorithm))).toThrow();
      for (const malformed of ['3Rw', 'R3', '.', '(R)10001']) expect(() => validateOverride(engine, entry, malformed)).toThrow();
      expect(() => validateOverrideImport(engine, library, [override(entry, [...wrong.defaultAlgorithm])])).toThrow();
    }
    const record = old[0]; if (!record) throw Error('No old override.');
    for (const invalid of [null, [record, record], [{ ...record, identityKey: 'wrong' }], [{ ...record, validatedDatasetVersion: 'future' }], [{ ...record, validatedEngineVersion: 'future' }], [{ ...record, preAuf: 4 }], [{ ...record, slot: 'mirror' }], [{ ...record, moves: [{ family: 'R', amount: 3 }] }], [{ ...record, caseId: 'zbll:unimplemented' }], [{ ...record, extra: true }]]) {
      expect(() => validateOverrideImport(engine, library, invalid)).toThrow(); expect(JSON.stringify(old)).toBe(before);
    }
    expect(resetOverride(old, record.caseId, record.slot)).toEqual([]);
    expect(JSON.stringify(old)).toBe(before);
    expect(first(F2L_CASES).defaultAlgorithm).toEqual(record.moves);
    expect(() => validateCase(engine, { ...first(OLL_CASES), identityKey: first(PLL_CASES).identityKey })).toThrow();
    expect(() => presentCase(engine, first(OLL_CASES), { slot: 'FL', yaw: 0, preAuf: 0 })).toThrow();
    expect(() => presentCase(engine, first(F2L_CASES), { slot: 'FR', yaw: 1, preAuf: 0 })).toThrow();
  });

});
