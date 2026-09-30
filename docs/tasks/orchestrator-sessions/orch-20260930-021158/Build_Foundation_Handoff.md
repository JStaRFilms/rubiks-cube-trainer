# Build foundation handoff

B01 is now complete. This document records the execution brief; actual results and review recovery are in `docs/audits/B01_Foundation_Handoff.md`. Next pending slice is B02.

## Owner decision and current scope

The owner chose A's desktop and B's mobile, said the visuals still need work, and asked to move past Design. Treat that as an interim layout baseline and authorization to begin the next bounded Build task, B01. Do not report enthusiastic aesthetic approval or repeat visual interviews. More polish is deferred until working functionality exists.

Current branch: `build/foundation`, derived from the preserved comparison branch `design/solver-workspace-v2`. The production app must implement one responsive workspace. Do not import the comparison prototype or ship its variant controls. Above 900 CSS px use A's session dock, slate tokens and mono clock. At 900 px and below use B's centered sans clock, graphite tokens and 86 px session shelf. Semantic layout rules are in `docs/design/Design_System.md`.

This run covers B01 and its focused review only. B02 cube/player integration, B03 actual timing/statistics, B04 Cross generation and later trainers remain separate tasks. No research, remote hosting, deployment, accounts, sync or teaching work is authorized. Parent owns Git integration. No push, amend, rebase or history rewrite.

## Prime context

Read this handoff before any older statement that Build is paused. Then read:

- `completed/b01_scaffold_pwa_and_durable_local_records.task.md` in this session.
- `docs/imports/PLAN.md`, especially sections 3, 6, 7 and 11.
- `docs/Coding_Guidelines.md` and `docs/Builder_Prompt.md`.
- `docs/architecture/Core_Architecture.md` and `docs/features/Trainer_Foundation.md`.
- `docs/issues/FR-001.md`, `FR-004.md`, `FR-005.md`, `FR-013.md`.
- `docs/design/Design_System.md`, `Training_Experience.md`, and `docs/mockups/Training_Screens.md`.

PLAN remains the product source of truth. Imported TECHNICAL/AGENTS documents are historical. Earlier tests on design HTML are not application evidence. No application code or package toolchain exists yet.

## Implement B01

Follow the authored packet. Create a Vite/React/strict-TypeScript static PWA with focused scripts and the useful approved tools. Use pnpm and pnpm-lock.yaml; the owner switched tooling after B01. The current local environment is Node 24.16.0/pnpm 10.33.2. The original B01 verification used npm, as recorded in its audit. Normal local dependency installation is within this task. Do not publish packages or configure hosting. Prefer installed Chrome for browser validation instead of downloading another browser unnecessarily.

Implement the documented current local stores, immediate acknowledged attempt writes, settings and sessions, safe versioned backup/restore with preview and explicit replacement confirmation, and honest visible storage failures. Validate before any destructive transaction; rejected or failed imports must preserve existing records. Do not invent unsupported historical schemas or silently drop data. Keep migration evidence proportional to the actual supported schema.

Implement PWA/install assets, cache-confirmed shell readiness/retry and safe update prompts. Readiness must describe the available foundation, not claim all trainers or the not-yet-integrated player are ready offline. Preserve a documented complete-release asset contract for B02. Never infer cache readiness from connectivity alone or reload an active attempt. Guard deferred update/application races using the documented interaction contract.

Keep navigation/settings/history usable without a stack of cards above the clock. Undelivered trainers and the unwired timer/scramble must be clearly marked; do not seed fabricated attempts, verified challenges, statistics or live timer behavior. Persistent APIs and their focused tests are useful now; actual solving/timing belongs to later packets.

The existing feature blueprint must match actual client components, data flow and schema. Update it before changing those contracts, and keep README setup/check instructions accurate. No unrelated refactoring or speculative systems.

## Completion and review

Run focused tests, lint, strict typecheck, production build and real browser flows for local settings/session persistence, export/confirmed restore, invalid/newer import safety, write errors, cold offline shell access and update protection. Tests must exercise code, not static mockups. Record commands, actual counts and missing platform coverage. Physical iPhone/Android and assistive-technology checks may remain unrun; disclose that clearly.

A separate read-only reviewer checks only B01 correctness, important regressions and hard requirements. Parent fixes confirmed defects through the same coder conversation, verifies the changed cases, records evidence and commits locally. Leave B01 in progress if a required check fails or its definition of done is incomplete. Stop for a genuine owner decision or blocked tool launch; do not expand scope to bypass it.
