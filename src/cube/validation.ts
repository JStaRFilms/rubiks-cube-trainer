import type { CubeEngine } from './engine';
import { faces } from './geometry';
import { colors, type TrainingFrame, type Versions } from '../store/records';
import { object, text, integer } from '../store/validation';
export function decodeFrame(value: unknown, engine: CubeEngine): TrainingFrame {
  const v = object(value), colorOfFace = object(v.colorOfFace), color = colors.find((c) => c === v.crossColor);
  if (!color) throw new Error('Invalid cross color.');
  const frame = engine.frame(color);
  if (Object.keys(colorOfFace).length !== 6 || faces.some((f) => colorOfFace[f] !== frame.colorOfFace[f])) throw new Error('Frame must use the contract physical color rotation.');
  return frame;
}
export function decodeVersions(value: unknown): Versions {
  const v = object(value);
  if (integer(v.contract, 1, 1) !== 1) throw new Error('Unsupported contract.');
  return { contract: 1, engine: text(v.engine), dataset: v.dataset === null ? null : text(v.dataset), tables: text(v.tables) };
}
