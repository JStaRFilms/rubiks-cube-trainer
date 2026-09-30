# Cube trainer takeover audit and scope interview

## Context

The new owner is taking charge of a project started by a friend with another model. The owner requested an audit of `docs/imports/`, followed by an interactive interview and a better project plan. The conversation is unlabeled, includes unrelated chat, and contains both modest offline training goals and an ambitious video reconstruction idea.

The four imports have been read. `docs/audits/import-audit.md` records the findings. This checkout has project placeholders and an empty `src/`, but no runnable application, package manifest, tests, solver, or case datasets. The imported AGENTS document claims completed milestones elsewhere. Those claims are not verified here. The owner subsequently confirmed that the old code is no longer available; retrieving it is not a prerequisite.

## Objective

Agree what the project should become, how to sequence working increments, and which hard problems deserve separate experiments. Then revise the original plan to reflect the owner's decisions rather than accepting the previous model's locked labels.

## Scope

Audit documents and repository evidence, interview the owner in dependent rounds, and author project requirements and delivery gates. The owner explicitly requested updating `docs/imports/PLAN.md` itself. Preserve the conversation, historical TECHNICAL and AGENTS imports. Do not implement the application, fetch or modify external repositories, deploy anything, or assume permission for changes to the friend's work.

## Plan

### 1. Audit inherited material

Read the conversation, PLAN, TECHNICAL, and imported AGENTS file. Compare their promises and progress claims with local files. Record speaker uncertainty, requirement conflicts, algorithmic gaps, offline contradictions, and omitted research decisions. Deliver `docs/audits/import-audit.md` and explain the major findings to the owner. This inspection and audit document are complete.

### 2. Interview the owner

Begin with four decisions that do not depend on unanswered implementation details: first audience and ambition, the most valuable training loop, whether video reconstruction is required or exploratory, and availability of the earlier code. Recommend options but accept custom answers.

After each round, work only on questions whose prerequisites are settled. Subsequent rounds establish actual training flow, correctness guarantees, devices, offline behavior, recovery, libraries, collaboration, and constraints. Challenge unsupported assumptions, keep undecided choices visible, and stop when decisions are answered or explicitly deferred. Eight rounds have now settled the product direction and assigned remaining technical decisions to evaluation stages.

### 3. Write the agreed project plan

Revise `docs/imports/PLAN.md` as the authoritative product plan and use `docs/Project_Requirements.md` only as an index. Give all six trainers detailed behavior, dependencies, risks, and completion criteria. Separate delivery requirements, later features, research, and exclusions. Give each stage a deliverable and acceptance gate. Make reconstruction prominent without promising unmeasured accuracy. Justify tools from agreed needs instead of defaulting to custom engine/player work. Present the plan before implementation starts.

## Definition of done

The owner has settled or explicitly deferred decisions needed for a buildable specification. Working increments have useful training loops and testable completion criteria. Unverified inherited claims remain labeled. The consolidated plan includes scope, offline/data behavior, risks, sequencing, collaboration, and approval boundaries. No application code is changed during planning. Owner approval of the written plan remains the next gate before D0.

## Confirmed decisions

Support all cubing levels, initially shared with friends. Phone-first modern iPhone/Android browsers, desktop and keyboard support. Plan all six trainers in detail; Cross/Cross+1 with interactive3D early, F2L and OLL/PLL next, ZBLL and feasibility-gated Cross+2 later. Cross uses an optimal HTM depth ceiling. Cross+1 provides verified combined upper bounds with any-pair and optional slot goals. F2L isolates the target pair. Full standard case coverage is required for completed trainers.

Use untimed and strict15s inspection. Tap/Space begins inspection, a subsequent approximately300ms hold arms, release starts execution, and tap/Space stops. Preparation data includes scrambling, measured from scramble display until execution starts, hidden during preparation and visible afterward. Do not estimate/subtract scrambling time. All included trainer/player assets work offline after setup. Local storage and backups first; sync later.

Video is a prominent authorized-later parallel worktree track: uploaded footage plus known scramble, timestamped moves, uncertainty/correction, local offline target with browser/mobile feasibility gates. Structured teaching is later, sourced and owner-reviewed. Keep Vite/React/TypeScript and evaluate reusable cube tools. Both collaborators contribute; the owner integrates. Share working increments without a fixed date.

## Risks and evaluation decisions

Speaker identity remains uncertain. Solver cap ranges and performance need experiments. Video may fail for occlusion or fast turns even with known scramble. Dataset sources and identity/redistribution conventions require review. Browser storage requires backups and honest failure handling. OLL completion does not imply solved permutation; the planned rep flow accounts for this. Exact sources, tool versions, measured budgets, teaching content, and sync provider are assigned to named later stages rather than guessed now.

## Current progress

Audit and scope interview complete. Consolidated plan written, with detailed trainer and research gates. Focused document review and link checks are being finished. No application tests are available, no research agent or worktree was started, and no deployment occurred. Owner review of the written plan precedes any application implementation.
