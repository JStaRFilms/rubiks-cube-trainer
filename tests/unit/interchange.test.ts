import { beforeAll, expect, it } from 'vitest';
import { loadEngine, SOLVED, type CubeEngine } from '../../src/cube/engine';
import fixture from '../../src/reconstruction/fixtures/synthetic-v1.json';
import { decodeReconstruction } from '../../src/reconstruction/interchange';
import { decodeWorkerRequest, decodeScaffoldReply, GenerationScaffold, matchesPending, SCAFFOLD_VERSIONS, type GenerateRequest, type WorkerReply } from '../../src/workers/protocol';
let engine: CubeEngine;
beforeAll(async () => { engine = await loadEngine(); });
it('validates synthetic interchange, uncertainty order, corrections and no claimed recognition', () => {
  const result = decodeReconstruction(fixture, engine);
  expect(result.validation).toEqual(fixture.validation);
  expect(result.events[1]?.kind === 'move' && result.events[1].time).toBeNull();
  expect(result.events.map((e) => e.id)).toEqual(['e1', 'e2', 'e3', 'e4', 'e5', 'e6']);
  expect(result.revisions[0]?.removed[0]?.id).toBe('removed-gap');
  expect(decodeReconstruction({ ...fixture, validation: { exactSequence: 'matched', solved: true, groundTruthId: 'not-evidence' } }, engine).validation.exactSequence).toBe('unchecked');
  const gap = { kind: 'gap', id: 'active-gap', time: { earliestMs: 0, latestMs: 400 }, reason: 'blur' };
  const incomplete = decodeReconstruction({ ...fixture, events: [fixture.events[0], gap, ...fixture.events.slice(1)] }, engine);
  expect(incomplete.validation.transitions).toBe('incomplete'); expect(incomplete.validation.finalState).toBeNull(); expect(incomplete.validation.solved).toBeNull();
});
it('rejects invalid versions, initial state, timing, scores and broken correction links', () => {
  expect(() => decodeReconstruction({ ...fixture, version: 2 }, engine)).toThrow('Unsupported');
  expect(() => decodeReconstruction({ ...fixture, initial: { ...fixture.initial, scramble: [{ family: 'R', amount: 1 }] } }, engine)).toThrow('does not match');
  expect(() => decodeReconstruction({ ...fixture, media: { ...fixture.media, durationMs: NaN } }, engine)).toThrow('finite');
  expect(() => decodeReconstruction({ ...fixture, events: [{ ...fixture.events[0], time: { earliestMs: 200, latestMs: 100 } }] }, engine)).toThrow('interval');
  expect(() => decodeReconstruction({ ...fixture, events: [{ ...fixture.events[0], score: { value: 1, model: 'fixture', calibrated: true } }] }, engine)).toThrow('uncalibrated');
  expect(() => decodeReconstruction({ ...fixture, revisions: [] }, engine)).toThrow('missing removed');
  expect(() => decodeReconstruction({ ...fixture, events: [{ ...fixture.events[0], move: { family: '3Rw', amount: 1 } }] }, engine)).toThrow('restricted');
});
it('keeps missing generators/tables as failure and supports cancellation/version rejection', () => {
  const scaffold = new GenerationScaffold();
  const init = scaffold.handle({ kind: 'initialize', protocol: 1, workerInstance: 'instance', versions: SCAFFOLD_VERSIONS });
  expect(init.kind).toBe('initialization-failed'); expect(decodeScaffoldReply(init)).toEqual(init);
  const request: GenerateRequest = { kind: 'generate', protocol: 1, requestId: 'request', epoch: 4, workerInstance: 'instance', versions: SCAFFOLD_VERSIONS, frame: engine.frame('white'), options: { trainer: 'cross', K: 1 }, seed: 'synthetic', budget: { timeMs: 100, maxNodes: 100 } };
  expect(decodeWorkerRequest(request, engine)).toEqual(request);
  expect(scaffold.handle(request)).toMatchObject({ kind: 'failed', code: 'unsupported-options' });
  expect(scaffold.handle({ ...request, versions: { ...SCAFFOLD_VERSIONS, tables: 'missing-table' } })).toMatchObject({ kind: 'failed', code: 'version-mismatch' });
  expect(scaffold.handle({ kind: 'cancel', requestId: 'request', epoch: 4 })).toMatchObject({ kind: 'failed', code: 'cancelled', epoch: 4 });
  expect(() => decodeWorkerRequest({ ...request, budget: { timeMs: -1, maxNodes: 1 } }, engine)).toThrow('budget');
  expect(() => decodeScaffoldReply({ kind: 'result', workerInstance: 'instance', challenge: {} })).toThrow('cannot accept');
  const result: Extract<WorkerReply, { kind: 'result' }> = { kind: 'result', workerInstance: 'instance', challenge: { challengeId: 'synthetic', requestId: request.requestId, epoch: request.epoch, versions: request.versions, frame: request.frame, scramble: [], start: SOLVED, options: { trainer: 'cross', K: 1 }, proof: { kind: 'cross-optimal', depth: 1, solution: [] } } };
  expect(matchesPending(result, request)).toBe(true); // Metadata only, never proof/optimality acceptance.
  expect(matchesPending(result, { ...request, epoch: 5 })).toBe(false);
  expect(matchesPending(result, { ...request, workerInstance: 'new-instance' })).toBe(false);
});
