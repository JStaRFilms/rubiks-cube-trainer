import { SOLVED, type CubeEngine, type CubeStateV1 } from '../cube/engine';
import { OLL_STICKER_INDICES, pieceIndices } from '../cube/geometry';
import type { Move, Slot } from '../store/records';

export type CaseTrainer = 'f2l' | 'oll' | 'pll' | 'zbll';
export type QuarterTurn = 0 | 1 | 2 | 3;
export const QUARTERS = [0, 1, 2, 3] as const;
export const SLOTS = ['FR', 'FL', 'BR', 'BL'] as const;
export const IDENTITY_POLICIES = { f2l: 'f2l-fr-pre-u-v1', oll: 'oll-u20-pre-u-yaw-v1', pll: 'pll-ll-pre-u-yaw-v1', zbll: 'zbll-ll-pre-u-yaw-v1' } as const;
export function auf(turn: QuarterTurn): Move[] {
  return turn === 0 ? [] : [{ family: 'U', amount: turn === 3 ? -1 : turn }];
}
function target(state: CubeStateV1, names: readonly string[], labels: string): string {
  for (const name of names) {
    const indices = pieceIndices(name), stickers = indices.map((i) => state.facelets[i]).join('');
    if ([...stickers].sort().join('') === [...labels].sort().join('')) return `${indices.join(',')}:${stickers}`;
  }
  throw new Error('Target pair is outside the isolated F2L context.');
}
export function caseProjection(trainer: CaseTrainer, state: CubeStateV1): string {
  if (trainer === 'f2l') return `${target(state, ['UFR', 'URB', 'UBL', 'ULF', 'DRF'], 'DRF')}|${target(state, ['UF', 'UR', 'UB', 'UL', 'FR'], 'FR')}`;
  if (trainer === 'oll') return OLL_STICKER_INDICES.map((i) => state.facelets[i] === 'U' ? '1' : '0').join('');
  return OLL_STICKER_INDICES.map((i) => state.facelets[i]).join('');
}
export function caseIdentity(engine: CubeEngine, trainer: CaseTrainer, state: CubeStateV1, slot: Slot = 'FR'): string {
  const normalized = engine.normalize(state), canonical = trainer === 'f2l' ? engine.slot(normalized, slot, true) : normalized;
  const forms: string[] = [];
  for (const yaw of trainer === 'f2l' ? [0] as const : QUARTERS) {
    const turned = engine.conjugate(canonical, yaw);
    for (const pre of QUARTERS) forms.push(caseProjection(trainer, engine.apply(turned, auf(pre))));
  }
  return `${IDENTITY_POLICIES[trainer]}:${forms.sort()[0]}`;
}
export function f2lSolved(engine: CubeEngine, state: CubeStateV1): boolean {
  return engine.crossSolved(state) && SLOTS.every((slot) => engine.pairSolved(state, slot));
}
export function isolatedContext(engine: CubeEngine, state: CubeStateV1, slot: Slot): boolean {
  return engine.crossSolved(state) && SLOTS.filter((other) => other !== slot).every((other) => engine.pairSolved(state, other));
}
export function edgesOriented(engine: CubeEngine, state: CubeStateV1): boolean {
  const normalized = engine.normalize(state);
  return [1, 3, 5, 7].every((i) => normalized.facelets[i] === 'U');
}
export function oriented(engine: CubeEngine, state: CubeStateV1): boolean {
  return engine.ollMask(state) === engine.ollMask(SOLVED);
}
