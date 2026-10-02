# Orchestrator master plan

## Overview

- Session: `orch-20260930-021158`
- Project: Personal Rubiks Cube Trainer, working name.
- Mission: deliver the approved offline trainer plan through working increments, with detailed coverage for all six trainers and an independent video research track.
- Current phase: Build, B08 actual F2L accepted and B09 OLL/PLL Time Attack accepted and Q03 next. Parent passed 260 units and seven LL browser flows; a Cross repair readiness timeout is disclosed alongside three unchanged passing reruns. Parent passed all 212 unit tests and eighteen selected production browser regressions plus final 46-asset/source rebuild. Parent verified exact 41/57/21 inventories, both MIT grants and six pinned upstream artifacts; all 168 unit and eight Cross/Cross+1 browser checks passed. After the recap, the owner authorized continuing through F2L/OLL/PLL and Q03. G01/G02/D01/B01/B02/B03/B04/Q01/B05/B06/Q02/B07/B08/B09 are complete. The owner authorized input repair, push and the next step. Cross was pushed through `973a879`. Parent accepts provisional K1..8/L1..12 for any-pair/targeted Cross+1 with a fully solved base, 5-second/10,000-node construction budget and explicit phone-performance limits. B06 integrated these bounds; parent passed all 152 unit and 37 Chrome checks. Q02 independently passed targeted source/unit/browser/offline/asset checks with no confirmed blocker. Its actual commands and manual limits are in `docs/audits/Q02_Cross_One_Acceptance.md`. Preserve the interim layout; research remains separately gated.
- Previous session: `orch-20260930-005449`, the completed takeover audit and interview. This is a new delivery session, not a duplicate of that planning session.

The owner initially authorized work through Design, rejected the first visuals, then chose A desktop plus B mobile and asked to move past Design. That closes the interim layout gate and starts B01 on `build/foundation`. The owner still dislikes the aesthetics; defer further polish. Comparison prototypes remain on `design/solver-workspace-v2`. The owner subsequently asked to continue implementation. B02 move review, B03 timing/statistics and B04 Cross are now implemented. Q01 checks the first complete practice loop before the next trainer. This authorization does not extend to new worktrees, external case-content scraping, accounts, deployment or research launches.

## Context intake

`docs/imports/PLAN.md` is the product source of truth. `docs/Project_Requirements.md` is an index. `docs/audits/import-audit.md` records why the inherited promises were revised. The inherited application code was unavailable at intake. B01 has since added the React/Vite application, persistent local records, PWA shell and unit/browser checks. The project now uses pnpm 10.33.2. Earlier imported milestone/test claims must not be carried forward as evidence.

The imported `TECHNICAL.md` and `AGENTS.md` are historical. Read them only with the supersession rules in PLAN section 1. Do not restore exact-K difficulty, desktop-first UI, random-cube F2L placement, late backup, or first-use-only offline caching.

The first audience is the owner and friends, with all cubing levels supported. Phone-first iPhone/Android browser controls and desktop keyboard support are required. Cross/Cross+1 and interactive 3D lead delivery. F2L and OLL/PLL follow, then ZBLL and feasibility-gated Cross+2. All included assets work offline after setup. No calendar deadline was promised.

## Plan and lifecycle

### Foundation, then UI/UX

G01 turns the approved scope into stable FR issues and current implementation guidance without repeating the interview or creating a competing PRD. G02 defines architecture, cube/player reuse decisions, case identity conventions, and local-data/worker contracts. D01 then specifies phone-first interaction, screen states, and mockups. Architecture and schemas belong to G02, not D01.

### Main checkout delivery

B01 through B04 establish the PWA/storage foundation, cube/player integration, timer/statistics, and complete Cross loop. Q01 is the first usable-increment gate. B05 proves useful Cross+1 bounds; B06 integrates them, then Q02 reviews that increment.

B07 supplies verified F2L/OLL/PLL data. B08 builds F2L; B09 builds Time Attack; Q03 checks their distinct case/reset/statistics rules. B10 supplies the ZBLL inventory and B11 integrates its trainer; Q04 reviews that increment. Q06 checks cumulative core readiness and records any real manual-browser verification gaps. It does not wait for video or Cross+2.

B12 independently proves Cross+2 feasibility after the prioritized core is usable. B13 requires an explicit owner go decision, then Q05 reviews the result. A failed B12 does not block sharing the other trainers. It also does not justify marking Cross+2 delivered or quietly changing its metric.

### Parallel and later tracks

R01 becomes eligible after B02 establishes usable cube/notation/player contracts, not after every trainer is finished. Before launch, obtain owner approval of a bounded experiment, consented recordings/ground truth, and an exact isolated worktree cwd. R02 reviews its evidence. Video UI/integration tasks will be expanded only after a go decision identifies the supported approach. Keep the research prominent and nonblocking.

T01 prepares source-backed pilot teaching modules after real practice activities exist. The owner edits and approves them. Later Design/Build tasks are added after that editorial gate rather than inventing a course system now.

S01 defines later sync architecture after local records, restore, and sets are stable. Provider/cost/privacy approval precedes any sync implementation task expansion. It creates no live backend.

Stage labels identify the kind of work. Readiness is controlled by explicit task dependencies and approval gates. Later feature-Genesis tasks T01/S01 must not become a blanket barrier that holds the core Design/Build sequence hostage. The foundation gate for D01 is G01 plus G02.

## Requirement coverage

These identifiers are reserved for G01's issue pack. The original PLAN remains authoritative for the behavior; the issues index and test it rather than redefine it.

| ID | Requirement | Delivery coverage |
| --- | --- | --- |
| FR-001 | Installable offline app, setup readiness, safe updates | B01, B02, all trainer increments, Q06 |
| FR-002 | Shared cube/notation contract and interactive 3D review | G02, B02, Q01 |
| FR-003 | Hold/release timer, strict inspection, honest preparation data | D01, B03, Q01 |
| FR-004 | Local sessions, compatible statistics, progress views | B01, B03, trainer increments |
| FR-005 | Backup/restore, migrations, honest storage failure | G02, B01, Q01, Q06 |
| FR-006 | Cross ceiling difficulty and optimal review | B04, Q01 |
| FR-007 | Cross+1 verified combined bounds and slot modes | B05, B06, Q02 |
| FR-008 | Isolated F2L case/slot practice | B07, B08, Q03 |
| FR-009 | OLL/PLL Time Attack and set results | B07, B09, Q03 |
| FR-010 | Full ZBLL family/subset training | B10, B11, Q04 |
| FR-011 | Cross+2 verified two-pair goals, conditional on feasibility | B12, B13, Q05 |
| FR-012 | Legitimate verified case data, canonical identity, personal algorithms | G02, B07, B10, case trainer checks |
| FR-013 | All-level explanations, phone/desktop controls, accessibility | D01, all screens, Q06 |
| FR-014 | Video-assisted reconstruction with timing/uncertainty/correction | R01, R02, conditional later expansion |
| FR-015 | Sourced owner-reviewed teaching modules | T01, editorial gate, conditional later expansion |
| FR-016 | Later account/cross-device sync | S01, architecture approval, conditional later expansion |

G01 should distinguish the early MUS slice, committed later trainer roadmap, and research/future tracks without treating late delivery as cancellation. Author issue packets for the whole approved roadmap, including explicit feasibility gates.

## Skills registry

- `unslop` applies to every user-facing document, label, lesson, and report.
- D01 rework uses `frontend-ui` with `frontend-design`, `ui-ux-pro-max`, and the UI branch of `prototyping-variants`. The design system must govern screen hierarchy, numeric typography and concrete components, not only colors. Discard the search helper's irrelevant webinar layout. AGY's structural exploration is advisory; approved timer/accessibility contracts prevail.
- `grill-me` was used for intake. Use it again only when a new load-bearing decision genuinely needs the owner, not to repeat settled questions.
- Relevant implementation/testing skills can be discovered at dispatch time. Missing optional skills are not blockers.

## Workflows registry

- `vibe-genesis`: G01/G02 and later T01/S01 technical/content planning.
- `vibe-design`: D01, UI/UX only.
- `vibe-build`: implementation, feasibility prototypes, and focused checks.
- Review: read-only canonical reviewer with a scoped acceptance question; the parent records the response and task result.

## Task table

Every packet is under `pending/` initially. Task IDs remain stable when the board moves files between status folders. Detailed packet links are in `task_index.md`.

| ID | Task | Stage / role | Dependencies | Gate |
| --- | --- | --- | --- | --- |
| g01 | Map requirements and refresh build guidance | Genesis / worker | None | First executable task |
| g02 | Define architecture and reusable cube tools | Genesis / architect | g01 | Decisions documented, not claimed benchmarks |
| d01 | Design phone-first training interactions | Design / designer | g02 | Owner-selected solver-first system and full trainer/state handoff before Build |
| b01 | Scaffold PWA and durable local records | Build / coder | d01 | Actual scripts, restore, offline baseline |
| b02 | Integrate cube engine and offline 3D player | Build / coder | b01 | Shared contracts and player consistency |
| b03 | Implement timer and shared statistics | Build / coder | b02 | Exact phase boundaries and failure handling |
| b04 | Deliver the complete Cross training loop | Build / coder | b03 | Independently checked bounded depths |
| q01 | Review the first usable offline increment | Build / reviewer | b04 | Read-only verdict; confirmed defects only |
| b05 | Prove Cross+1 generation bounds | Build / coder | q01 | Measured supported caps and witnesses |
| b06 | Deliver Cross+1 any-pair and slot drills | Build / coder | b05 | Accepted supported ranges |
| q02 | Review Cross+1 correctness and interactions | Build / reviewer | b06 | No false optimality or stale goals |
| b07 | Curate verified F2L OLL and PLL libraries | Build / coder | q02 | Source rights, identity and coverage |
| b08 | Deliver F2L case and slot practice | Build / coder | b07 | Solved cross/other pairs preserved |
| b09 | Deliver OLL and PLL Time Attack | Build / coder | b08 | OLL and PLL reset goals differ |
| q03 | Review F2L and Time Attack delivery | Build / reviewer | b09 | Cases, overrides, sets and persistence |
| b10 | Curate the complete ZBLL inventory | Build / worker | q03 | Frozen count/AUF/PLL convention |
| b11 | Deliver ZBLL family and subset practice | Build / coder | b10 | Full validated coverage, honest modes |
| q04 | Review ZBLL delivery | Build / reviewer | b11 | Case/reset/reveal correctness |
| q06 | Check cumulative core readiness | Build / reviewer | q04 | Offline/browser/data checks, no deployment |
| b12 | Prove Cross+2 feasibility | Build / coder | q06 | Owner go/no-go, independent of core release |
| b13 | Deliver verified Cross+2 drills | Build / coder | b12 | Explicit owner go required |
| q05 | Review Cross+2 delivery | Build / reviewer | b13 | True two-pair witness and bounded failure |
| r01 | Research local video reconstruction | Build / coder | b02 | Separate authorized worktree and samples |
| r02 | Review video reconstruction evidence | Build / reviewer | r01 | Owner go/no-go before integration expansion |
| t01 | Draft sourced pilot teaching modules | Genesis / worker | q03 | Research authorization and owner editorial gate |
| s01 | Define later account and sync architecture | Genesis / architect | q03 | Provider/privacy/cost approval before Build |

## Routing and execution

Suggested routes use the active registry available at session creation. Recheck availability before each future launch. Do not alter executable model settings from these notes.

- G01: `openai-codex/gpt-6-luna`, medium, bounded documentation.
- G02/D01/S01 and teaching research: `openai-codex/gpt-6-sol`, medium, judgment-heavy planning.
- Main implementation and video research: `openai-codex/gpt-6-sol`, high.
- Verified dataset curation: `openai-codex/gpt-6-luna`, high, constrained sourcing and fixtures.
- Reviews: `openai-codex/gpt-6-sol`, medium; Cross+2 evidence review uses high.

The main checkout has one active writer. Do not fan out B tasks in it. Read-only review can run when the snapshot is stable. Parallel research requires isolated worktrees, an explicitly resolved cwd, bounded shared contracts, and owner authorization. Paths in task prose are not launch cwd settings.

When executing later, set required capabilities accurately. Reviewers return findings in their response and do not write source or audit files. The parent records the verdict. Reuse an implementer's conversation ID for a confirmed defect repair. Do not restart a blocked/cancelled/review-gated launch automatically.

## Progress checklist

- [x] Read imported discussion and prior plans.
- [x] Complete the takeover interview and consolidate product decisions.
- [x] Identify the earlier code as unavailable.
- [x] Map all six trainers and independent later tracks.
- [x] Author this master plan and detailed pending task packets.
- [x] Register and validate all 26 tasks, authored packets, dependency order, and task-index links.
- [x] Execute and review G01 requirements and guidance.
- [x] Complete and review G02 architecture.
- [x] Review the initial D01 contracts; record the owner's visual rejection rather than treating that review as acceptance.
- [x] Author a real design system, two revised compositions and desktop/phone visual evidence.
- [x] Record the owner's interim A-desktop/B-mobile choice and defer further visual polish.
- [x] Interpret the owner's request to move past Design as authorization for B01 foundation.
- [x] Implement, verify and review B01; 28 unit and 11 browser tests plus lint/typecheck/build passed.
- [ ] Revisit visual polish after working functionality exists, without blocking this foundation.
- [x] Implement B02 entered-move review, shared cube contracts and first-use-offline player setup. Correct both focused-review blockers; parent checks pass with 59 unit and 17 Chrome tests.
- [x] Implement and verify B03 timer/statistics components. Parent checks pass with 90 unit and 10 focused Chrome timer tests, including corrected primary result and overtime displays.
- [x] Implement B04 verified Cross challenges, live timing, saved history, backups and optimal offline 3D review. Parent passed 103 unit tests; final implementer browser run passed 31 tests. Parent repeated the repaired real update/history test.
- [x] Complete Q01 independent acceptance of the first Cross increment. Reviewer returned PASS; actual commands, unchanged isolated reruns after two combined-run timeouts and manual-check limits are recorded in `docs/audits/Q01_First_Usable_Increment.md`.
- [ ] Authorize and evaluate video research separately.
- [ ] Expand teaching/sync/video integration after their actual decisions.

## Notes and stop rules

Preparation time includes scrambling; never subtract an invented estimate. Cross uses a depth ceiling, not exact-K. Cross+1/+2 caps are witnessed upper bounds, not promised global optima. A successful OLL rep does not imply solved LL permutation. All required player assets belong in offline setup even if rendering is lazy.

Use one implementation pass and one focused review per increment, fixing confirmed blocking defects. Do not loop for speculative perfection. Record unavailable manual browser checks rather than claiming they passed. A blocked dataset source or failed feasibility result is a real task outcome, not permission to fabricate data or change semantics.

G01/G02/D01/B01/B02/B03/B04 are complete. Preserve the interim owner choice in `docs/design/Design_System.md`. Foundation, cube, timing and Cross evidence are in `docs/audits/B01_Foundation_Handoff.md`, `Cube_Tools_Integration.md`, `Timer_Statistics_Integration.md` and `Cross_Trainer_Integration.md`. Cross now has genuine verified generation, live timing, saved history, backups and optimal review. Q01 returned PASS for this loop; the parent recorded its evidence in `docs/audits/Q01_First_Usable_Increment.md`. The owner subsequently authorized the next step after an input repair and push. B05 proved measured Cross+1 support and parent accepted provisional caps. B06 now follows, retaining the stronger fully solved starting base and Q02 gate. Missing agent responses were recovered through actual source, audits and checks; they are not independent approval. The Cross update test's first parent run exhausted its 45-second limit because release compilation took 35.774 seconds. The repair prepares real release bytes before that timed exercise and retains every update/history assertion. No manual attempts or semantic-validation bypass were added. Physical-mobile, installed-PWA and GPU checks remain unrun. Research has not started. The owner reported that Space required a timer click and pointer arming looked selected. Parent repaired background Space/native ownership and pointer feedback, retained keyboard focus, and passed lint/typecheck/build, 31 focused unit tests and all 32 Chrome tests. The owner explicitly authorized the fast-forward push to `origin/main`, now `973a879`. B05 is accepted after actual parent checks and source inspection. Its measured range and physical-base constraint are in `docs/audits/Cross_One_Feasibility.md`. B06 integrated the complete any/target loop and Q02 accepted it. The next planned slice is B07 case curation, but do not launch it automatically from this checkpoint. Do not reopen broad style questions.

The owner requested stage-sized local commits. Parent owns scoped Git integration after review, preserving unrelated staged work. No automatic push, amend, rebase, history rewrite or external mutation is authorized. Commit proposed Design as a review artifact, not as implicit acceptance of its visual direction.
