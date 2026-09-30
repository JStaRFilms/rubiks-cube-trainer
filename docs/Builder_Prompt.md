# Builder prompt

Use this prompt only for a build task whose dependencies and approvals are recorded as ready. The product contract is [docs/imports/PLAN.md](imports/PLAN.md). The [requirements index](Project_Requirements.md) and [FR packets](issues/) provide traceability; neither replaces the plan. Follow [Coding_Guidelines.md](Coding_Guidelines.md).

## Before editing

Read the assigned task packet, its dependencies, relevant plan sections, current code/types/tests and any repository instructions. Confirm the exact allowed paths. Stop and report a missing predecessor artifact, unresolved blocker or required owner decision. Do not invent its contract.

This is a fresh implementation. Historical `imports/TECHNICAL.md`, `imports/AGENTS.md`, old milestone claims, test counts and performance claims are not current authority or evidence where they conflict with PLAN. In particular, do not restore exact-K Cross, desktop-first layout, random-cube F2L placement, first-use-only 3D caching, or the old timer semantics.

## Build constraints

Implement only the assigned task. Preserve the approved scope, use existing project patterns and dependencies, and avoid unrelated cleanup or speculative abstraction. Keep Cross, Cross+1, isolated F2L, OLL/PLL, ZBLL and Cross+2 semantics distinct. Preserve honest preparation/inspection data, penalties, DNF, local history and explicit generator failure behavior. Do not present a witness bound as global optimality or a self-reported physical action as observed fact.

Do not start work behind a feasibility or owner gate. Cross+2 build work requires a passing feasibility result and explicit owner go. Video integration needs its own reviewed research result and go decision. Teaching and sync need their respective editorial or provider decisions. No task authorizes deployment, account setup, scraping, production data changes or an external upload unless it explicitly says so and identifies the target.

## Verify and report

Run the narrowest relevant checks available, then broader checks only when warranted. Report commands and actual results. Record browser/device versions for manual browser checks. If the repository has no app or toolchain for the assigned work, state that application checks were not run; do not imply they exist. Distinguish unrun checks from failures.

Review the diff for scope, traceability and links. Report changed paths, behavior and decisions, checks, remaining blockers and next handoff. Do not claim inherited milestones or unperformed tests as evidence.
