import { beforeAll, expect, it } from 'vitest';
import { loadEngine, SOLVED } from '../../src/cube/engine';
import { invertMoves } from '../../src/cube/notation';
import { CrossTable, OUTER_MOVES, required } from '../../src/cross/table';
import { validateChallenge as validateCrossOnly } from '../../src/cross/validation';
import { generateOne } from '../../src/cross-one/generate';
import { OneModel, ONE_VERSIONS, SLOTS } from '../../src/cross-one/model';
import { searchOne, WorkBudget } from '../../src/cross-one/search';
import { validateOne } from '../../src/cross-one/validation';
import { colors, type Color, type CrossDepth, type Slot } from '../../src/store/records';
import type { GenerateRequest } from '../../src/workers/protocol';
import { geometricApply, geometricConjugate } from '../helpers/cube-geometry';
import { oracleCross, oracleCrossCode, oracleCorners, oracleDistances, oracleEdges, oraclePair, oraclePieceTransitions, oracleReplay, oracleSolved } from '../helpers/cross-one-oracle';

let model: OneModel, reference: Uint8Array;
beforeAll(async () => {
  const engine = await loadEngine(), cross = new CrossTable(engine); await cross.build(() => {}, () => {});
  model = new OneModel(engine, cross); await model.initialize(() => {}); reference = oracleDistances(OUTER_MOVES);
}, 60000);
function request(K: CrossDepth, L: number, slot: Slot | null, seed: string, color: Color = colors[0]): GenerateRequest {
  return { kind: 'generate', protocol: 1, requestId: seed, epoch: 9, workerInstance: 'test', versions: ONE_VERSIONS, frame: model.engine.frame(color),
    options: { trainer: 'cross1', K, L, pair: slot ? { kind: 'slot', slot } : { kind: 'any' } }, seed, budget: { timeMs: 5000, maxNodes: 10000 } };
}
it('verifies full legal scramble/witness, independent depths, all colors/slots and supported boundaries without exact-cap claims', async () => {
  const samples: GenerateRequest[] = [];
  for (const color of colors) for (const K of [1, 8] as const) for (const L of [1, 12]) for (const slot of [...SLOTS, null]) samples.push(request(K, L, slot, `${color}-${K}-${L}-${slot}`, color));
  for (const K of [1, 2, 3, 4, 5, 6, 7, 8] as const) for (let L = 1; L <= 12; L++) samples.push(request(K, L, null, `interior-${K}-${L}`));
  const depths = new Set<number>(), lengths = new Set<number>(), starts = new Set<string>();
  for (const req of samples) {
    const result = await generateOne(req, model, new WorkBudget(5000, 10000));
    const c = result.challenge, actual = oracleReplay(oracleSolved, c.scramble), final = oracleReplay(actual, c.proof.witness);
    expect(c.options).toEqual(req.options); expect(c.frame).toEqual(req.frame); expect(c.proof.cap).toBe(c.options.L);
    expect(c.start.facelets).toBe(actual); model.engine.fromState(c.start);
    expect(reference[oracleCrossCode(actual)]).toBe(c.proof.crossDepth); expect(c.proof.crossDepth).toBeLessThanOrEqual(c.options.K);
    expect(oracleCross(final)).toBe(true); expect(oraclePair(final, result.witnessSlot)).toBe(true);
    expect(c.proof.solvedSlots).toEqual(SLOTS.filter((slot) => oraclePair(final, slot)));
    const allowed = c.options.pair.kind === 'any' ? SLOTS : [c.options.pair.slot];
    expect(oracleCross(actual) && allowed.some((slot) => oraclePair(actual, slot))).toBe(false);
    expect(c.proof.witness.length).toBeLessThanOrEqual(c.options.L);
    if (c.options.pair.kind === 'slot') expect(result.witnessSlot).toBe(c.options.pair.slot);
    expect(c.requestId).toBe(req.requestId); expect(c.epoch).toBe(req.epoch);
    depths.add(c.proof.crossDepth); lengths.add(c.proof.witness.length); starts.add(actual);
  }
  expect(depths.size).toBeGreaterThan(4); expect(lengths.size).toBeGreaterThan(8); expect(starts.size).toBeGreaterThan(200);
  console.log({ samples: samples.length, depths: [...depths], lengths: [...lengths] });
}, 120000);

it('accepts the actual depth-eight Cross boundary with a complete witness and rejects the same state under K7', () => {
  const coordinate = model.cross.distances.findIndex((d) => d === 8), witness = model.cross.solve(coordinate), scramble = invertMoves(witness);
  const actual = oracleReplay(oracleSolved, scramble), req = request(8, 8, 'BL', 'actual-depth-eight');
  expect(reference[oracleCrossCode(actual)]).toBe(8);
  const c = { challengeId: req.requestId, requestId: req.requestId, epoch: req.epoch, versions: req.versions, frame: req.frame, options: req.options,
    start: { format: SOLVED.format, facelets: actual }, scramble, proof: { kind: 'combined-bound', crossDepth: 8, cap: 8, witness, solvedSlots: [...SLOTS] } };
  expect(oracleReplay(actual, witness)).toBe(oracleSolved);
  expect(validateOne(c, model.engine, model).proof.crossDepth).toBe(8);
  expect(() => validateOne({ ...c, options: { ...c.options, K: 7 } }, model.engine, model)).toThrow();
});
it('checks every small-table transition independently and admissible distances without claiming Cross preservation', () => {
  const corners = oraclePieceTransitions(OUTER_MOVES, oracleCorners), edges = oraclePieceTransitions(OUTER_MOVES, oracleEdges);
  for (let move = 0; move < 18; move++) {
    expect([...required(model.cornerTransitions[move])]).toEqual(corners[move]);
    const transition = required(model.pairTransitions[move]);
    for (let code = 0; code < 576; code++) expect(transition[code]).toBe(required(required(corners[move])[Math.floor(code / 24)]) * 24 + required(required(edges[move])[code % 24]));
  }
  for (let slot = 0; slot < 4; slot++) {
    const goal = required(model.pairGoals[slot]), distances = new Uint8Array(576).fill(255), queue = [goal]; distances[goal] = 0;
    for (let head = 0; head < queue.length; head++) for (let move = 0; move < 18; move++) {
      const code = required(queue[head]), next = required(required(corners[move])[Math.floor(code / 24)]) * 24 + required(required(edges[move])[code % 24]);
      if (distances[next] === 255) { distances[next] = required(distances[code]) + 1; queue.push(next); }
    }
    expect(queue).toHaveLength(576); expect(model.pairDistances[slot]).toEqual(distances);
  }
  // Full legal states also check the shared orientation convention end to end.
  for (const move of OUTER_MOVES) {
    const full = model.engine.apply(SOLVED, [move]); expect(full.facelets).toBe(oracleReplay(oracleSolved, [move]));
    const projected = model.project(full);
    for (let slot = 0; slot < 4; slot++) {
      const code = required(projected.pairs[slot]), distance = required(required(model.pairDistances[slot])[code]);
      expect(distance).toBeLessThanOrEqual(1);
      expect(code === model.pairGoals[slot]).toBe(oraclePair(full.facelets, required(SLOTS[slot])));
    }
  }
  // Orientation transitions are observable through generated legal states, not just solved cubies.
  let state = SOLVED;
  for (let step = 0; step < 120; step++) {
    state = model.engine.apply(state, [required(OUTER_MOVES[(step * 7 + Math.floor(step / 5)) % 18])]);
    const projection = model.project(state);
    for (let move = 0; move < 18; move++) {
      const m = required(OUTER_MOVES[move]), next = model.engine.apply(state, [m]);
      expect(next.facelets).toBe(oracleReplay(state.facelets, [m]));
      const actual = model.project(next);
      expect(actual.cross).toBe(model.cross.next(projection.cross, move));
      expect(actual.pairs).toEqual(projection.pairs.map((code) => required(model.pairTransitions[move])[code]));
    }
  }
}, 30000);

function onlyFrGoal(): string {
  let state = oracleSolved;
  const choices = ['L', 'B', 'R', 'F'];
  for (let i = 0; i < 80; i++) {
    const face = required(choices[(i * 7 + Math.floor(i / 4)) % 4]);
    const next = geometricApply(geometricApply(geometricApply(state, face), 'U', i % 3 === 0 ? 2 : 1), face, -1);
    if (oracleCross(next) && oraclePair(next, 'FR')) state = next;
    if (SLOTS.filter((slot) => oraclePair(state, slot)).join() === 'FR') return state;
  }
  throw new Error('Independent one-slot fixture unavailable');
}
it('search considers each of the four any-pair goals and rejects the wrong targeted slot', async () => {
  const base = onlyFrGoal();
  for (const [slot, yaw] of [['FR', 0], ['FL', 1], ['BR', 3], ['BL', 2]] as const) {
    const goal = geometricConjugate(base, yaw), actual = geometricApply(goal, 'D');
    expect(SLOTS.filter((s) => oraclePair(goal, s))).toEqual([slot]);
    const state = { format: SOLVED.format, facelets: actual };
    for (const selected of [null, slot]) {
      const witness = await searchOne(model, state, selected, 1, new WorkBudget(5000, 10000));
      expect(witness).not.toBeNull(); const final = oracleReplay(actual, required(witness ?? undefined));
      expect(oracleCross(final)).toBe(true); expect(oraclePair(final, slot)).toBe(true);
    }
    const wrong = required(SLOTS.find((s) => s !== slot));
    expect(await searchOne(model, state, wrong, 1, new WorkBudget(5000, 10000))).toBeNull();
  }
});
it('permits a combined witness to disturb an initially solved Cross and keeps any-pair already-complete filtering honest', async () => {
  const scramble = [{ family: 'R', amount: 1 }, { family: 'U', amount: 1 }, { family: 'R', amount: -1 }] as const;
  const start = { format: SOLVED.format, facelets: oracleReplay(oracleSolved, scramble) };
  expect(oracleCross(start.facelets)).toBe(true); expect(oraclePair(start.facelets, 'FR')).toBe(false);
  const witness = await searchOne(model, start, 'FR', 3, new WorkBudget(5000, 10000));
  if (!witness) throw new Error('No complete-goal witness');
  const final = oracleReplay(start.facelets, witness);
  expect(oracleCross(final) && oraclePair(final, 'FR')).toBe(true);
  expect(witness.some((_, i) => !oracleCross(oracleReplay(start.facelets, witness.slice(0, i + 1))))).toBe(true);
  const slots = SLOTS.filter((slot) => oraclePair(final, slot));
  const req = request(1, 3, 'FR', 'cross-zero');
  const challenge = { challengeId: 'cross-zero', requestId: req.requestId, epoch: req.epoch, versions: req.versions, frame: req.frame, options: req.options, scramble, start, proof: { kind: 'combined-bound', crossDepth: 0, cap: 3, witness, solvedSlots: slots } };
  expect(validateOne(challenge, model.engine, model).proof.crossDepth).toBe(0);
  expect(() => validateOne({ ...challenge, options: { trainer: 'cross1', K: 1, L: 3, pair: { kind: 'any' } } }, model.engine, model)).toThrow('already satisfies');
});
it('frames are proper physical rotations for every selected color, not reflected slot mappings', () => {
  const scheme: Record<string, string> = { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' };
  const orientations = new Set<string>(), queue = [oracleSolved];
  for (let head = 0; head < queue.length; head++) {
    const state = required(queue[head]), centers = [4, 13, 22, 31, 40, 49].map((i) => state[i]).join('');
    if (orientations.has(centers)) continue;
    orientations.add(centers);
    for (const axis of ['x', 'y', 'z']) queue.push(geometricApply(state, axis));
  }
  for (const color of colors) {
    const frame = model.engine.frame(color), centers = Object.values(frame.colorOfFace).map((c) => Object.keys(scheme).find((f) => scheme[f] === c)).join('');
    expect(frame.colorOfFace.D).toBe(color); expect(orientations.has(centers)).toBe(true);
  }
  expect(orientations.size).toBe(24);
});
it('rejects unsupported caps, altered proofs/state/slots and already-complete challenges; a solved Cross is not the physical base', async () => {
  const req = request(3, 8, 'FR', 'validation'), result = await generateOne(req, model, new WorkBudget(5000, 10000)), c = result.challenge;
  expect(() => validateCrossOnly(c, model.engine, model.cross)).toThrow();
  for (const altered of [
    { ...c, proof: { ...c.proof, cap: 7 } }, { ...c, start: SOLVED },
    { ...c, versions: { ...ONE_VERSIONS, tables: 'wrong' } },
    { ...c, proof: { ...c.proof, witness: [] } }, { ...c, proof: { ...c.proof, solvedSlots: ['FR', 'FR'] } },
    { ...c, proof: { ...c.proof, crossDepth: 9 } },
    { ...c, frame: { ...c.frame, crossColor: 'blue' } },
  ]) expect(() => validateOne(altered, model.engine, model)).toThrow();
  const wrongBase = geometricApply(oracleSolved, 'U');
  expect(oracleCross(wrongBase)).toBe(true);
  expect(oracleReplay(wrongBase, c.scramble)).not.toBe(c.start.facelets);
  for (const L of [0, 13]) await expect(generateOne(request(1, L, null, `unsupported-${L}`), model, new WorkBudget(5000, 10000))).rejects.toMatchObject({ code: 'unsupported-options' });
  const complete = { ...c, start: SOLVED, scramble: [], proof: { ...c.proof, crossDepth: 0, witness: [OUTER_MOVES[0]], solvedSlots: [...SLOTS] } };
  expect(() => validateOne(complete, model.engine, model)).toThrow('already satisfies');
});
it('independently replays an actual random-filter/search result against its full-state goal and Cross bound', async () => {
  const req = request(8, 6, null, 'compare-8-6-0');
  const result = await generateOne(req, model, new WorkBudget(5000, 100000), 'random-search');
  const c = result.challenge, actual = oracleReplay(oracleSolved, c.scramble), final = oracleReplay(actual, c.proof.witness);
  expect(c.start.facelets).toBe(actual); expect(reference[oracleCrossCode(actual)]).toBe(c.proof.crossDepth);
  expect(oracleCross(final)).toBe(true); expect(oraclePair(final, result.witnessSlot)).toBe(true); expect(c.proof.witness.length).toBeLessThanOrEqual(6);
});
it('honors zero/exhausted budgets, deadlines, cancellation after a yielded candidate and concrete witnesses without search', async () => {
  const req = request(8, 12, null, 'budgets');
  for (const [time, nodes] of [[NaN, 10], [Infinity, 10], [-1, 10], [1000, -1], [1000, 1.5]]) expect(() => new WorkBudget(required(time), required(nodes))).toThrow('budgets');
  await expect(generateOne(req, model, new WorkBudget(5000, 0))).rejects.toMatchObject({ code: 'budget-exhausted' });
  await expect(generateOne(req, model, new WorkBudget(0, 10000))).rejects.toMatchObject({ code: 'budget-exhausted' });
  let cancelled = false;
  const pending = generateOne(req, model, new WorkBudget(5000, 10000, () => cancelled)); cancelled = true;
  await expect(pending).rejects.toMatchObject({ code: 'cancelled' });
  // Nine charged nodes cover a single construction candidate. No unneeded IDDFS can exhaust it.
  const result = await generateOne(request(8, 1, 'FR', 'concrete'), model, new WorkBudget(5000, 9));
  expect(result.metrics.nodes).toBe(9); expect(result.challenge.proof.witness).toHaveLength(1);
  const hard = model.engine.apply(SOLVED, OUTER_MOVES.filter((_, i) => i % 4 === 0));
  await expect(searchOne(model, hard, null, 12, new WorkBudget(5000, 1))).rejects.toMatchObject({ code: 'budget-exhausted' });
});
