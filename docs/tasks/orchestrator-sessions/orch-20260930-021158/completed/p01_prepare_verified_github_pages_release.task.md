# Task P01: Prepare verified GitHub Pages release

## Accepted preparation result

PASS, parent accepted focused code review, lint/typecheck, 80 relevant units, all seven production-subpath browser flows and normal Pages build/source/notice inspection. Coder separately passed 162 units, 22 root regressions and repeated seven Pages flows. Final local 52-asset release `review-1790950188934`; root snapshot retained. Exact target Pages source configured by parent, but push/workflow/live success is not yet claimed. Existing source/models/data/schemas/timing and blocked B11 remain unchanged. Parent subsequently pushed `4d1f4ce`, verified successful Pages run 37019910747/all 52 live assets/public HTTPS offline smoke, and opened issue #1. See `docs/audits/GitHub_Pages_Publication.md`. Preparation and actual publication evidence remain distinct; B11 stays blocked.

## Agent setup

Vibe Build, coder `openai-codex/gpt-6.1-sol`, high effort, conversation `coder-pages`. Single main-checkout writer. Use unslop. Parent owns tracking/Git/GitHub/deployment and issue publication. No accounts/credentials/network/remote mutations by coder.

## Prime context

Read `README.md`, `docs/features/Trainer_Foundation.md`, `docs/audits/B01_Foundation_Handoff.md`, `docs/audits/Time_Attack_Integration.md`, `docs/audits/ZBLL_Library_Verification.md`, `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`; actual `vite.config.ts`, `index.html`, public web manifest/icons, `src/pwa/{client,manifest,sw,activity}.ts`, worker URL construction and `src/app/App.tsx`; `tests/unit/pwa*.test.ts`, actual existing PWA tests, browser foundation/update/cold-cache flows, `tests/helpers/{browser-server,bundle-evidence}.mjs`, `update-release.ts`, package/test configs. Locate narrowly within these named modules if filenames differ. Read actual code before edits.

## Objective and authorization

Owner explicitly requests push, deployment, current orchestration docs and one comprehensive GitHub status issue. They selected GitHub Pages production at `https://jstarfilms.github.io/rubiks-cube-trainer/`. Add and verify scoped deployment support for the already verified release. Do not implement ZBLL practice while publishing.

## Current source

HEAD `0ce6597`, branch `build/foundation`, eight commits ahead of origin/main `973a879`. Parent tracking edits are expected. B10 isolated 493-case library is accepted, existing actual trainers are Cross/Cross+1/F2L/OLL/PLL only. B11 async status was missing and no code/report landed; it is blocked and Q04 pending. No native async writer remains. Preserve sources/versions/strict semantic gates, source notices and prior failures/device limits. No source research or curation.

## Scope

1. Document deployment goal/client/build/PWA flow and absence of database schema change in the existing foundation feature documentation before code. Add minimal GitHub Actions Pages workflow for main/manual runs using pinned package-manager 10.33.2, Node >=22.12, frozen lockfile, build and upload/deploy official Pages actions, required least permissions and deployment concurrency. Parent enables site and pushes. No new dependency, hosting account or remote call.
2. Support configured repository base `/rubiks-cube-trainer/` while preserving normal root dev/preview/build. Prefer Vite's base conventions, avoid a general routing layer. Correct index/icons/web manifest start URL/scope, actual module workers/player and required public asset URLs. App uses in-page navigation, do not invent SPA routing/404 features.
3. Correct release manifest asset URLs/hash/disk-path handling, strict decoder expected index/scoped paths, service-worker registration/getRegistration, manifest fetch/cache/navigation fallback and update behavior. Worker cannot intercept out-of-scope requests or delete another app scope's caches. Keep same-origin path checks strict against protocol-relative/traversal/encoded escape paths. Namespaced caches as necessary, without changing personal DB/export data or weakening asset SHA/length checks. Root compatibility and existing safe-update/activity rules remain.
4. Include every existing model/player/table/library/notice/source archive in verified offline assets. Scope stays Cross/Cross+1/F2L/OLL/PLL, no ZBLL trainer/readiness claim. Source rights/bytes unchanged. Update bundle inspector only as needed to resolve URL base to actual dist paths correctly.
5. Add focused base/path/manifest/scope/cache isolation regression tests and real production-hosted-subpath browser proof. Use local server that actually serves `/rubiks-cube-trainer/` as Pages would. Verify shell/worker registration, actual model/library initialization/offline readiness, disconnected cold use, actual practice/review/save, and update retention if update routing changes. Preserve old deadlines/assertions and initial FAILs; no fake history or clock acceleration. Existing root-input/mixed-guidance/cache/update behavior must remain.

## Definition of done

Root and repository-subpath builds are valid and asset hashes/lengths/notices match. Actual scoped browser setup, workers/player/practice/offline/navigation/cache isolation work without data loss or premature update. Root regression checks pass. Workflow is ready for parent GitHub deployment, no deployment success invented. No old source/version/schema/timing/identity changes or B11 code.

## Expected artifacts

Focused build/PWA/base changes, `.github/workflows` Pages workflow, proportionate regression tests, README/foundation deployment notes, `docs/audits/GitHub_Pages_Deployment_Preparation.md` with actual evidence/failures and `docs/audits/GitHub_Pages_Bundle_Evidence.json`. Reports separate root/subpath release/build results and unrun live/physical checks. Final dist must be the intended Pages build or explicitly state root rebuild and parent rebuild command.

## Verification and constraints

Run lint/typecheck/focused changed units, root relevant PWA/input/mixed regressions, root and Pages builds and source/asset inspector, genuine scoped production browser/offline/update flows serially. Alternate release preparation happens outside timed exercises, restore intended dist afterward. No blanket timeout increases or assertion deletion. Keep attribution and exact Windows-safe raw-source/MIT bytes; do not add library data to production or use optional GPL/search imports. No unrelated redesign/performance cleanup, dependencies, worktrees, teaching/research/sync, Git/index/commit/push/branch, parent task/master/index/summary/board writes or remote deployment. Parent will review/repeat focused checks and deploy only after acceptance.

## Dependencies and handoff

B10 accepted, owner publishing request/Pages destination confirmed, B11 paused. Parent tracking may change in distinct session docs while you write implementation. Return PASS/FAIL/BLOCKED, exact changed paths/commands/root versus subpath test counts, cache/manifest/backward-compatibility choices, actual release evidence and precise parent build/deploy instructions. On missing access, material scope or confirmed defect stop with evidence; do not invent success or relaunch other agents.
