# GitHub Pages deployment preparation

## Verdict and boundary

PASS for local P01 preparation, accepted after parent focused review and independent repetition. Git integration, workflow execution and live verification remain separate publication steps. No commit, push, remote request, deployment, account operation or production-data write was performed here.

Selected production is `https://jstarfilms.github.io/rubiks-cube-trainer/`. Source HEAD remains `0ce6597` on `build/foundation`; parent-owned tracking changes were preserved. Cross, Cross+1, F2L, OLL and PLL are the five delivered trainers. B10's isolated 493-case ZBLL library stays unchanged. B11 is blocked by the unrecovered dispatch, not built practice. ZBLL and Cross+2 readiness remain closed.

The deployment flow and absence of a database change were added to the existing foundation feature before code. No trainer generation, model, timing, semantic validator, source corpus, schema, database/export version or in-page trainer routing changed. No source curation or network research was run.

## Implementation

- Vite defaults to root. `VITE_BASE_PATH=/rubiks-cube-trainer/` selects Pages. The release manifest reads Vite's resolved base, so the standard `--base=/rubiks-cube-trainer/` build option also works. Invalid absolute/relative/protocol/encoded/traversal bases fail instead of publishing mismatched paths.
- HTML manifest/icon links and public notice/source links use Vite's base. The web manifest uses `./` for identity, start URL, scope and icon paths. These resolve relative to the published manifest, at root or the repository path. Existing `new Worker(new URL(..., import.meta.url))` construction already follows Vite's worker handling and was left unchanged.
- Registration/getRegistration use the selected scope and exact worker URL. An ancestor worker does not count as this application's controller. Manifest downloads, cache keys and offline index fallback use the worker registration scope.
- Manifest decoding requires the scoped index and unique literal in-scope paths. It rejects external/protocol-relative URLs, sibling prefixes, dot segments, percent-encoded escapes, backslashes, query/fragment paths, whitespace/control characters, invalid lengths and non-SHA-256 evidence. Downloads reject redirects; exact SHA-256 and length verification remains mandatory.
- Asset caches are `cube-trainer-assets-${encodeURIComponent(base)}-${releaseId}`. Root, repository and other scopes cannot reuse one another's release cache. No cache is deleted. Legacy root caches and old release caches remain for coherent old clients. Personal IndexedDB and disposable solver tables retain their existing separation. Applications on the same origin still share the existing personal database names; moving from localhost to Pages does not transfer history.
- Fetch handling ignores non-GET, foreign-origin and out-of-scope paths. Safe-update membership checks and locks cover only windows in this scope. Preparation, inspection, arming, execution, pending/failed saves and dialogs keep their existing guards. No automatic activation or claim was added.
- The official workflow runs on main pushes or manual dispatch, uses Node 24 and pnpm 10.33.2, installs the frozen lockfile, builds with the repository base, uploads the official Pages artifact and deploys it. Build permissions are contents/read and pages/read; deployment has pages/write and id-token/write. Deployment concurrency does not cancel an in-progress release. Parent must select GitHub Actions as the repository's Pages source.
- The bundle inspector resolves published URLs to `dist` by stripping the resolved base, not by treating the repository prefix as a disk directory. It retains the covered cubing source/archive comparison and conflict checks, verifies eleven old/accepted raw input pins and all four public/dist/documentation case MIT notices. Separate SW/manifest hash evidence is included because these bootstrap files are not self-hashed manifest assets.

No SPA router or Pages 404 fallback was added. The Pages-like server serves only actual files under `/rubiks-cube-trainer/`; unknown online paths return 404. The installed scoped worker supplies disconnected navigation fallback after setup.

## Verification and actual failures

All builds, browser commands and update exercises ran serially. Chrome was installed desktop `154.0.8037.95`, Windows, Node `24.16.0`. Browser contexts were isolated, not a personal profile. New Pages exercises use real hold/release timing and generated/saved records, without seeded history or accelerated clocks.

Two preparation failures occurred:

1. First lint failed with `no-control-regex` on the explicit control-character range in the new path validator. Character-code checks replaced that range. Lint and both strict TypeScript projects then passed. No rule was disabled.
2. First environment-based Pages inspector build failed the base validator. Git Bash had rewritten `/rubiks-cube-trainer/` to `C:/Program Files/Git/rubiks-cube-trainer/`. Direct environment inspection reproduced that conversion. `MSYS2_ENV_CONV_EXCL=VITE_BASE_PATH` preserved the literal URL path and the unchanged strict validator passed. PowerShell and Linux workflow environment variables do not need that Git Bash exception.

No P01 unit or browser assertion failed. Exact-text edit calls that rejected ambiguous matches made no file change; smaller replacements corrected them. An initial broad read-only filesystem inspection timed out and was replaced with bounded reads. These are tooling events, not hidden PASS results.

| Actual command | Result |
| --- | --- |
| `pnpm lint && pnpm typecheck` | PASS after the regex correction; repeated after final code/test/config edits. App/tests and service worker checked. |
| `pnpm exec vitest run tests/unit/pwa.test.ts tests/unit/pwa-scope.test.ts` | PASS, 38 tests in two files, initial and final runs. |
| `pnpm exec vitest run tests/unit/pwa.test.ts tests/unit/pwa-scope.test.ts tests/unit/case-libraries.test.ts tests/unit/interchange.test.ts tests/unit/storage.test.ts tests/unit/timer.test.ts tests/unit/cross-client.test.ts tests/unit/cross-one-client.test.ts tests/unit/f2l-client.test.ts tests/unit/ll-client.test.ts tests/unit/ll-boundaries.test.ts` | PASS, 162 tests in eleven files, 22.43 s. Includes retained 41/57/21 source/default checks, storage/import/future gates, timer and worker ownership/correspondence. |
| `node tests/helpers/bundle-evidence.mjs node_modules/.cache/p01-root-bundle.json` | PASS, root client/SW builds, all 52 assets and eleven pins, four MIT copy sets and covered-source inspection. Rebuilt after root update tests. |
| `pnpm exec playwright test tests/browser/foundation.spec.ts tests/browser/cross.spec.ts tests/browser/update-contract.spec.ts tests/browser/cross-update.spec.ts --reporter=list` | PASS, 15 retained root tests, 3.2 min. |
| `pnpm exec playwright test tests/browser/timer.spec.ts tests/browser/f2l.spec.ts tests/browser/review.spec.ts --grep 'real Space\|Space works\|strict first Space\|pointer hold\|mixed OLL/PLL\|real player agrees\|first-use never-opened' --reporter=list` | PASS, seven retained root tests, 44.8 s. |
| `MSYS2_ARG_CONV_EXCL=--base= pnpm exec vite build --base=/rubiks-cube-trainer/` | PASS, standard resolved Vite CLI base; direct final-file verification passed all 52 scoped hashes/lengths and scoped index membership. |
| `MSYS2_ENV_CONV_EXCL=VITE_BASE_PATH VITE_BASE_PATH=/rubiks-cube-trainer/ node tests/helpers/bundle-evidence.mjs docs/audits/GitHub_Pages_Bundle_Evidence.json node_modules/.cache/p01-root-bundle.json` | PASS, Pages client/SW builds and full bytes/pins/notices/source inspection, repeated after the last update exercise. |
| `MSYS2_ENV_CONV_EXCL=VITE_BASE_PATH VITE_BASE_PATH=/rubiks-cube-trainer/ pnpm exec playwright test --config playwright.pages.config.ts --reporter=list` | PASS, seven new actual production-subpath browser tests, initial 2.2 min and final 2.8 min. |
| Read-only `git diff --check`, protected-path diff and final evidence/dist identity/hash check | PASS. Parent tracking files remain outside implementer writes. LF/CRLF checkout warnings only. |

The 162-unit result includes the 38 focused PWA tests, not 200 distinct tests. Browser coverage is 22 distinct root tests and seven distinct Pages tests; the repeated Pages pass does not increase coverage. Neither the full historical aggregate browser suite nor the unchanged exhaustive ZBLL/LL mathematical suites was rerun for path-only preparation. Their accepted evidence and historical failures remain in the existing audits.

Root tests retain actual cold offline shell/generation/player use, cache eviction/corruption/repair, personal-data probes, interrupted installation, restore rollback/staleness, mixed OLL/PLL/F2L guidance, Space without timer focus, native focus ownership, pointer/touch emulation and all-tab safe updates. Original assertions and timeout values remain. The retained update-contract test now uses the existing prepared-release fixture instead of compiling during its timed exercise; it still checks every active/save phase and deferred-start lock.

Pages tests prove the actual scoped registration and public URLs, online 404 behavior, and disconnected cold navigation. Each of the five never-opened trainers initializes its real model/library/worker, generates practice, saves through real keyboard/controller/IndexedDB paths, exports a real backup and opens its never-rendered player offline. Independent geometric replay checks the actual presented state and solution; PLL reaches exactly solved/aligned. Reload retains the saved record. OLL/PLL runs retain their genuine plan/cursor/link. These are one-rep deployment checks, not new full-set or physical-solve certification.

The scope test deliberately puts an out-of-scope response into this application's cache, then confirms a controlled page's outside fetch uses the actual server and fails when disconnected instead of consuming those bytes. An outside navigation still opens the other application. The update test keeps that unrelated window open, blocks activation during a real Cross execution, acknowledges the actual save, then activates and retains the exact history through offline reload. Other-app/root cache sentinels and the old owned release cache survive. Root update tests also retain all original activity/dialog/multi-tab/deferred-start checks.

Alternate release preparation occurs before timed update exercises. Observed preparation was 24,738 ms for root Cross, 9,750 ms for root foundation, 11,189 ms for root contract, and 19,029/15,507 ms for Pages initial/final updates. No timeout was raised. Local logs are ignored under `node_modules/.cache/p01-*`; traces would be retained on failure.

## Final bundle evidence

[GitHub_Pages_Bundle_Evidence.json](GitHub_Pages_Bundle_Evidence.json) contains final Pages evidence and a separate root-build snapshot, including every published asset SHA-256/length, SW/manifest hashes, raw input pins and covered-source matches.

| Build | Release | Assets / inspected chunks | Raw manifest asset bytes | gzip / Brotli bytes |
| --- | --- | --- | ---: | ---: |
| Root `/` | `review-1790949219688` | 52 / 13 | 9,538,733 | 7,688,121 / 7,590,163 |
| Pages `/rubiks-cube-trainer/` | `review-1790949469919` | 52 / 13 | 9,539,053 | 7,688,189 / 7,589,994 |

These totals cover manifest-required assets, including the unchanged local source archive and notices, but exclude the separately recorded bootstrap SW/manifest. Final Pages executable assets are 2,433,596 raw bytes; application assets without the source archive are 2,486,334 bytes. Initialization remains cube model, player module, generation scaffold, Cross table, Cross+1 pair model, actual 41-case F2L and 57/21 LL libraries. No ZBLL readiness task or executable library import was added. Source-rights conflict inspection is empty.

Final Pages `sw.js` is 5,890 bytes, SHA-256 `9ff5b5d89ae8513c51436b87308a0072e3801cc2b746b710d857d302d93ebe10`. `release-assets.json` is 8,868 bytes, SHA-256 `fc3cf89c801325596b1521287f2ac3807f6a6251f27bc0530c5cce7a53204b0b`. Final dist is the intended Pages build, not a test alternate or root rebuild. A subsequent build gets a new release ID unless `RELEASE_ID` is supplied; parent must refresh evidence if publishing different bytes.

The existing main-chunk warning above 500 kB remains. Passing desktop checks does not certify phone memory/latency. Historical intermittent model-readiness/history-hydration waits remain documented, not diagnosed or fixed by this scope change.

## Changed paths and remaining checks

Implementation paths are `.github/workflows/pages.yml`, `vite.config.ts`, `index.html`, `public/manifest.webmanifest`, `src/app/App.tsx`, `src/pwa/client.ts`, `manifest.ts`, `sw.ts`, new `scope.ts`, `tests/helpers/bundle-evidence.mjs`, new `pages-server.mjs`, `tests/browser/update-contract.spec.ts`, new `pages.spec.ts`, new `tests/unit/pwa-scope.test.ts`, `playwright.config.ts`, new `playwright.pages.config.ts`, README, the foundation feature and these two audit artifacts. No dependency/lockfile, license/source/data, pure trainer, store or timer path changed. Parent owns task/status/issue tracking and Git.

Live GitHub workflow/action permissions, Pages artifact delivery, HTTPS worker headers, actual public-origin install/setup/offline/update and status issue publication are unrun here. Physical iPhone Safari/Android Chrome, Firefox/Safari, OS-installed PWA restart/update, screen readers, real audio, physical touch/solve, GPU/thermal and phone performance checks remain unrun. No live success is claimed.

## Parent build and deploy commands

First review/accept the diff and select GitHub Actions as the repository's Pages source. Build and repeat Pages verification in PowerShell:

```powershell
pnpm install --frozen-lockfile
$env:VITE_BASE_PATH = '/rubiks-cube-trainer/'
pnpm build
pnpm exec playwright test --config playwright.pages.config.ts --reporter=list
node tests/helpers/bundle-evidence.mjs docs/audits/GitHub_Pages_Bundle_Evidence.json node_modules/.cache/p01-root-bundle.json
```

The final inspector restores Pages dist after update tests. Its optional third argument uses the locally verified root snapshot; omit it on a fresh checkout unless root evidence has first been built. Root verification requires removing `VITE_BASE_PATH` first. Git Bash equivalents above include the MSYS exception; Linux workflow environment does not need it.

After parent-owned commit/review, the authorized main push triggers deployment. Manual dispatch is available after the workflow reaches main:

```sh
git push origin HEAD:main
gh workflow run pages.yml --repo jstarfilms/rubiks-cube-trainer --ref main
gh run list --repo jstarfilms/rubiks-cube-trainer --workflow pages.yml --limit 5
gh run watch <actual-run-id> --repo jstarfilms/rubiks-cube-trainer --exit-status
```

Use either the push-triggered run or a manual run, not both unnecessarily. Parent must verify that actual run and `https://jstarfilms.github.io/rubiks-cube-trainer/` before recording deployment success. Final local dist mode is `/rubiks-cube-trainer/`.

## Parent acceptance

Parent reviewed the workflow, strict scope/path validation, manifest/cache/fetch/update isolation and unchanged trainer/data boundary. Parent independently ran lint/typecheck and 80 tests across PWA, scope, storage and LL-boundary suites, all PASS, then all seven Pages browser flows, PASS in 2.0 minutes. Parent restored a normal Pages build through the full source/byte inspector. Final local evidence is now release `review-1790950188934`, 52 assets, with retained root snapshot, eleven pinned inputs and all four exact public/dist/docs MIT notice sets. This supersedes the implementer's earlier local snapshot only as the current local build, not its historical passing runs.

Using the owner's confirmed repository and production URL, parent configured GitHub Pages `build_type=workflow`. The API returned https://jstarfilms.github.io/rubiks-cube-trainer/. This is site configuration, not a successful deployment. Actual push, workflow and public-origin verification still follow. B11 remains blocked and ZBLL practice is not part of this release.
