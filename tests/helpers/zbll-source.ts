import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

export interface ZBLLSourceDefault { family: string; subset: string; label: string; algorithm: string; sourceLine: number }
// Trusted source-only spelling normalization. Personal notation remains strict.
// Three clockwise quarter turns are one counter-clockwise quarter turn.
export function sourceNotation(entry: ZBLLSourceDefault): string {
  if (entry.family === 'Pi' && entry.subset === '4' && entry.label === 'OsA') return entry.algorithm.replace(/\bR3\b/g, "R'");
  return entry.algorithm;
}
export function zbllSourceDefaults(): ZBLLSourceDefault[] {
  const bytes = readFileSync('tests/fixtures/case-sources/zbtrain-algorithms.js.txt');
  if (bytes.length !== 196120 || createHash('sha256').update(bytes).digest('hex') !== '0fd439dccfa05a42316dcfad69b74a848378b78c08a3ee0b5b361ce94bc87bdb') throw Error('Missing or corrupt pinned ZBTrain input. No network fallback.');
  const source = ts.createSourceFile('zbtrain.js', bytes.toString('utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations).find((item) => ts.isIdentifier(item.name) && item.name.text === 'zbllAlgs');
  if (!declaration?.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) throw Error('Missing source inventory.');
  const result: ZBLLSourceDefault[] = [];
  for (const family of declaration.initializer.properties) {
    if (!ts.isPropertyAssignment(family) || !ts.isIdentifier(family.name) || !ts.isObjectLiteralExpression(family.initializer)) throw Error('Unsupported source family.');
    for (const subset of family.initializer.properties) {
      if (!ts.isPropertyAssignment(subset) || (!ts.isIdentifier(subset.name) && !ts.isStringLiteral(subset.name) && !ts.isNumericLiteral(subset.name)) || !ts.isObjectLiteralExpression(subset.initializer)) throw Error('Unsupported source subset.');
      for (const entry of subset.initializer.properties) {
        if (!ts.isPropertyAssignment(entry) || !ts.isIdentifier(entry.name) || !ts.isArrayLiteralExpression(entry.initializer)) throw Error('Unsupported source case.');
        const first = entry.initializer.elements[0];
        if (!first || !ts.isStringLiteral(first)) throw Error('Missing source default.');
        result.push({ family: family.name.text, subset: subset.name.text, label: entry.name.text, algorithm: first.text, sourceLine: source.getLineAndCharacterOfPosition(first.getStart(source)).line + 1 });
      }
    }
  }
  return result;
}
