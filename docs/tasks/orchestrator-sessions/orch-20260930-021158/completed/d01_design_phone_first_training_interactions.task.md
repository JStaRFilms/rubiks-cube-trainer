# Task D01: Design phone first training interactions

## Agent setup

### Workflow to follow

vibe-design. Role: designer. Suggested route at session creation: `openai-codex/gpt-6-sol`, medium thinking. Recheck the active registry and routing policy before launch. This packet is not a launch authorization.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Core_Architecture.md`
- `docs/features/Trainer_Foundation.md`
- `docs/Coding_Guidelines.md`

Read PLAN sections 3, 4, 5, 7. Coverage: FR-001 through FR-013. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Specify an implementable phone-first experience across all trainers, not only the earliest screen.

## Scope

- Design untimed and strict inspection journeys with the distinct initial tap, 300 ms arming hold, release start, stop, penalties, hidden preparation clock, and recovery states.
- Provide screen/state mockups for Cross/Cross+1, F2L, Time Attack sets/results, ZBLL, and conditional Cross+2. Include setup readiness, history, backup/restore, personal algorithms, slot/color/difficulty controls and 3D review.
- Specify compact shared visual rules, touch/keyboard interaction isolation, focus, contrast, reduced motion, representative-case labels, recognition secrecy, and empty/loading/error/storage/offline states.
- Also provide `docs/mockups/Training_Review.html`, a self-contained browser-viewable screen review for phone and desktop. This is a static design artifact, not application Build. Cover all six trainer layouts and shared timing/review/history states; label illustrative data and schematic cube imagery. Use no external assets, framework installation, actual timing/solving, persistence, or production code.
- UI/UX only. Read the architecture contracts; do not choose databases, change algorithms, or invent new product features.

## Context

This is a fresh implementation. The previous code is unavailable and historical milestone/test claims are not evidence. The owner approved the product direction and session creation, not automatic execution. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `g02`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Mockups and state tables cover every trainer family and the shared setup/timing/review/history flows.
- Phone and desktop input behavior is explicit, including avoiding timer actions from player/settings gestures.
- The builder can implement without guessing recognition leaks, preparation labels, failed rep resets, or confirmation behavior.

## Expected artifacts

- docs/design/Training_Experience.md
- docs/mockups/Training_Screens.md
- docs/mockups/Training_Review.html

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Walk through real-cube practice steps, inspection boundaries, OLL/PLL reset differences, and accessible keyboard/touch alternatives.

## Review checkpoint and handoff

Parent performs one focused read-only architecture/design consistency review, then stops for the owner's visual feedback before B01. The owner authorized this run only through Design, with an earlier pause for any genuine blocking question. Do not demand pixel-perfect decoration before functional hierarchy is clear.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
