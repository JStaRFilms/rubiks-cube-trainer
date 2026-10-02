import { beforeAll, expect, it } from 'vitest';
import { loadEngine, SOLVED, type CubeEngine } from '../../src/cube/engine';
import { invertMoves, parseNotation } from '../../src/cube/notation';
import { PLL_CASES } from '../../src/data/pll';
import { caseIdentity } from '../../src/cases/identity';
import { lowerIndices, normalize, replay, solved } from '../helpers/case-oracle';
import { alphaStates, cornerOrientationKey, oracleReturnRegrip, zbllOracleKey, zbllUniverse } from '../helpers/zbll-oracle';
import { sourceNotation, zbllSourceDefaults } from '../helpers/zbll-source';

let engine: CubeEngine;
beforeAll(async () => { engine = await loadEngine(); });
it('independently constructs 7776 legal states, 494 full-sticker classes and 493 published AlphaSheep classes', () => {
  const universe = zbllUniverse(), keys = new Set<string>();
  expect(universe).toHaveLength(7776);
  expect(new Set(universe).size).toBe(7776);
  for (const facelets of universe) {
    expect(engine.toState(engine.fromState({ format: 'cube3-facelets-v1', facelets })).facelets).toBe(facelets);
    const key = zbllOracleKey(facelets);
    expect(caseIdentity(engine, 'zbll', { format: 'cube3-facelets-v1', facelets })).toBe(`zbll-ll-pre-u-yaw-v1:${key}`);
    keys.add(key);
  }
  expect(keys.size).toBe(494);
  keys.delete(zbllOracleKey(solved));
  const numbered = alphaStates(), actual = new Set<string>(), families = new Map<string, number>();
  expect(numbered).toHaveLength(493);
  for (const entry of numbered) {
    expect(engine.toState(engine.fromState({ format: 'cube3-facelets-v1', facelets: entry.state })).facelets).toBe(entry.state);
    actual.add(zbllOracleKey(entry.state));
    families.set(entry.family, (families.get(entry.family) ?? 0) + 1);
  }
  expect(actual.size).toBe(493);
  expect([...actual].sort()).toEqual([...keys].sort());
  expect(Object.fromEntries(families)).toEqual({ PLL: 21, T: 72, U: 72, L: 72, S: 72, AS: 72, Pi: 72, H: 40 });
  expect(PLL_CASES).toHaveLength(21);
  expect(PLL_CASES.map((entry) => zbllOracleKey(entry.representative.facelets)).sort()).toEqual(numbered.filter((entry) => entry.family === 'PLL').map((entry) => zbllOracleKey(entry.state)).sort());
}, 60000);
it('checks every sourced first default against independent universe/family/published state mapping, with PLL counted once', () => {
  const alpha = alphaStates(), published = new Map(alpha.map((entry) => [zbllOracleKey(entry.state), entry]));
  const familyPatterns = new Map(alpha.map((entry) => [cornerOrientationKey(entry.state), entry.family]));
  const defaults = zbllSourceDefaults(), classes = new Map<string, string>(), failures: string[] = [];
  expect(defaults).toHaveLength(472);
  for (const entry of defaults) {
    const label = `${entry.family}/${entry.subset}/${entry.label} at source line ${entry.sourceLine}`;
    let start: string;
    try {
      const authored = parseNotation(sourceNotation(entry));
      const complete = [...authored, ...oracleReturnRegrip(authored)];
      const setup = invertMoves(complete);
      start = normalize(replay(solved, setup));
      expect(engine.normalize(engine.apply(SOLVED, setup)).facelets).toBe(start);
    }
    catch (error) { failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`); continue; }
    const key = zbllOracleKey(start), expected = published.get(key);
    const family = entry.family === 'Sune' ? 'S' : entry.family === 'Antisune' ? 'AS' : entry.family;
    const brokenLower = lowerIndices.filter((i) => start[i] !== solved[i]), brokenEdges = [1, 3, 5, 7].filter((i) => start[i] !== 'U');
    if (brokenLower.length || brokenEdges.length) failures.push(`${label}: invalid context, lower sticker indices ${brokenLower.join(',')}, unoriented U edge indices ${brokenEdges.join(',') || 'none'}, state ${start}`);
    if (!expected) failures.push(`${label}: absent from independent published classes`);
    if (expected?.family !== family || familyPatterns.get(cornerOrientationKey(start)) !== family) failures.push(`${label}: expected ${family}, actual ${expected?.family}`);
    const previous = classes.get(key);
    if (previous) failures.push(`${label}: duplicate ${previous}, published ${expected?.label}`);
    classes.set(key, label);
  }
  for (const entry of PLL_CASES) {
    const key = zbllOracleKey(entry.representative.facelets);
    if (classes.has(key)) failures.push(`${entry.id}: PLL duplicate`);
    classes.set(key, entry.id);
  }
  const missing = [...published].filter(([key]) => !classes.has(key)).map(([, entry]) => entry.label);
  const matched = [...classes.keys()].filter((key) => published.has(key)).length;
  if (failures.length || missing.length) throw Error(`Source gate failed. Matched published classes ${matched}/493, total projected keys ${classes.size}.\n${failures.join('\n')}\nMissing published labels: ${missing.join(', ')}`);
  expect(classes.size).toBe(493);
}, 60000);
