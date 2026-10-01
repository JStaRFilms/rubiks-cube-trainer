import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { it, expect } from 'vitest';
import { loadEngine, SOLVED } from '../../src/cube/engine';
import { invertMoves, parseNotation } from '../../src/cube/notation';
import { caseIdentity, IDENTITY_POLICIES, SLOTS } from '../../src/cases/identity';
import { validateCase } from '../../src/cases/validation';
import type { CaseEntry, CoverageManifest } from '../../src/data/types';
import { oracleKey, pairPlacements } from '../helpers/case-oracle';

const datasetVersion = 'cfop-libraries-v1';
// This tool writes only library/fixture artifacts when explicitly requested.
// It never imports the repository or opens personal storage.
it.skipIf(process.env.CURATE_CASE_LIBRARIES !== '1')('curates pinned MIT artifacts after independent inventory mapping', async () => {
  const engine = await loadEngine();
  const read = (file: string) => readFileSync(`tests/fixtures/case-sources/${file}`, 'utf8');
  const pinnedHashes = {
    'speeden-LICENSE.txt': 'd914d96c915513f9e6b33d8d77de314730286a264bf1de55ba057d12c37b13ff',
    'speeden-f2l.ts.txt': 'aa6ba2d806acc4b8d0f43b5c1b94eaf42703080afd200663fd7824317af69863',
    'speeden-oll.ts.txt': '751e5c803655b7858f2d90093123aed9688aa7e770484655a121e87f74c4fdac',
    'speeden-pll.ts.txt': '386e41d9d913da5718980c7edfac0cd722db6c4ea77fa375b27e941c6c8a6376',
    'lieberkind-LICENSE.md.txt': '91a5d1c8d45907d3f7037573ef3a69cd4d6d6445248e4086c79f50ba91ba7890',
    'lieberkind-algs.ts.txt': '4c3165dd8127377ad2e914c869b4def8e41b6ef24e6e46834187e554a0d82625',
  };
  for (const [file, hash] of Object.entries(pinnedHashes)) {
    expect(createHash('sha256').update(readFileSync(`tests/fixtures/case-sources/${file}`)).digest('hex'), `Pinned rights/source artifact ${file}`).toBe(hash);
  }
  const numbered = [...read('lieberkind-algs.ts.txt').matchAll(/id: (\d+),\s*scramble: `([^`]+)`/g)].filter((m) => Number(m[1]) <= 41);
  expect(numbered).toHaveLength(41);
  const numbering = new Map<string, { label: string; setup: string; slot: string; state: string }>();
  for (const m of numbered) {
    const label = m[1] ?? '', setup = m[2] ?? '';
    const state = engine.normalize(engine.apply(SOLVED, parseNotation(setup)));
    const unsolved = SLOTS.filter((slot) => !engine.pairSolved(state, slot));
    expect(engine.crossSolved(state), `source F2L ${label} Cross`).toBe(true);
    expect(unsolved, `source F2L ${label} isolated slot`).toHaveLength(1);
    const slot = unsolved[0]; if (!slot) throw Error('Missing source target slot.');
    const canonical = engine.slot(state, slot, true), key = oracleKey('f2l', canonical.facelets);
    expect(numbering.has(key), `duplicate source F2L ${label}`).toBe(false);
    numbering.set(key, { label, setup, slot, state: canonical.facelets });
  }
  const all = new Set(pairPlacements().map((s) => oracleKey('f2l', s)));
  all.delete(oracleKey('f2l', SOLVED.facelets));
  expect(all.size).toBe(41);
  expect([...numbering.keys()].sort()).toEqual([...all].sort());
  const entries: Record<'f2l' | 'oll' | 'pll', CaseEntry[]> = { f2l: [], oll: [], pll: [] };
  const mappings: { trainer: string; id: string; sourceLabel: string; numberingLabel: string; oracleKey: string; numberingSetup?: string; numberingSlot?: string; numberingState?: string }[] = [];
  for (const trainer of ['f2l', 'oll', 'pll'] as const) {
    const raw = read(`speeden-${trainer}.ts.txt`);
    const records = [...raw.matchAll(/\{ id: "([^"]+)", label: "([^"]+)", name: "[^"]+", group: "([^"]+)"[^]*?algs: \["([^"]+)"/g)];
    expect(records).toHaveLength({ f2l: 41, oll: 57, pll: 21 }[trainer]);
    for (const m of records) {
      const sourceLabel = m[2] ?? '', defaultAlgorithm = parseNotation(m[4] ?? ''), setup = invertMoves(defaultAlgorithm);
      const representative = engine.apply(SOLVED, setup), key = oracleKey(trainer, representative.facelets);
      const number = trainer === 'f2l' ? numbering.get(key) : undefined;
      if (trainer === 'f2l' && !number) throw Error(`Generated F2L ${sourceLabel} has no standard inventory mapping.`);
      const label = number?.label ?? sourceLabel;
      const id = trainer === 'f2l' ? `f2l:lieberkind-v1:${label.padStart(3, '0')}` : `${trainer}:speeden-v1:${label.toLowerCase().padStart(3, '0')}`;
      const entry: CaseEntry = {
        id, trainer, label, aliases: [`speeden:${sourceLabel}`, ...(number ? [`lieberkind:${label}`] : [])],
        family: m[3] ?? '', source: 'speeden-mit-3aaf127', sourceLabel,
        datasetVersion, identityPolicyVersion: IDENTITY_POLICIES[trainer], identityKey: caseIdentity(engine, trainer, representative),
        representative, setup, defaultAlgorithm, finalAuf: 0,
        angleRule: trainer === 'f2l' ? 'four-pre-u-four-slots' : 'four-pre-u-four-proper-yaws',
      };
      validateCase(engine, entry);
      entries[trainer].push(entry);
      mappings.push({ trainer, id, sourceLabel, numberingLabel: label, oracleKey: key,
        ...(number ? { numberingSetup: number.setup, numberingSlot: number.slot, numberingState: number.state } : {}) });
    }
    expect(new Set(entries[trainer].map((e) => e.identityKey)).size).toBe(entries[trainer].length);
    entries[trainer].sort((a, b) => trainer === 'pll' ? a.label.localeCompare(b.label) : Number(a.label) - Number(b.label));
  }
  const manifest: CoverageManifest[] = (['f2l', 'oll', 'pll'] as const).map((trainer) => ({ trainer, datasetVersion,
    identityPolicyVersion: IDENTITY_POLICIES[trainer], expectedCount: entries[trainer].length,
    expectedIds: entries[trainer].map((e) => e.id), solvedExcluded: true,
    numberingSource: trainer === 'f2l' ? 'lieberkind-mit-76fcfcc:1..41' : 'speeden-mit-3aaf127',
  }));
  for (const trainer of ['f2l', 'oll', 'pll'] as const) writeFileSync(`src/data/${trainer}.ts`, `// Derived from pinned MIT artifacts. See docs/data/Case_Sources.md.\nimport type { CaseEntry } from './types';\nexport const ${trainer.toUpperCase()}_CASES: readonly CaseEntry[] = ${JSON.stringify(entries[trainer], null, 2)};\n`);
  writeFileSync('src/data/manifests.ts', `import type { CoverageManifest } from './types';\nexport const CASE_MANIFESTS: readonly CoverageManifest[] = ${JSON.stringify(manifest, null, 2)};\n`);
  writeFileSync('tests/fixtures/case-numbering.json', JSON.stringify(mappings, null, 2) + '\n');
  const artifacts = ['speeden-LICENSE.txt', 'speeden-f2l.ts.txt', 'speeden-oll.ts.txt', 'speeden-pll.ts.txt', 'lieberkind-LICENSE.md.txt', 'lieberkind-algs.ts.txt'].map((file) => {
    const bytes = readFileSync(`tests/fixtures/case-sources/${file}`);
    const speeden = file.startsWith('speeden-');
    const sourceId = speeden ? 'speeden-mit-3aaf127' : 'lieberkind-mit-76fcfcc';
    const path = speeden ? file === 'speeden-LICENSE.txt' ? 'LICENSE' : `src/data/${file.slice('speeden-'.length, -4)}` : file === 'lieberkind-LICENSE.md.txt' ? 'LICENSE.md' : 'src/algs.ts';
    const repository = speeden ? 'Blaxzter/speeden-and-cuben' : 'lieberkind/f2l-trainer';
    const revision = speeden ? '3aaf127b0013cbbfd16d12b397d8c0ff8c912c65' : '76fcfccf522f12822db8699209a6a934c4d28421';
    return { file, sourceId, url: `https://raw.githubusercontent.com/${repository}/${revision}/${path}`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  });
  writeFileSync('src/data/sources.json', JSON.stringify({ sources: [
    { id: 'speeden-mit-3aaf127', repository: 'https://github.com/Blaxzter/speeden-and-cuben', revision: '3aaf127b0013cbbfd16d12b397d8c0ff8c912c65', license: 'MIT', attribution: 'Copyright (c) 2026 Frederic Abraham' },
    { id: 'lieberkind-mit-76fcfcc', repository: 'https://github.com/lieberkind/f2l-trainer', revision: '76fcfccf522f12822db8699209a6a934c4d28421', license: 'MIT', attribution: 'Copyright (c) 2020 Tomas Lieberkind' },
  ], artifacts }, null, 2) + '\n');
}, 30000);
