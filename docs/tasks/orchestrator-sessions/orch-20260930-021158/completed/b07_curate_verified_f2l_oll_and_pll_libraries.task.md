# Task B07: Curate verified F2L OLL and PLL libraries

## Agent setup

### Workflow to follow

vibe-build. Execute with the coder persona, `openai-codex/gpt-6.1-sol`, high thinking. The initial worker suggestion covered data curation; actual case identity, engine verification and override validation require code capability. The owner has now authorized continuing after Q02. Parent owns Git and task integration.

### Prime agent context

- `docs/imports/PLAN.md`
- `docs/Project_Requirements.md`
- `docs/audits/import-audit.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `docs/architecture/Core_Architecture.md`
- `docs/architecture/Cube_Tools_Decision.md`
- `docs/issues/FR-008.md`
- `docs/issues/FR-009.md`
- `docs/issues/FR-012.md`
- `docs/audits/Q02_Cross_One_Acceptance.md`
- `src/cube/engine.ts`, `src/cube/geometry.ts`, `src/cube/frame.ts`, `src/cube/notation.ts`, `src/cube/validation.ts`
- `src/store/records.ts`, `src/store/validation.ts`, `src/store/trainer-validator.ts`
- `tests/helpers/cube-geometry.ts`, `tests/fixtures/slot-permutations.json`, `tests/unit/cube.test.ts`
- `package.json`

Read PLAN sections 4.3, 4.4, 6.3, 11. Coverage: FR-008, FR-009, FR-012. Paths produced by predecessors become available only after those tasks complete. If a required predecessor output is missing, report it rather than improvising its contract. Inspect actual existing code/types/tests before edits.

### Optional skill and context overlays

| Overlay | Use |
| --- | --- |
| unslop | Required for user-facing labels, documents and reports when available. |
| Task-relevant implementation/testing skills | Discover at dispatch; optional packs must not expand scope. |

## Objective

Supply full legitimate case inventories with verified identities and trainer-specific validation rules.

## Scope

- Curate sourced 41 F2L, 57 OLL and 21 PLL inventories with stable IDs, canonical cases, default algorithms, source/license records, setup/AUF conventions and coverage manifests.
- Use engine fixtures to verify identities and required preserved pieces. OLL equivalence concerns orientation with F2L preserved, not a requirement that every correct override solves PLL.
- Implement/import focused case validation and personal-override checks without changing canonical identity when an algorithm changes. Do not transcribe missing algorithms from memory.
- Write `docs/features/Case_Libraries.md` before substantial code/data-flow changes. Explain identity policy, licensing, source-to-case mapping, components, validation flow and schema/version boundaries. Add `docs/audits/Case_Libraries_Verification.md` for actual proof/check results and failures.
- Preserve the architecture's exact equivalence policies. F2L canonical FR target projection under four pre-U turns, excluding LL arrangement, must produce the standard 41 non-solved identities and sourced numbering map; a mismatch is a blocker. OLL is the frozen 20-index U-occupancy mask, not full permutation. PLL uses its explicit pre-AUF/proper-yaw equivalence and recorded final AUF, not mirrors/inverses/tilts.
- Verify all four F2L slots and allowed angles, with cross/other pairs preserved. OLL setup/default/override checks cover every parity-compatible legal orientation-solved LL permutation or an independently proven permutation-invariance rule. PLL solves its intended presented case including the documented final AUF.
- Public read-only source/license research and retrieval of explicitly reusable, pinned artifacts are within this task. No broad site scraping, unauthorized content copying or new dependencies/optional GPL solver imports. If source rights are absent or reuse changes project license obligations materially, stop with exact evidence for an owner decision. Mathematical project-owned enumeration/search is permissible if proven, reproducible and mapped to a legitimate standard inventory; it is not permission to invent missing defaults from memory.
- Keep F2L/OLL/PLL production UI unavailable until B08/B09. Do not fabricate attempts or weaken the existing semantic backup gate to claim this library is a delivered trainer. Existing Cross/Cross+1 and their input/offline behavior must remain intact.

## Context

The app now has accepted Cross and Cross+1. Q02 returned PASS with actual independent checks; parent passed 152 unit and 37 Chrome tests. Stable HEAD is local `a4380e0`, with B05 `716fec5`; remote `origin/main` remains the explicitly pushed input repair `973a879`. The owner reviewed the recap and asked to continue. Parent orchestration changes are expected; preserve them. Do not commit/push/change branches or edit task/master/index/summary state. PLAN remains authoritative over old TECHNICAL/AGENTS conflicts. All levels are supported; normal trainer controls target modern iPhone/Android browsers and desktop.

## Dependencies

- `q02`

A completed dependency is not enough if its review verdict has unresolved confirmed blockers or its packet requires an owner go decision. The parent must record the passing gate before dispatch.

## Definition of done

- Manifests account for all requested canonical cases without counting solved/angle duplicates as coverage.
- Every setup/default/override rule passes intended-case and preserved-context fixtures, including OLL under permissible LL permutations.
- Source rights and attribution are recorded; unavailable legitimate data is a reported blocker, not fabricated content.

## Expected artifacts

- src/data/ F2L OLL PLL libraries and manifests
- case identity and override fixtures
- docs/data/Case_Sources.md with exact source URLs/revisions/artifact hashes, rights, attribution and numbering/equivalence mapping
- docs/features/Case_Libraries.md
- docs/audits/Case_Libraries_Verification.md

## Constraints

- Preserve unrelated work and the approved product scope. No speculative refactoring, new puzzle types, automatic coaching, or silent metric changes.
- Main-checkout writing is single-threaded. Only R01 may use a separately authorized isolated worktree; resolve the exact cwd before its launch.
- No deployments, accounts, production data changes, or unapproved external effects. Never fabricate sources, datasets, benchmarks, or browser checks.
- Review personas are read-only. They return evidence/verdicts, and the parent records documents and task state.
- For substantial implementation, update the relevant feature blueprint with components, data flow and schema before changing those contracts.
- Use one focused implementation/review pass per increment; route confirmed defects to the same conversation. Stop on blocked, cancelled, or review-gated launches.

## Verification

Run independent Cartesian inventory/equivalence/legality/setup/default/override fixtures, not only assertions generated by the production helpers. Prove exact 41/57/21 coverage excluding solved/duplicate angles, all F2L slots and OLL permutation robustness. Test wrong-case, malformed and valid overrides, explicit pre/final AUF and canonical identity stability. Run lint/typecheck/relevant unit/build and proportionate existing Cross/Cross+1 regressions. Report actual commands, blocked sources and measurable conditions. No claims of a usable F2L/Time Attack screen, physical phone or installed-PWA behavior from library tests.

## Review checkpoint and handoff

B08/B09 consume verified coverage. Clearly marked previews may be partial, completed trainers may not.

Report changed paths, actual commands/results, requirement coverage, remaining blockers and the next permitted action. Mark unrun checks explicitly. Parent records outcomes and conversation IDs on the board.
