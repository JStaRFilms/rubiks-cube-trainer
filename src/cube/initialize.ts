import { loadEngine, SOLVED } from './engine';
import { parseNotation } from './notation';
export async function initializeReview(): Promise<void> {
  const engine = await loadEngine();
  if (engine.apply(SOLVED, parseNotation("R R' M M' x x'")).facelets !== SOLVED.facelets) throw new Error('Cube initialization check failed.');
  const { initializePlayerModule } = await import('./player');
  initializePlayerModule();
  const { probeGenerationScaffold } = await import('../workers/client');
  await probeGenerationScaffold();
}
