# Cube Trainer foundation

B01 is a local-data and PWA foundation, not a working trainer. Settings, named trainer-specific sessions, local backup/restore and offline shell setup work. The clock is unavailable. No attempts, statistics, verified scrambles, timer, solver, player or case library are seeded or advertised as delivered.

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

Open `http://127.0.0.1:4173`. In Help, open Local data, choose Set up / retry shell, then Reload to finish setup. Readiness checks cached bytes and a local database write/read/delete probe. "Offline shell ready" does not mean player or training assets are available. Install through the browser's install menu, or Share and Add to Home Screen on iPhone. A secure origin is required outside localhost. No hosting or deployment is configured.

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

Every build emits `release-assets.json` with a release ID, cube contract, absent engine/dataset/table versions and each shell asset's SHA-256 and byte length. The custom service worker retains completed downloads in a release-specific cache, verifies every required asset and the navigation fallback, and allows retry after interruption. Verification is cache-only. Actual connectivity is never proof of readiness. The app checks that its embedded release ID matches the controlling worker.

Updates download into a separate cache. There is no automatic `skipWaiting`, client claiming or reload during practice. User-confirmed activation asks every open tab to acquire an idle lock and verifies the same client membership before activation. Preparation, inspection, arming, execution, save-pending, save-failed and editing block activation. Every future timer or editing controller must use `enterActivity`, including deferred starts; it rejects starts while an update token is held. Missing replies or changed tabs cancel activation. Only locked idle clients reload. Old release caches are retained so old tabs do not lose their chunks; cache cleanup is deferred.

B02 must extend this manifest to every emitted player/model/worker/lazy dependency and its required initialization tasks, pin engine/dataset/table versions, and prove cache-only unopened-player and initialization checks. The foundation's manifest cannot be relabeled as trainer readiness.

## Verification limits

Checks run on Windows with installed desktop Chrome 154.0.8037.59. Responsive viewports include 320, 390, 768, 900, 901, 1440 and 1920 CSS px. Desktop browser coverage does not prove iOS/Android behavior. Physical iPhone Safari, Android Chrome, Firefox, desktop Safari, screen readers, touch hardware and an actual OS-installed PWA restart remain unrun. Cold offline navigation and a new browser tab in the same isolated context are tested. No deployment or production data was touched.

The feature/data contract is in [Trainer foundation](docs/features/Trainer_Foundation.md). Later Build slices remain separate; do not start B02 from this README.
