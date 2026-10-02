import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Move } from '../../src/store/records';
import { geometricConjugate } from './cube-geometry';
import { indices, llBases, llIndices, normalize, permutation, replay, solved } from './case-oracle';

const u = permutation([{ family: 'U', amount: 1 }]);
const yaws = ([0, 1, 2, 3] as const).map((yaw) => {
  const moves: Move[] = yaw === 0 ? [] : [{ family: 'y', amount: yaw === 3 ? -1 : yaw }];
  const turns = permutation(moves);
  const centers = turns.map((from) => solved[from]).join('');
  const labels = 'URFDLB';
  const relabel = new Map([...labels].map((label, face) => [centers[face * 9 + 4], label]));
  return { turns, relabel };
});
export function zbllOracleKey(state: string): string {
  const normalized = normalize(state), forms: string[] = [];
  for (const { turns, relabel } of yaws) {
    let turned = turns.map((from) => relabel.get(normalized[from])).join('');
    for (let pre = 0; pre < 4; pre++) {
      forms.push(llIndices.map((i) => turned[i]).join(''));
      turned = u.map((from) => turned[from]).join('');
    }
  }
  return forms.sort()[0] ?? '';
}
export function oracleReturnRegrip(moves: readonly Move[]): Move[] {
  const ending = replay(solved, moves), centerKey = (state: string) => [4, 13, 22, 31, 40, 49].map((i) => state[i]).join('');
  const queue: Move[][] = [[]], seen = new Set<string>();
  while (queue.length) {
    const next = queue.shift();
    if (!next) break;
    const key = centerKey(replay(ending, next));
    if (key === 'URFDLB') return next;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const family of ['x', 'y', 'z'] as const) queue.push([...next, { family, amount: 1 }]);
  }
  throw Error('No proper return to the held centers.');
}
export function zbllUniverse(): string[] {
  const corners = ['UFR', 'URB', 'UBL', 'ULF'].map(indices), result: string[] = [];
  for (const base of llBases()) for (let code = 0; code < 27; code++) {
    const co = [code % 3, Math.floor(code / 3) % 3, Math.floor(code / 9) % 3];
    co.push((6 - co.reduce((sum, value) => sum + value, 0)) % 3);
    const chars = [...base];
    corners.forEach((group, location) => group.forEach((destination, sticker) => {
      const source = group[(sticker + (co[location] ?? 0)) % 3];
      if (source === undefined) throw Error('Bad independent corner coordinate.');
      chars[destination] = base[source] ?? '';
    }));
    result.push(chars.join(''));
  }
  return result;
}
function alphaInput(file: string, hash: string): string {
  const bytes = readFileSync(`docs/data/zbll-source-evidence/${file}`);
  if (createHash('sha256').update(bytes).digest('hex') !== hash) throw Error('Missing or corrupt pinned AlphaSheep input. No network fallback.');
  return bytes.toString('utf8');
}
function table(name: string): Map<string, number[]> {
  const text = alphaInput('alpha-cube.js.txt', 'f0955d2da937493da59b5c7b5351589d6935a587ec5640ad8e2dbe24e01c33aa');
  const block = text.match(new RegExp(`var ${name} = \\{([^}]+)\\}`))?.[1];
  if (!block) throw Error('Missing pinned AlphaSheep definition.');
  return new Map([...block.matchAll(/'([^']+)': \[([0-9,]+)\]/g)].map((record) => [record[1] ?? '', (record[2] ?? '').split(',').map(Number)]));
}
// Decode the published piece/sticker definitions geometrically, without its UI code.
export function alphaStates(): { family: string; subset: string; label: string; state: string }[] {
  const inventory: unknown = JSON.parse(alphaInput('alpha-zblls.json', 'fd3849f130be1d3dc894c1bad15f79e5f557b1cc8f364d29ec4da78a45c8df79'));
  if (!inventory || typeof inventory !== 'object') throw Error('Missing AlphaSheep inventory.');
  const coTable = table('ocll'), cpTable = table('cpll');
  const cornerNames = ['ULB', 'UBR', 'URF', 'UFL'], edgeNames = ['UB', 'UR', 'UF', 'UL'];
  const result: { family: string; subset: string; label: string; state: string }[] = [];
  for (const [family, subsets] of Object.entries(inventory)) {
    if (!subsets || typeof subsets !== 'object') throw Error('Bad source subsets.');
    for (const [subset, labels] of Object.entries(subsets)) {
      if (!Array.isArray(labels)) throw Error('Bad source labels.');
      for (const label of labels) {
        if (typeof label !== 'string') throw Error('Bad source label.');
        const co = coTable.get(family), cp = cpTable.get(subset.slice(1)), ep = label.slice(3).split('').map(Number), chars = [...solved];
        if (!co || !cp || ep.length !== 4) throw Error('Bad source coordinate.');
        cornerNames.forEach((location, to) => {
          const piece = cornerNames[cp[to] ?? -1], orientation = co[to];
          if (!piece || orientation === undefined) throw Error('Bad source corner.');
          indices(location).forEach((destination, sticker) => { chars[destination] = piece[(3 + sticker - orientation) % 3] ?? ''; });
        });
        edgeNames.forEach((location, to) => {
          const piece = edgeNames[ep[to] ?? -1];
          if (!piece) throw Error('Bad source edge.');
          indices(location).forEach((destination, sticker) => { chars[destination] = piece[sticker] ?? ''; });
        });
        result.push({ family: family === '0' ? 'PLL' : family === 'A' ? 'AS' : family === 'P' ? 'Pi' : family, subset, label, state: chars.join('') });
      }
    }
  }
  return result;
}
export function cornerOrientationKey(state: string): string {
  const forms: string[] = [];
  for (let yaw = 0; yaw < 4; yaw++) {
    let turned = geometricConjugate(state, yaw);
    for (let pre = 0; pre < 4; pre++) {
      forms.push(['UFR', 'URB', 'UBL', 'ULF'].flatMap(indices).map((i) => turned[i] === 'U' ? '1' : '0').join(''));
      turned = u.map((from) => turned[from]).join('');
    }
  }
  return forms.sort()[0] ?? '';
}
