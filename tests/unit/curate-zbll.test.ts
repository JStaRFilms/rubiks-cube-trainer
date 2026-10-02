import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadEngine, SOLVED } from '../../src/cube/engine';
import { invertMoves, parseNotation } from '../../src/cube/notation';
import { caseIdentity, IDENTITY_POLICIES } from '../../src/cases/identity';
import { validateCase } from '../../src/cases/validation';
import type { CaseEntry } from '../../src/data/types';
import { PLL_CASES } from '../../src/data/pll';
import { alphaStates, zbllOracleKey, zbllUniverse } from '../helpers/zbll-oracle';
import { sourceNotation, zbllSourceDefaults } from '../helpers/zbll-source';

// Explicit, hermetic generation. Never imports storage or writes old curation paths.
it.skipIf(process.env.CURATE_ZBLL !== '1')('curates only after complete independent state/source mapping', async () => {
  const engine = await loadEngine(), source = zbllSourceDefaults(), numbered = alphaStates();
  const expected = new Set(zbllUniverse().map(zbllOracleKey));
  expect(expected.size).toBe(494); expected.delete(zbllOracleKey(SOLVED.facelets));
  expect(expected.size).toBe(493);
  const references = new Map(numbered.map((entry) => [zbllOracleKey(entry.state), entry]));
  expect(references.size).toBe(493);
  expect([...references.keys()].sort()).toEqual([...expected].sort());
  const hashes = {
    'docs/data/licenses/ZBTrain_MIT.txt': '0be1970364793143492241502a6b1c2403ec9f140080117c41dbef7663814b8a',
    'docs/data/licenses/AlphaSheep_MIT.txt': 'd06848139d759d73cfa894f768807d160be341079d562ab5cf95f711641c6b30',
  };
  for (const [path, hash] of Object.entries(hashes)) expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(hash);
  const entries: CaseEntry[] = [], membership: { caseId: string; family: string; subset: string; sourceLabel: string; referenceLabel: string }[] = [];
  const mapping: { caseId: string; sourceLabel: string; sourceLine: number; sourceAlgorithm: string; notationNormalization: string | null; returnRegrip: string; referenceLabel: string; referenceState: string; oracleKey: string }[] = [];
  const seen = new Set<string>(), subsetMapping = new Map<string, Set<string>>();
  for (const record of source) {
    const family = record.family === 'Sune' ? 'S' : record.family === 'Antisune' ? 'AS' : record.family;
    const sourceLabel = `${record.family}/${record.subset}/${record.label}`, authored = parseNotation(sourceNotation(record));
    const ending = engine.centerKey(engine.apply(SOLVED, authored)), rotation = engine.orientations.find((r) => r.centers === ending);
    if (!rotation) throw Error(`No proper ending frame ${sourceLabel}`);
    const returned = invertMoves(rotation.moves), defaultAlgorithm = [...authored, ...returned], setup = invertMoves(defaultAlgorithm), representative = engine.apply(SOLVED, setup);
    const key = zbllOracleKey(representative.facelets), reference = references.get(key);
    if (!reference || reference.family !== family || seen.has(key)) throw Error(`Wrong or duplicate source case ${sourceLabel}`);
    seen.add(key);
    const id = `zbll:zbtrain-v1:${family.toLowerCase()}:${record.subset.toLowerCase()}:${record.label.toLowerCase()}`;
    const entry: CaseEntry = { id, trainer: 'zbll', label: sourceLabel, aliases: [`zbtrain:${sourceLabel}`, `alphasheep:${reference.label}`], family,
      source: 'zbtrain-mit-bd5b605', sourceLabel, datasetVersion: 'zbll-library-v1', identityPolicyVersion: IDENTITY_POLICIES.zbll,
      identityKey: caseIdentity(engine, 'zbll', representative), representative, setup, defaultAlgorithm, finalAuf: 0, angleRule: 'four-pre-u-four-proper-yaws' };
    validateCase(engine, entry); entries.push(entry);
    membership.push({ caseId: id, family, subset: record.subset, sourceLabel, referenceLabel: reference.label });
    mapping.push({ caseId: id, sourceLabel, sourceLine: record.sourceLine, sourceAlgorithm: record.algorithm,
      notationNormalization: sourceNotation(record) === record.algorithm ? null : "R3 = R'", returnRegrip: returned.map((m) => `${m.family}${m.amount === -1 ? "'" : m.amount === 2 ? '2' : ''}`).join(' '), referenceLabel: reference.label, referenceState: reference.state, oracleKey: key });
    const group = `${family}/${record.subset}`, subsets = subsetMapping.get(group) ?? new Set<string>(); subsets.add(reference.subset); subsetMapping.set(group, subsets);
  }
  expect(entries).toHaveLength(472);
  expect(subsetMapping.size).toBe(40);
  for (const [group, subsets] of subsetMapping) expect(subsets.size, `Published COLL subset mapping ${group}`).toBe(1);
  for (const entry of PLL_CASES) {
    const key = zbllOracleKey(entry.representative.facelets), reference = references.get(key);
    if (!reference || reference.family !== 'PLL' || seen.has(key)) throw Error(`PLL membership mismatch ${entry.id}`);
    seen.add(key); membership.push({ caseId: entry.id, family: 'PLL', subset: reference.subset, sourceLabel: entry.sourceLabel, referenceLabel: reference.label });
  }
  expect([...seen].sort()).toEqual([...expected].sort());
  const aliases = Object.fromEntries(PLL_CASES.map((entry) => [`zbll:pll:${entry.label.toLowerCase()}`, entry.id]));
  const manifest = { trainer: 'zbll', datasetVersion: 'zbll-library-v1', identityPolicies: { nonPLL: IDENTITY_POLICIES.zbll, PLL: IDENTITY_POLICIES.pll },
    expectedCount: 493, expectedIds: membership.map((m) => m.caseId), solvedExcluded: true, numberingSource: 'zbtrain-mit-bd5b605+alphasheep-mit-9cddec7+speeden-mit-3aaf127',
    families: { T: 72, U: 72, L: 72, Pi: 72, S: 72, AS: 72, H: 40, PLL: 21 },
    subsetMapping: Object.fromEntries([...subsetMapping].map(([group, subsets]) => [group, [...subsets][0]])), aliases, membership };
  writeFileSync('src/data/zbll-cases.ts', `// Pinned MIT move-string data. See docs/data/Case_Sources.md.\nimport type { CaseEntry } from './types';\nexport const ZBLL_NON_PLL_CASES: readonly CaseEntry[] = ${JSON.stringify(entries, null, 2)};\n`);
  writeFileSync('src/data/zbll-manifest.ts', `// Membership reuses existing PLL entries and override keys unchanged.\nexport const ZBLL_MANIFEST = ${JSON.stringify(manifest, null, 2)} as const;\n`);
  writeFileSync('tests/fixtures/zbll-numbering.json', JSON.stringify(mapping, null, 2) + '\n');
}, 60000);
