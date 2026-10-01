# Cube Trainer

Cross practice works with maximum optimal depth 1 through 8 HTM, all six colors, untimed or 15-second inspection, local history/statistics, backup/confirmed restore and optimal notation/3D review. Other trainers remain unavailable. The separate Move review tool still accepts an entered setup and moves.

Choose Settings for color, maximum depth and inspection. Start Cross practice creates a real Cross session if needed. Begin each scramble with that Cross solved and aligned to its side centers. A fully solved cube also works. Hold the displayed down/front colors, apply the scramble, then solve only the Cross. If unsure after stopping, restore the Cross before Next. Other pieces in 3D are representative unless your base was fully solved. Stopping is self-reported completion, not physical solve detection.

Maximum depth is a ceiling, not exact depth. Half turns count once. These are legal practice scrambles, not uniform competition scrambles or full-cube optimal solves. The solution is revealed only after the attempt. Preparation includes scrambling and thinking, not pure planning.

Untimed timing uses a 300 ms hold and release. Strict inspection starts with a separate first action, then a later hold/release starts execution. Start at 15 seconds adds +2; at 17 seconds it is DNF. The dedicated timer accepts touch or focused Space. Settings, dialogs and player gestures do not time an attempt. Losing foreground visibility records interruption. Save failures retain the exact unsaved record for retry or clearly labeled emergency export.

## Local setup

Use Node 22.12 or newer and pnpm 10.33.2. Tested Node is 24.16.0. Keep pnpm-lock.yaml as the only dependency lockfile. No new dependencies were added for Cross.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

For PWA checks:

```sh
pnpm build
pnpm preview --port 4173
```

Open `http://127.0.0.1:4173`. Help → Local data → Set up / retry review downloads all Cross and player assets, initializes and checks the trusted table, and probes personal storage. Reload to finish setup. The ready label includes both review and Cross. Recheck cached review also rechecks the Cross table; missing/corrupt tables fail readiness. Setup rebuilds only disposable solver data, including while offline when the required code is cached. It never deletes history.

Install through the browser's install menu, or Share → Add to Home Screen on iPhone. HTTPS is required outside localhost. No hosting or deployment is configured.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
node tests/helpers/cross-benchmark.mjs
```

Typecheck includes app/tests and service worker. Playwright uses installed Google Chrome, not a downloaded browser. Production preview uses port 4173; the separate contract/timer fixture server uses 4174. Benchmark preview/development checks use 4185/4186. These ports must be free. Browser tests use isolated contexts, never a personal Chrome profile. Update tests rebuild generated dist assets, so rerun build for a new preview release.

Test-only timing fixtures, client mocks and benchmark code are not app entries or emitted app assets. Cross tests independently rotate stickers in Cartesian coordinates, check every coordinate/transition and the complete distance graph, and validate generated full states/reveals across colors and ceilings. The benchmark records actual worker/table bytes, sampled Chrome heap/backing storage, initialization, warm generation and main-thread event-loop intervals. See [Cross integration](docs/audits/Cross_Trainer_Integration.md) for actual results and limitations.

## Personal data and recovery

`cube-trainer`, database version 1, contains settings, sessions, attempts, personalAlgorithms, practiceSets and runs. The separate `cube-trainer-solver` database contains disposable tables. Neither normal setup nor updates delete personal data.

The real Cross-only semantic validator exists before App creates its Repository. It checks every saved/read/restored attempt's fields, supported versions, physical frame, legal state, scramble equality, exact optimal distance and outer-turn solution. It does not trust imported proof flags. Nonempty algorithms, sets, runs and other trainer records fail closed because their validators/datasets are unavailable. Empty future groups remain part of backup version 1.

Repository writes acknowledge transaction completion. +2/DNF/No penalty edits change only explicit penalty metadata, preserving raw durations. Removing a penalty records a manual correction. Rounded inspection times at 15/17-second boundaries do not override the timer's unrounded penalty decision. History supports confirmed deletion and latest undo. Saved result/review uses current repository records after edits/deletion/undo; confirmed restore invalidates the old presentation.

Normal backups export all six personal groups, excluding revision metadata, caches and unsaved attempts. Restore validates everything before preview, requires explicit replacement confirmation, rechecks the cross-tab revision and replaces all groups atomically. A failed/stale restore leaves old data intact. Emergency unsaved-attempt files are separately labeled and are not complete backups or normal restore inputs.

Limits remain 20 MiB per backup, 100,000 records per group, 10,000 moves per list, depth 32 and 64 KiB per string. These are validation limits, not mobile performance guarantees. Browser storage can be evicted or cleared. Keep file backups. Persistent-storage requests report actual grant/denial, not promised durability. Close another tab if it blocks an upgrade; never clear data to bypass a version error.

## Offline releases and updates

Each release manifest pins the cube contract, cubing engine/source/integrity, Cross table/HTM/frame identity and every required asset's SHA-256/length. It includes all emitted lazy model/player/worker dependencies and local notices/source. Setup verifies bytes, actual table readiness and storage without opening a renderer. A never-opened 3D review works after disconnected cold navigation in tested Chrome.

Updates download into a separate cache. User-confirmed activation asks every tab to acquire an idle lock. Preparation, inspection, arming, execution, save-pending, save-failed and dialogs block activation. Deferred presentations cannot adopt an update-locked result. Only locked idle clients reload; old caches are retained for coherent old clients. No automatic activation or database deletion.

Cubing 0.63.8 remains pinned for parser/model/player only, under the selected MPL route with local notices and covered source. Cross coordinates/search are project-owned. No cubing search/scramble or optional GPL solver imports were added. This is downstream LLM-assisted work, not an upstream cubing.js contribution.

## Verification limits

Windows desktop Chrome 154.0.8037.59 is tested, including touch emulation, production offline flows and Node/Vite development. Physical iPhone Safari, Android Chrome, Firefox, desktop Safari, assistive technology, real audio audibility and OS-installed PWA lifecycle remain unrun. Desktop heap/event-loop samples are not a phone memory, heat, battery or latency guarantee. No deployment or production data was touched.

Feature contracts are in [Cross trainer](docs/features/Cross_Trainer.md) and [Trainer foundation](docs/features/Trainer_Foundation.md). Cases, other trainers, video, accounts and sync remain undelivered and separately gated. Q01 is the next acceptance review.
