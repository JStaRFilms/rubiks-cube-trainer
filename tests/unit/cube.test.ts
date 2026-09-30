import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Alg } from 'cubing/alg';
import { loadEngine, SOLVED, type CubeEngine } from '../../src/cube/engine';
import { canonicalText, families, invertMoves, parseNotation } from '../../src/cube/notation';
import { OLL_STICKER_INDICES } from '../../src/cube/geometry';
import { geometricApply, geometricConjugate, geometry } from '../helpers/cube-geometry';
import slotFixtures from '../fixtures/slot-permutations.json';
let engine: CubeEngine;
beforeAll(async () => { engine = await loadEngine(); });
describe('independent Cartesian fixtures', () => {
  it.each(families)('proves %s direction, inverse, half turn and wire indexing', (family) => {
    const seed = parseNotation("R U2 F' L B D2 Rw M' E S2 x y' z");
    expect(engine.apply(SOLVED, [{ family, amount: 1 }]).facelets).toBe(geometricApply(SOLVED.facelets, family));
    let expected = SOLVED.facelets;
    for (const move of seed) expected = geometricApply(expected, move.family, move.amount);
    const start = engine.apply(SOLVED, seed);
    expect(start.facelets).toBe(expected);
    for (const amount of [1, 2, -1] as const) expect(engine.apply(start, [{ family, amount }]).facelets).toBe(geometricApply(expected, family, amount));
    expect(engine.apply(start, [{ family, amount: 1 }, { family, amount: -1 }])).toEqual(start);
    expect(engine.apply(start, Array.from({ length: 4 }, () => ({ family, amount: 1 as const })))).toEqual(start);
  });
  it('freezes all twenty OLL orientation locations, with no center or D layer', () => {
    const selected = geometry.filter((s) => s.position[1] === 1 && s.position.filter((v) => v !== 0).length >= 2).map((s) => s.index);
    expect(OLL_STICKER_INDICES).toEqual(selected);
    expect(OLL_STICKER_INDICES).toHaveLength(20);
    expect(engine.ollMask(SOLVED)).toBe('11111111000000000000');
  });
  it('proves six physical frames from proper rotations, not a mirrored color swap', () => {
    const fixtures = {
      white: { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' },
      yellow: { U: 'white', R: 'orange', F: 'green', D: 'yellow', L: 'red', B: 'blue' },
      green: { U: 'blue', R: 'red', F: 'yellow', D: 'green', L: 'orange', B: 'white' },
      blue: { U: 'green', R: 'orange', F: 'yellow', D: 'blue', L: 'red', B: 'white' },
      red: { U: 'orange', R: 'yellow', F: 'green', D: 'red', L: 'white', B: 'blue' },
      orange: { U: 'red', R: 'white', F: 'green', D: 'orange', L: 'yellow', B: 'blue' },
    } as const;
    for (const color of Object.keys(fixtures)) {
      const cross = (['white', 'yellow', 'green', 'blue', 'red', 'orange'] as const).find((c) => c === color);
      if (!cross) throw new Error('Fixture color missing.');
      expect(engine.frame(cross).colorOfFace).toEqual(fixtures[cross]);
    }
    const physical = 'yellow red green white orange blue'.split(' ');
    const proper = new Set<string>(), queue = [SOLVED.facelets];
    while (queue.length) {
      const state = queue.shift(); if (!state) break;
      const key = [4, 13, 22, 31, 40, 49].map((i) => state[i]).join(''); if (proper.has(key)) continue;
      proper.add(key); for (const axis of ['x', 'y', 'z']) queue.push(geometricApply(state, axis));
    }
    expect(proper.size).toBe(24);
    for (const frame of Object.values(fixtures)) {
      const key = Object.values(frame).map((color) => 'URFDLB'[physical.indexOf(color)]).join('');
      expect(proper.has(key)).toBe(true);
    }
  });
  it.each(['FR', 'FL', 'BR', 'BL'] as const)('proves proper %s conjugation, inverse and isolated goals', (slot) => {
    const yaw = { FR: 0, FL: 1, BR: 3, BL: 2 }[slot];
    const isolated = engine.apply(SOLVED, parseNotation("R U R' U'"));
    const mapped = engine.slot(isolated, slot);
    expect(mapped.facelets).toBe(geometricConjugate(isolated.facelets, yaw));
    const fixture = slotFixtures[slot];
    expect(fixture.yaw).toBe(yaw);
    for (const alg of ["R U F2 L' D B Rw E S' x", "F B L U2 R D' M y2 z", "R U R' U'"]) {
      const state = engine.apply(SOLVED, parseNotation(alg));
      const expected = fixture.sourceAtDestination.map((i) => {
        const label = (['U', 'R', 'F', 'D', 'L', 'B'] as const).find((f) => f === state.facelets[i]);
        if (!label) throw new Error('Invalid fixture label.');
        return fixture.relabel[label];
      }).join('');
      expect(engine.slot(state, slot).facelets).toBe(expected);
    }
    expect(engine.slot(mapped, slot, true)).toEqual(isolated);
    expect(engine.slot(SOLVED, slot)).toEqual(SOLVED);
    expect(engine.crossSolved(mapped)).toBe(true);
    expect(engine.pairSolved(mapped, slot)).toBe(false);
    for (const other of ['FR', 'FL', 'BR', 'BL'] as const) if (other !== slot) expect(engine.pairSolved(mapped, other)).toBe(true);
    const solution = slot === 'FR' ? "U R U' R'" : slot === 'FL' ? "U F U' F'" : slot === 'BR' ? "U B U' B'" : "U L U' L'";
    expect(engine.apply(mapped, parseNotation(solution))).toEqual(SOLVED);
  });
});
it('validates imported states after all 24 center normalizations', () => {
  const start = engine.apply(SOLVED, parseNotation("M E S Rw Uw Fw R U F"));
  for (const rotation of engine.orientations) {
    const rotated = engine.apply(start, rotation.moves);
    expect(engine.toState(engine.fromState(rotated))).toEqual(rotated);
    expect(engine.normalize(rotated)).toEqual(engine.normalize(start));
  }
  const swap = (state: string, indices: number[]) => {
    const chars = [...state], values = indices.map((i) => chars[i]);
    indices.forEach((i, j) => { chars[i] = values[(j + 1) % indices.length] ?? ''; });
    return { ...SOLVED, facelets: chars.join('') };
  };
  expect(() => engine.fromState(swap(SOLVED.facelets, [7, 19]))).toThrow('orientation sum');
  expect(() => engine.fromState(swap(SOLVED.facelets, [8, 20, 9]))).toThrow('orientation sum');
  let parity = swap(SOLVED.facelets, [7, 5]); parity = swap(parity.facelets, [19, 10]);
  expect(() => engine.fromState(parity)).toThrow('parity');
  expect(() => engine.fromState(swap(SOLVED.facelets, [13, 40]))).toThrow('proper rigid');
  expect(() => engine.fromState(swap(SOLVED.facelets, [46, 16]))).toThrow('Duplicate cubie');
  expect(() => engine.fromState(swap(SOLVED.facelets, [20, 9]))).toThrow('mirrored');
  expect(() => engine.fromState({ ...SOLVED, facelets: 'U'.repeat(54) })).toThrow('nine');
});
it('rejects multiplied empty/container traversal before vendor expansion', () => {
  let commutator = '()', conjugate = '()', repeatedOperand = '()';
  for (let i = 0; i < 31; i++) { commutator = `[${commutator},]`; conjugate = `[${conjugate}:]`; }
  for (let i = 0; i < 10; i++) repeatedOperand = `[${repeatedOperand},]`;
  expect(commutator).toHaveLength(95);
  const expand = vi.spyOn(Alg.prototype, 'experimentalExpand').mockImplementation(() => { throw new Error('Vendor expansion must not start.'); });
  try {
    for (const text of [commutator, conjugate, `(R ${repeatedOperand})10000`, `[${commutator.slice(1, -2)}: R]`]) expect(() => parseNotation(text)).toThrow('expansion work exceeds');
    expect(expand).not.toHaveBeenCalled();
  } finally { expand.mockRestore(); }
});
it('keeps basic empty notation and linear depth-32 empty containers usable', () => {
  for (const text of ['', '()', '(())', '[,]', '[:]', '(R)0']) expect(parseNotation(text)).toEqual([]);
  expect(canonicalText(parseNotation('[R,] [R:] [: U]'))).toBe("R R' R R' U");
  let text = '()'; for (let i = 0; i < 31; i++) text = `[:${text}]`;
  expect(parseNotation(text)).toEqual([]);
});
it('restricts and bounds parser output before expansion', () => {
  const moves = parseNotation("(r U2')2 [M, E] [x: S] // comment\n z'");
  expect(canonicalText(moves)).toBe("Rw U2 Rw U2 M E M' E' x S x' z'");
  expect(parseNotation(canonicalText(moves))).toEqual(moves);
  expect(parseNotation('('.repeat(32) + 'R' + ')'.repeat(32))).toEqual([{ family: 'R', amount: 1 }]);
  const maximum = parseNotation('('.repeat(32) + 'R' + ')'.repeat(32) + '10000'); expect(maximum).toHaveLength(10000);
  expect(engine.apply(SOLVED, maximum)).toEqual(SOLVED);
  expect(engine.apply(engine.apply(SOLVED, moves), invertMoves(moves))).toEqual(SOLVED);
  for (const text of ['.', '3Rw', '2R', 'Rv', 'R3', '(R)10001', '()10001', '(()10000)10000', '(R // annotation\n)10000', '[R, (U)10000]', '('.repeat(33) + 'R' + ')'.repeat(33), 'R '.repeat(40000)]) expect(() => parseNotation(text)).toThrow();
});
