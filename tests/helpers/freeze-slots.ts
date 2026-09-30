import { mkdirSync, writeFileSync } from 'node:fs';
import { geometricPermutation } from './cube-geometry.ts';
const y = geometricPermutation('y');
const compose = (a: number[], b: number[]) => b.map((i) => a[i] ?? -1);
const identity = Array.from({ length: 54 }, (_, i) => i), y2 = compose(y, y), y3 = compose(y2, y);
const slots = {
  FR: { yaw: 0, sourceAtDestination: identity, relabel: { U: 'U', R: 'R', F: 'F', D: 'D', L: 'L', B: 'B' } },
  FL: { yaw: 1, sourceAtDestination: y, relabel: { U: 'U', R: 'F', F: 'L', D: 'D', L: 'B', B: 'R' } },
  BR: { yaw: 3, sourceAtDestination: y3, relabel: { U: 'U', R: 'B', F: 'R', D: 'D', L: 'F', B: 'L' } },
  BL: { yaw: 2, sourceAtDestination: y2, relabel: { U: 'U', R: 'L', F: 'B', D: 'D', L: 'R', B: 'F' } },
};
mkdirSync('tests/fixtures', { recursive: true });
writeFileSync('tests/fixtures/slot-permutations.json', JSON.stringify(slots, null, 2) + '\n');
