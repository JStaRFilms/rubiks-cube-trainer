// Independent test oracle from Core architecture's Cartesian definition.
// It neither imports the engine nor uses its orbit/sticker conversion.
type Vec = [number, number, number];
const labels = ['U', 'R', 'F', 'D', 'L', 'B'];
const basis: [Vec, Vec, Vec][] = [
  [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
  [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
  [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
];
export const geometry = basis.flatMap(([normal, right, up], f) => Array.from({ length: 9 }, (_, cell) => {
  const row = Math.floor(cell / 3), col = cell % 3;
  const position: Vec = [normal[0] + (col - 1) * right[0] + (1 - row) * up[0], normal[1] + (col - 1) * right[1] + (1 - row) * up[1], normal[2] + (col - 1) * right[2] + (1 - row) * up[2]];
  return { normal, position, label: labels[f] ?? '', index: f * 9 + cell };
}));
function dot(a: Vec, b: Vec): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function turn(v: Vec, axis: Vec): Vec {
  // Clockwise outside is minus ninety degrees about the outward normal.
  const d = dot(v, axis);
  return [axis[0] * d - (axis[1] * v[2] - axis[2] * v[1]), axis[1] * d - (axis[2] * v[0] - axis[0] * v[2]), axis[2] * d - (axis[0] * v[1] - axis[1] * v[0])];
}
const same = (a: Vec, b: Vec) => a.every((v, i) => v === b[i]);
export function geometricPermutation(family: string): number[] {
  const rotation = ['x', 'y', 'z'].includes(family), slice = ['M', 'E', 'S'].includes(family);
  const axes: Record<string, string> = { x: 'R', y: 'U', z: 'F', M: 'L', E: 'D', S: 'F' };
  const face = axes[family] ?? family[0];
  const entry = basis[labels.indexOf(face ?? '')]; if (!entry) throw new Error('Bad geometric test family.');
  const axis = entry[0], permutation = Array<number>(54);
  for (const sticker of geometry) {
    const layer = dot(sticker.position, axis);
    const selected = rotation || (slice ? layer === 0 : family.endsWith('w') ? layer >= 0 : layer === 1);
    const normal = selected ? turn(sticker.normal, axis) : sticker.normal, position = selected ? turn(sticker.position, axis) : sticker.position;
    const destination = geometry.find((s) => same(s.normal, normal) && same(s.position, position));
    if (!destination) throw new Error('Bad geometric test destination.');
    permutation[destination.index] = sticker.index;
  }
  return permutation;
}
export function geometricApply(state: string, family: string, amount = 1): string {
  let result = state;
  for (let i = 0; i < (amount === -1 ? 3 : amount); i++) result = geometricPermutation(family).map((source) => result[source]).join('');
  return result;
}
export function geometricConjugate(state: string, yaw: number): string {
  const solved = labels.map((f) => f.repeat(9)).join(''), turned = geometricApply(state, 'y', yaw), centers = geometricApply(solved, 'y', yaw);
  const replacements = new Map(labels.map((label, f) => [centers[f * 9 + 4], label]));
  return [...turned].map((label) => replacements.get(label)).join('');
}
