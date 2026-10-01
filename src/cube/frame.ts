import type { Color, Face } from '../store/records';
// Proper rigid rotations of the contract color scheme, Cross at D. Frame policy v1.
export const TRAINING_FRAMES: Readonly<Record<Color, Readonly<Record<Face, Color>>>> = {
  white: { U: 'yellow', R: 'red', F: 'green', D: 'white', L: 'orange', B: 'blue' },
  yellow: { U: 'white', R: 'orange', F: 'green', D: 'yellow', L: 'red', B: 'blue' },
  green: { U: 'blue', R: 'red', F: 'yellow', D: 'green', L: 'orange', B: 'white' },
  blue: { U: 'green', R: 'orange', F: 'yellow', D: 'blue', L: 'red', B: 'white' },
  red: { U: 'orange', R: 'yellow', F: 'green', D: 'red', L: 'white', B: 'blue' },
  orange: { U: 'red', R: 'white', F: 'green', D: 'orange', L: 'yellow', B: 'blue' },
};
