# Task B02: Integrate cube engine and offline 3D player

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Current implementation route: `openai-codex/gpt-6.1-sol`, high thinking. The owner requested continued implementation after B01 and the pnpm migration. The parent accepted the verified B01 dependency and authorizes B02 execution. Research, deployment and accounts remain outside this authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `docs/architecture/Core_Architecture.md`
- `docs/design/Training_Experience.md`
- `docs/features/Trainer_Foundation.md`
- `package.json`
- `README.md`
- `docs/audits/B01_Foundation_Handoff.md`
- `docs/design/Design_System.md`
- `src/app/App.tsx`, `src/pwa/client.ts`, `src/pwa/manifest.ts`, `src/pwa/sw.ts`, `vite.config.ts`
- Existing unit/browser tests and `src/store/validation.ts`

Read PLAN sections 4, 5, 6, 7, 8. Coverage: FR-001, FR-002, FR-012, FR-014. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Prove the selected reusable cube tools and expose one tested logical contract for generators, data, playback and later video research.

## Scope

- Integrate the chosen engine/parser and player with minimal adapters justified by actual API differences. Test face/wide/slice/rotation notation, inversion, color frames and slot conjugation.
- Implement touch orbit/zoom, play/pause, stepping, speed, replay, textual fallback and reduced-motion/error handling without timer input collisions.
- Precache required player code/assets during setup even if rendering imports lazily. Add worker request/result/cancellation scaffolding and the reconstruction interchange type/fixtures from G02.
- Measure real bundle/offline dependency behavior and basic runtime; update the reuse decision if an empirical requirement fails. No default custom renderer rebuild.

## Context

B01 now supplies the running application and tests. There was no inherited application code; historical milestone/test claims are not evidence. The owner has asked to continue implementation. Keep the interim A-desktop/B-mobile layout and defer visual polish.

On 2026-09-30 the parent queried the npm registry with pnpm. Released `cubing@0.63.8` reports `MPL-2.0 OR GPL-3.0-or-later`, source revision `d02c02fc90f3410e612315141072a47af03feb97`, integrity `sha512-suliTEg6p+PgyFcGtp3Y2NLd8gHnZFKYa5+Wd2HK7ciKuQOIuvRiM/on6HTVQuAxz2cNB/7WedgfUjQ1kR0kcA==` and Node >=22.3.0. Inspect the actual installed artifact, exported types and matching covered source before selecting it. Use the documented provisional MPL route with notices and source access; return any real rights conflict to the parent.

Provide a usable move-review tool for an entered setup and algorithm without pretending generated challenges, timer controls or trainer statistics already exist. Keep the text result available on initialization/WebGL failure or reduced motion. Do not enable nonempty trainer backup imports with a partial semantic validator; optimality tables and case manifests are not present yet. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `b01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Player end states agree with logical moves and independent fixtures, including frames and slot mappings.
- A never-opened player works after disconnecting following setup; all player gestures are isolated from timer control.
- Shared contracts and reconstruction fixtures are usable by an isolated R01 experiment; measured results and license constraints are documented.

## Expected artifacts

- src/cube/
- cube player integration
- src/workers/ generation contract
- reconstruction interchange fixtures
- docs/audits/Cube_Tools_Integration.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Use pnpm 10.33.2 and its lockfile. Install only justified cube-tool dependencies; do not rework unrelated tooling or update unrelated packages.
- The parent owns Git integration and task status. Do not commit, push, change branches or mark this task complete.
- Write actual changed paths, commands/results, measurements and limitations into `docs/audits/Cube_Tools_Integration.md` before your final response. Previous subagent report delivery was unreliable; the audit must preserve the evidence.
- Keep worker scaffolding honest: missing generator/table support returns an explicit failure, not a fake success. Reconstruction fixtures are synthetic interchange tests, not video-recovery evidence.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run notation/state/player fixtures, production build/bundle inspection, and first-use-offline browser tests. Report manual iOS/Android gaps honestly.

## Review checkpoint and handoff

R01 becomes dependency-eligible here, but still needs its separate owner authorization, samples and explicit worktree cwd.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
