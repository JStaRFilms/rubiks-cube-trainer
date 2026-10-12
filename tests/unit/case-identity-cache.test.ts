import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { CubeEngine, loadEngine, SOLVED } from '../../src/cube/engine';
import { caseIdentity } from '../../src/cases/identity';
import { OLL_CASES, PLL_CASES } from '../../src/data';

let engine: CubeEngine;
beforeAll(async () => { engine = await loadEngine(); });
afterEach(() => vi.restoreAllMocks());

it.each(['oll', 'pll'] as const)('reuses %s identity work by actual state bytes within one engine', (trainer) => {
  const fresh = new CubeEngine(engine.puzzle), normalize = vi.spyOn(fresh, 'normalize');
  const entry = (trainer === 'oll' ? OLL_CASES : PLL_CASES)[0];
  if (!entry) throw Error('Missing actual last-layer case.');
  const state = { ...entry.representative };
  expect(caseIdentity(fresh, trainer, state)).toBe(entry.identityKey);
  expect(caseIdentity(fresh, trainer, structuredClone(state))).toBe(entry.identityKey);
  expect(normalize).toHaveBeenCalledTimes(1);
  state.facelets = SOLVED.facelets;
  expect(caseIdentity(fresh, trainer, state)).not.toBe(entry.identityKey);
  expect(normalize).toHaveBeenCalledTimes(2);
  const other = new CubeEngine(engine.puzzle), otherNormalize = vi.spyOn(other, 'normalize');
  expect(caseIdentity(other, trainer, entry.representative)).toBe(entry.identityKey);
  expect(otherNormalize).toHaveBeenCalledTimes(1);
});

it('keeps OLL, PLL and ZBLL projections separate for the same state', () => {
  const fresh = new CubeEngine(engine.puzzle), normalize = vi.spyOn(fresh, 'normalize');
  const identities = (['oll', 'pll', 'zbll'] as const).map((trainer) => caseIdentity(fresh, trainer, SOLVED));
  expect(new Set(identities).size).toBe(3);
  expect(normalize).toHaveBeenCalledTimes(3);
});

it.each(['oll', 'pll'] as const)('does not let a warm %s identity bypass state format or legality', (trainer) => {
  const fresh = new CubeEngine(engine.puzzle);
  caseIdentity(fresh, trainer, SOLVED);
  expect(() => caseIdentity(fresh, trainer, Object.assign({ ...SOLVED }, { format: 'future' }))).toThrow();
  expect(() => caseIdentity(fresh, trainer, { ...SOLVED, facelets: 'U'.repeat(54) })).toThrow();
  // Flip UF while retaining nine stickers of each face identity.
  const illegal = [...SOLVED.facelets]; illegal[7] = 'F'; illegal[19] = 'U';
  expect(() => caseIdentity(fresh, trainer, { ...SOLVED, facelets: illegal.join('') })).toThrow();
});
