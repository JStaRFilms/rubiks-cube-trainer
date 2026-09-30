# Task B01: Scaffold PWA and durable local records

## Agent setup

### Workflow to follow

vibe-build. Role: coder. Suggested route at session creation: `openai-codex/gpt-6-sol`, high thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/design/Training_Experience.md`
- `docs/mockups/Training_Screens.md`
- `docs/architecture/Core_Architecture.md`
- `docs/features/Trainer_Foundation.md`

Read PLAN sections 3, 6, 7, 11. Coverage: FR-001, FR-004, FR-005, FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Create the runnable foundation, honest offline setup, and safe local persistence that later trainers compose.

## Scope

- Scaffold Vite/React/strict TypeScript and the accepted styling/state/storage/PWA tools. Add focused lint/typecheck/unit/build/browser scripts and minimal navigation/settings/history shells.
- Implement current stores, immediate attempt writes, local settings/sessions, versioned backup/confirmed restore, migration fixtures and visible storage/quota failures. Do not prebuild sync/video/lesson stores.
- Implement manifest/install assets, cache-based setup readiness/retry, and update prompts that cannot reload active timing. Anticipate B02 player assets in the documented manifest contract.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `d01`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- The app starts and production build plus actual project scripts pass.
- Valid exports round-trip; malformed/newer imports do not corrupt existing records; failed writes never show false saved states.
- App shell cold-starts offline after setup, interrupted setup is honest, and update behavior respects the active-attempt contract.

## Expected artifacts

- package.json and lockfile
- src/app/
- src/store/
- PWA configuration and install assets
- focused persistence and offline tests

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run created lint/typecheck/unit/build scripts and focused offline/storage/restore browser tests. Record the exact commands and any unavailable platform checks.

## Review checkpoint and handoff

Do not deploy or configure remote hosting. B02 validates the complete player-inclusive asset contract.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
