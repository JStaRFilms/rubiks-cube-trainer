import { build } from 'vite';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
const chunks = [];
await build({ plugins: [{
  name: 'inspect-bundle-evidence', enforce: 'post',
  generateBundle: { order: 'post', handler(_, bundle) {
    for (const item of Object.values(bundle)) {
      if (item.type !== 'chunk') continue;
      chunks.push({ file: item.fileName, imports: item.imports, dynamicImports: item.dynamicImports, modules: Object.keys(item.modules).map((id) => id.replaceAll('\\', '/').replace(/^.*?\/node_modules\//, 'node_modules/').replace(process.cwd().replaceAll('\\', '/') + '/', '')) });
    }
  } },
}] });
const manifest = JSON.parse(readFileSync('dist/release-assets.json', 'utf8'));
const assets = manifest.assets.map((asset) => {
  const bytes = readFileSync(`dist${asset.url}`), sha256 = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== asset.byteLength || sha256 !== asset.sha256) throw new Error(`Manifest does not describe final emitted bytes: ${asset.url}`);
  return { ...asset, gzipBytes: gzipSync(bytes).length, brotliBytes: brotliCompressSync(bytes).length };
});
const urls = new Set(assets.map((asset) => asset.url));
for (const file of readdirSync('dist/assets')) if (!urls.has(`/assets/${file}`)) throw new Error(`Uncached emitted asset: ${file}`);
for (const chunk of chunks) for (const file of [...chunk.imports, ...chunk.dynamicImports]) if (!urls.has(`/${file}`)) throw new Error(`Uncached chunk dependency: ${file}`);
const sources = new Set();
for (const id of new Set(chunks.flatMap((chunk) => chunk.modules))) {
  if (!id.includes('/cubing/dist/') || !id.endsWith('.js')) continue;
  for (const match of readFileSync(id, 'utf8').matchAll(/^\/\/ (src\/cubing\/[^\n]+)/gm)) sources.add(match[1]);
}
const sourceMatches = [];
const requiredSources = ['src/cubing/alg/parseAlg.ts', 'src/cubing/alg/Alg.ts', 'src/cubing/puzzles/implementations/dynamic/3x3x3/3x3x3.kpuzzle.json.ts', 'src/cubing/twisty/views/3D/puzzles/Cube3D.ts'];
for (const file of readdirSync('node_modules/cubing/dist/lib/cubing/chunks').filter((file) => file.endsWith('.map'))) {
  const map = JSON.parse(readFileSync(`node_modules/cubing/dist/lib/cubing/chunks/${file}`, 'utf8'));
  for (const [i, name] of map.sources.entries()) {
    const path = name.slice(name.indexOf('src/'));
    if (!requiredSources.includes(path)) continue;
    const archive = execFileSync('tar', ['-xOf', 'public/licenses/cubing-0.63.8-source.tgz', `cubing.js-${manifest.engineSource}/${path}`]);
    if (archive.toString() !== map.sourcesContent[i]) throw new Error(`Artifact/source discrepancy: ${path}`);
    sourceMatches.push({ path, sha256: createHash('sha256').update(archive).digest('hex') });
  }
}
if (sourceMatches.length !== requiredSources.length) throw new Error('Required covered sources were not matched.');
const conflicts = [...sources].filter((source) => /vendor\/(mit\/cs0x7f|mpl\/(xyzzy|twips))|^src\/cubing\/(search|scramble)\//.test(source));
if (conflicts.length) throw new Error(`Additional source-rights inspection required: ${conflicts.join(', ')}`);
const totals = (list) => ({ rawBytes: list.reduce((n, a) => n + a.byteLength, 0), gzipBytes: list.reduce((n, a) => n + a.gzipBytes, 0), brotliBytes: list.reduce((n, a) => n + a.brotliBytes, 0) });
const evidence = { releaseId: manifest.releaseId, engine: manifest.engine, engineSource: manifest.engineSource, engineIntegrity: manifest.engineIntegrity, initialization: manifest.initialization, totals: totals(assets), executable: totals(assets.filter((a) => a.url.endsWith('.js'))), applicationWithoutSourceArchive: totals(assets.filter((a) => !a.url.endsWith('.tgz'))), assets, chunks, cubingSourcesInReachableArtifactModules: [...sources].sort(), sourceRightsConflicts: conflicts, artifactSourceMatches: sourceMatches };
writeFileSync('docs/audits/cube-bundle-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ totals: evidence.totals, executable: evidence.executable, applicationWithoutSourceArchive: evidence.applicationWithoutSourceArchive, assets: assets.length, chunks: chunks.length, sourceRightsConflicts: conflicts }, null, 2));
