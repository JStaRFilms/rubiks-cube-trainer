import { loadEngine } from '../../src/cube/engine';
import { CrossTable } from '../../src/cross/table';
import { OneModel, ONE_VERSIONS } from '../../src/cross-one/model';
import { generateOne, type Strategy } from '../../src/cross-one/generate';
import { OneFailure, WorkBudget } from '../../src/cross-one/search';
import type { CrossDepth, Slot } from '../../src/store/records';
import type { GenerateRequest } from '../../src/workers/protocol';

export async function nodeBenchmark() {
  const engineStart = performance.now(), engine = await loadEngine(), engineInitMs = performance.now() - engineStart;
  const initSamples = [];
  let model: OneModel | undefined;
  for (let i = 0; i < 5; i++) {
    const start = performance.now(), cross = new CrossTable(engine); await cross.build(() => {}, () => {});
    const pairStart = performance.now(); model = new OneModel(engine, cross); await model.initialize(() => {});
    initSamples.push({ totalMs: performance.now() - start, pairMs: performance.now() - pairStart, bytes: model.byteLength });
  }
  if (!model) throw new Error('Model did not initialize');
  const samples = [], memory = [process.memoryUsage()];
  for (const strategy of ['construction', 'random-search'] satisfies Strategy[]) {
    for (const [K, L] of [[1, 12], [3, 8], [8, 6], [8, 12]] satisfies [CrossDepth, number][]) for (let i = 0; i < 16; i++) {
      const slot: Slot | null = i % 2 ? 'FR' : null, timeMs = strategy === 'construction' ? 5000 : 300;
      const request: GenerateRequest = { kind: 'generate', protocol: 1, requestId: `node-${strategy}-${K}-${L}-${i}`, epoch: 1, workerInstance: 'node', versions: ONE_VERSIONS, frame: engine.frame('white'),
        options: { trainer: 'cross1', K, L, pair: slot ? { kind: 'slot', slot } : { kind: 'any' } }, seed: `compare-${K}-${L}-${i}`, budget: { timeMs, maxNodes: strategy === 'construction' ? 10000 : 20000 } };
      const start = performance.now();
      try { const result = await generateOne(request, model, new WorkBudget(timeMs, request.budget.maxNodes), strategy); samples.push({ ...result.metrics, K, L, slot, elapsedMs: performance.now() - start, status: 'result', crossDepth: result.challenge.proof.crossDepth, length: result.challenge.proof.witness.length }); }
      catch (error) { if (!(error instanceof OneFailure)) throw error; samples.push({ strategy, K, L, slot, elapsedMs: performance.now() - start, status: error.code }); }
      memory.push(process.memoryUsage());
    }
  }
  return { engineInitMs, initSamples, samples, memory, memoryScope: 'Node process including Vite SSR loader; not isolated solver memory' };
}
