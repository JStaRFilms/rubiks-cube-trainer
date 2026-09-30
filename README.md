# Cube Trainer move review

Settings, named sessions, local backup/restore and offline move review work. Open Move review, enter an optional setup from solved and a move sequence, then choose Validate and review. The tool expands groups and commutators into canonical text. Invalid input leaves the current review unchanged. Play/pause, forward/back, speed, replay, drag orbit and pinch/scroll zoom use the locally bundled player. Reduced motion starts with text-only steps and disables playback. No generated challenges, timer, statistics, history or case library are supplied.

The workspace uses the 248 px slate/mono desktop dock above 900 CSS px and the graphite/sans mobile layout with an 86 px session shelf at or below 900 px. The archived HTML prototypes are not imported.

## Local setup

Use Node 22.12 or newer and pnpm 10.33.2, pinned in package.json. Development here uses Node 24.16.0. Keep pnpm-lock.yaml as the only dependency lockfile. Dependency build scripts are allowed only for esbuild and Tailwind's native oxide package.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Vite serves development on localhost. PWA checks use the production build, not the development server.

```sh
pnpm build
pnpm preview --port 4173
```

Open `http://127.0.0.1:4173`. In Help, open Local data, choose Set up / retry review, then Reload to finish setup. Readiness checks cached bytes and a local database write/read/delete probe. "Offline review ready" covers the cube model, player chunks and a worker scaffold that explicitly reports unsupported generation. It does not claim a ready trainer or solver. Install through the browser's install menu, or Share and Add to Home Screen on iPhone. A secure origin is required outside localhost. No hosting or deployment is configured.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
```

Typecheck covers both browser and service-worker TypeScript. Vitest tests persistence, file validation, rollback/migration fixtures and update activity locks. Playwright uses installed Google Chrome through `channel: 'chrome'`; no browser download is required. Install Chrome if it is unavailable.

The browser script starts production preview on 4173 and a test-only contract server on 4174. Both ports must be free. Each test uses an isolated browser context, not a personal Chrome profile. Update tests rebuild only generated `dist/` assets with a new release ID. The contract fixture bundles the real PWA/activity modules to exercise future attempt phases without implementing a pretend timer. It is not shipped in the production build. Run `pnpm build` again after browser tests if you want a fresh preview release. Traces from failures are in ignored `test-results/`.

## Personal data

`cube-trainer`, database version 1, has settings, sessions, attempts, personalAlgorithms, practiceSets and runs. `cube-trainer-solver`, version 1, holds only disposable tables. Opening or updating the shell never deletes either database. Zustand holds only transient activity/update locks.

Repository writes resolve only after the IndexedDB transaction commits. Settings/session UI reports saved only after acknowledgement. An attempt write requires a compatible semantic validator and can atomically write its run outcome. B01 deliberately does not bundle that cube validator. Backups with nonempty attempts, algorithms, sets or runs fail with a prerequisite error before replacement. B02 and later case slices must supply actual compatible engine/dataset validation, not trust imported validation flags. The attempt tests use an explicit storage fixture validator; they are not cube correctness evidence.

Backup format version 1 is separate from the database version. Export reads all six personal stores in one transaction and excludes revision metadata, disposable tables and application caches. Restore validates the whole file, previews all group counts, offers a current backup and requires explicit replacement confirmation. It rechecks the transaction revision across tabs, then clears and inserts the six stores atomically. A failure aborts replacement. Clear personal data uses the same confirmed path. No automatic merge is supported.

File limits are 20 MiB, 100,000 records per group, 10,000 moves per list, nesting depth 32 and 64 KiB per string. These are bounded validation limits, not a phone-performance guarantee. Current migration evidence covers the only real predecessor, version 0, upgrading to v1, an aborted forward-upgrade fixture retaining old records, and rejection of newer databases without reset. There is no invented historical application schema.

Browser storage can be evicted or cleared. Keep file backups. Persistent-storage requests display the browser's grant or denial, not a durability promise. Quota/write errors leave the prior saved state intact and visible. If another tab blocks an upgrade, close that Cube Trainer tab and retry. Do not clear storage to bypass a version error.

## Offline releases and updates

Every build emits `release-assets.json` with a release ID, cube contract, pinned cubing engine/version/source/integrity, absent dataset/table versions and each required asset's SHA-256 and byte length. This includes all lazy model/player/worker chunks and local notices/source access. Manifest hashes describe final emitted bytes after Vite import rewriting. The custom service worker retains completed downloads in a release-specific cache, verifies every required asset and the navigation fallback, and allows retry after interruption. Verification is cache-only. Actual connectivity is never proof of readiness. The app checks that its embedded release ID matches the controlling worker.

Updates download into a separate cache. There is no automatic `skipWaiting`, client claiming or reload during practice. User-confirmed activation asks every open tab to acquire an idle lock and verifies the same client membership before activation. Preparation, inspection, arming, execution, save-pending, save-failed and editing block activation. Every future timer or editing controller must use `enterActivity`, including deferred starts; it rejects starts while an update token is held. Missing replies or changed tabs cancel activation. Only locked idle clients reload. Old release caches are retained so old tabs do not lose their chunks; cache cleanup is deferred.

Setup verifies cache contents, storage, the real cube model, player module registration and the worker's unsupported-generation boundary. It never opens a renderer to claim readiness. Installed-Chrome tests open a never-used renderer after disconnecting and navigating in a new page. Source archive and notices are linked in Local data and retained offline under `public/licenses`. The selected cubing MPL route covers the emitted review code only. Optional solvers need another rights check.

Run `node tests/helpers/bundle-evidence.mjs` to rebuild, verify final manifest bytes and chunk reachability, compare covered sources with the pinned artifact's source maps, and record raw/gzip/Brotli sizes in `docs/audits/cube-bundle-evidence.json`. Browser timings, sampled memory, source constraints and manual-device gaps are recorded in [Cube tools integration](docs/audits/Cube_Tools_Integration.md).

## Verification limits

Checks run on Windows with installed desktop Chrome 154.0.8037.59. Responsive viewports include 320, 390, 768, 900, 901, 1440 and 1920 CSS px. Desktop browser coverage does not prove iOS/Android behavior. Physical iPhone Safari, Android Chrome, Firefox, desktop Safari, screen readers, touch hardware and an actual OS-installed PWA restart remain unrun. Cold offline navigation and a new browser tab in the same isolated context are tested. No deployment or production data was touched.

The feature/data contract is in [Trainer foundation](docs/features/Trainer_Foundation.md). Generation/timing, complete trainer backup semantics, datasets and video recognition remain undelivered. Synthetic reconstruction fixtures prove interchange only. This integration was prepared with LLM assistance; it is not an upstream cubing.js contribution.
