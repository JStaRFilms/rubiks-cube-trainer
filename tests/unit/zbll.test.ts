import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeAll, expect, it } from 'vitest';
import { ENGINE_VERSION, loadEngine, type CubeEngine } from '../../src/cube/engine';
import { auf, caseIdentity, QUARTERS } from '../../src/cases/identity';
import { initializeZBLL, presentZBLL, zbllEntry } from '../../src/cases/zbll';
import { validateLLTraining } from '../../src/ll/runs';
import { validateOverrideImport, resetOverride } from '../../src/cases/overrides';
import { validateCase, validateGuidance, validatePresentedLLGuidance } from '../../src/cases/validation';
import { invertMoves, parseNotation } from '../../src/cube/notation';
import { ZBLL_CASES, ZBLL_MANIFEST, ZBLL_NON_PLL_CASES } from '../../src/data/zbll';
import { F2L_CASES, OLL_CASES, PLL_CASES, CASE_DATASET_VERSION } from '../../src/data';
import type { CaseEntry } from '../../src/data/types';
import { colors, type PersonalAlgorithmRecord } from '../../src/store/records';
import sources from '../../src/data/zbll-sources.json';
import numbering from '../fixtures/zbll-numbering.json';
import { geometricConjugate } from '../helpers/cube-geometry';
import { lowerIndices, permutation, replay, solved } from '../helpers/case-oracle';
import { alphaStates, oracleReturnRegrip, zbllOracleKey } from '../helpers/zbll-oracle';
import { sourceNotation, zbllSourceDefaults } from '../helpers/zbll-source';

let engine: CubeEngine;
beforeAll(async () => { engine = await loadEngine(); initializeZBLL(engine); });
function personal(entry: CaseEntry, suffix = [...auf(1), { family: 'x' as const, amount: 1 as const }]): PersonalAlgorithmRecord {
  return { caseId: entry.id, slot: 'canonical', preAuf: 1, moves: [...invertMoves(auf(1)), ...entry.defaultAlgorithm, ...suffix], updatedAt: '2026-10-01T00:00:00.000Z',
    identityPolicyVersion: entry.identityPolicyVersion, identityKey: entry.identityKey, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
}
function first(): CaseEntry { const entry = ZBLL_NON_PLL_CASES[0]; if (!entry) throw Error('Missing real ZBLL entry.'); return entry; }
it('pins sources/permissions and every published family/subset/number mapping independently, retaining old PLL references', () => {
  for (const a of sources.artifacts) {
    const bytes = readFileSync(a.path); expect(bytes.length).toBe(a.bytes); expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.sha256);
  }
  for (const [name, evidence] of [['ZBTrain', 'round2-zbtrain-license.txt'], ['AlphaSheep', 'alpha-LICENSE.txt']]) {
    const bytes = readFileSync(`docs/data/zbll-source-evidence/${evidence}`);
    expect(readFileSync(`docs/data/licenses/${name}_MIT.txt`)).toEqual(bytes);
    expect(readFileSync(`public/licenses/cases-${name}-MIT.txt`)).toEqual(bytes);
  }
  expect(readFileSync('public/licenses/cases-ZBLL-NOTICES.txt', 'utf8')).toContain('publisher-reported provenance');
  const references = new Map(alphaStates().map((record) => [record.label, record]));
  const defaults = zbllSourceDefaults();
  expect(ZBLL_CASES.map((entry) => entry.id)).toEqual(ZBLL_MANIFEST.expectedIds);
  expect(ZBLL_MANIFEST.membership).toHaveLength(493);
  expect(Object.keys(ZBLL_MANIFEST.subsetMapping)).toHaveLength(40);
  expect(ZBLL_MANIFEST.identityPolicies).toEqual({ nonPLL: 'zbll-ll-pre-u-yaw-v1', PLL: 'pll-ll-pre-u-yaw-v1' });
  expect(new Set(ZBLL_CASES.map((entry) => zbllOracleKey(entry.representative.facelets))).size).toBe(493);
  for (const entry of ZBLL_NON_PLL_CASES) {
    const source = defaults.find((record) => `${record.family}/${record.subset}/${record.label}` === entry.sourceLabel);
    const mapping = numbering.find((record) => record.caseId === entry.id), member = ZBLL_MANIFEST.membership.find((m) => m.caseId === entry.id);
    if (!source || !mapping || !member) throw Error(`Missing exact source mapping ${entry.id}`);
    const reference = references.get(mapping.referenceLabel); if (!reference) throw Error('Unknown published reference label.');
    expect(mapping.referenceState).toBe(reference.state);
    expect(zbllOracleKey(entry.representative.facelets)).toBe(zbllOracleKey(reference.state));
    expect(reference.family).toBe(member.family);
    expect(member.referenceLabel).toBe(mapping.referenceLabel);
    expect(mapping.sourceAlgorithm).toBe(source.algorithm);
    const authored = parseNotation(sourceNotation(source));
    expect(permutation(entry.defaultAlgorithm)).toEqual(permutation([...authored, ...oracleReturnRegrip(authored)]));
    expect(entry.setup).toEqual(invertMoves(entry.defaultAlgorithm));
    expect(entry.identityKey).toBe(caseIdentity(engine, 'zbll', entry.representative));
    expect(entry.datasetVersion).toBe('zbll-library-v1'); validateCase(engine, entry);
  }
  for (const entry of PLL_CASES) expect(ZBLL_CASES.find((record) => record.id === entry.id)).toBe(entry);
  expect([F2L_CASES.length, OLL_CASES.length, PLL_CASES.length]).toEqual([41, 57, 21]); expect(CASE_DATASET_VERSION).toBe('cfop-libraries-v1');
  expect(ZBLL_MANIFEST.membership.filter((m) => m.family === 'PLL')).toHaveLength(21);
  for (const entry of ZBLL_CASES) for (const alias of entry.aliases) expect(zbllEntry(alias).id).toBe(entry.id);
  for (const [alias, id] of Object.entries(ZBLL_MANIFEST.aliases)) expect(zbllEntry(alias).id).toBe(id);
  expect(() => zbllEntry('zbll:unknown')).toThrow();
}, 30000);
it('independently proves all 47328 actual default case/angle/six-frame presentations and exactly aligned completion', () => {
  const keys = new Map(ZBLL_CASES.map((entry) => [entry.id, zbllOracleKey(entry.representative.facelets)])); let checked = 0;
  const expectedFront = { white: 'green', yellow: 'green', green: 'yellow', blue: 'yellow', red: 'green', orange: 'green' };
  for (const entry of ZBLL_CASES) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) {
    const expected = replay(geometricConjugate(entry.representative.facelets, yaw), auf(preAuf));
    for (const color of colors) {
      const p = presentZBLL(engine, entry.id, { preAuf, yaw, frame: engine.frame(color) });
      const start = replay(solved, p.setup), final = replay(start, [...p.solution, ...auf(p.finalAuf)]);
      if (p.collectionVersion !== 'zbll-library-v1' || p.datasetVersion !== entry.datasetVersion || p.identityPolicyVersion !== entry.identityPolicyVersion) throw Error('Collection/canonical version mismatch.');
      if (start !== expected || p.start.facelets !== start || zbllOracleKey(start) !== keys.get(entry.id) || !lowerIndices.every((i) => start[i] === solved[i]) || ![1, 3, 5, 7].every((i) => start[i] === 'U') || final !== solved || p.frame.colorOfFace.D !== color || p.frame.colorOfFace.F !== expectedFront[color]) throw Error(`Default failed ${entry.id}/${preAuf}/${yaw}/${color}`);
      checked++;
    }
  }
  expect(checked).toBe(493 * 16 * 6);
}, 180000);
it('validates every same-case override, rejects every wrong-case override and preserves canonical data through reset', () => {
  const before = JSON.stringify(ZBLL_CASES), overrides = ZBLL_CASES.map((entry) => personal(entry));
  expect(validateOverrideImport(engine, ZBLL_CASES, overrides)).toEqual(overrides);
  let checked = 0;
  for (const [index, entry] of ZBLL_CASES.entries()) {
    const next = ZBLL_CASES[(index + 1) % ZBLL_CASES.length]; if (!next) throw Error('Missing wrong-case fixture.');
    expect(() => validateGuidance(engine, entry, next.defaultAlgorithm)).toThrow();
    const wrong = { ...personal(entry), moves: [...invertMoves(auf(1)), ...next.defaultAlgorithm] };
    expect(() => validateOverrideImport(engine, ZBLL_CASES, [wrong])).toThrow();
    for (const preAuf of QUARTERS) for (const yaw of QUARTERS) {
      const canonical = presentZBLL(engine, entry.id, { preAuf, yaw, frame: engine.frame('white') });
      for (const color of colors) {
        const p = presentZBLL(engine, entry.id, { preAuf, yaw, frame: engine.frame(color) }, [personal(entry)]);
        if (JSON.stringify(p.setup) !== JSON.stringify(canonical.setup) || p.start.facelets !== canonical.start.facelets || replay(p.start.facelets, [...p.solution, ...auf(p.finalAuf)]) !== solved || p.finalAuf !== 3) throw Error(`Personal guidance failed ${entry.id}/${preAuf}/${yaw}/${color}`);
        checked++;
      }
    }
  }
  expect(checked).toBe(493 * 16 * 6);
  expect(JSON.stringify(ZBLL_CASES)).toBe(before);
  const reset = resetOverride(overrides, first().id, 'canonical'); expect(reset).toHaveLength(492); expect(overrides).toHaveLength(493);
  const result = presentZBLL(engine, first().id, { preAuf: 0, yaw: 0, frame: engine.frame('white') });
  if (result.setup[0]) result.setup[0].family = 'U';
  if (result.solution[0]) result.solution[0].family = 'U';
  expect(JSON.stringify(ZBLL_CASES)).toBe(before);
}, 180000);
it('physically returns every proper ending regrip before final AUF, at all angles/six frames for ZBLL and shared PLL', () => {
  let checked = 0;
  const pll = PLL_CASES[0]; if (!pll) throw Error('Missing accepted PLL.');
  for (const entry of [first(), pll]) for (const rotation of engine.orientations) for (const preAuf of QUARTERS) for (const yaw of QUARTERS) for (const color of colors) {
    const p = presentZBLL(engine, entry.id, { preAuf, yaw, frame: engine.frame(color) }, [personal(entry, [...auf(1), ...rotation.moves])]);
    const beforeAuf = replay(p.start.facelets, p.solution);
    if ([4, 13, 22, 31, 40, 49].map((i) => beforeAuf[i]).join('') !== 'URFDLB' || p.finalAuf !== 3 || replay(beforeAuf, auf(p.finalAuf)) !== solved) throw Error(`Physical return failed ${entry.id}/${preAuf}/${yaw}/${color}`);
    checked++;
  }
  expect(checked).toBe(2 * 24 * 16 * 6);
}, 60000);
it('preserves all identities under every proper ending center regrip', () => {
  let checked = 0;
  for (const entry of ZBLL_CASES) for (const rotation of engine.orientations) {
    const facelets = replay(entry.representative.facelets, rotation.moves);
    expect(caseIdentity(engine, entry.trainer, { format: 'cube3-facelets-v1', facelets })).toBe(entry.identityKey);
    expect(zbllOracleKey(facelets)).toBe(entry.identityKey.slice(entry.identityPolicyVersion.length + 1));
    checked++;
  }
  expect(checked).toBe(493 * 24);
}, 60000);
it('rejects malformed imports/fields/versions/alias-keyed PLL duplicates and wrong physical goals without mutating input', () => {
  const record = personal(first()), old = [record], before = JSON.stringify(old), pll = PLL_CASES[0]; if (!pll) throw Error('Missing shared PLL.');
  expect(validateOverrideImport(engine, ZBLL_CASES, [record])).toEqual([record]);
  expect(() => validateLLTraining(engine, { personalAlgorithms: [record], practiceSets: [], runs: [] }, [], [])).toThrow();
  for (const invalid of [[record, record], [{ ...record, caseId: 'unknown' }], [{ ...record, identityKey: 'wrong' }], [{ ...record, identityPolicyVersion: 'future' }], [{ ...record, validatedDatasetVersion: 'future' }], [{ ...record, validatedEngineVersion: 'future' }], [{ ...record, preAuf: 4 }], [{ ...record, slot: 'FR' }], [{ ...record, extra: true }], [{ ...record, moves: [{ family: 'R', amount: 3 }] }], [{ ...record, moves: [{ family: 'R', amount: 1, extra: true }] }], [{ ...personal(pll), caseId: `zbll:pll:${pll.label.toLowerCase()}` }]]) {
    expect(() => validateOverrideImport(engine, ZBLL_CASES, invalid)).toThrow(); expect(JSON.stringify(old)).toBe(before);
  }
  expect(() => parseNotation('R3')).toThrow();
  const p = presentZBLL(engine, first().id, { preAuf: 0, yaw: 0, frame: engine.frame('white') });
  expect(() => validatePresentedLLGuidance(engine, 'zbll', p.start, [...p.solution, { family: 'x', amount: 1 }])).toThrow();
  expect(() => validatePresentedLLGuidance(engine, 'zbll', p.start, [...p.solution, ...pll.defaultAlgorithm])).toThrow();
});
