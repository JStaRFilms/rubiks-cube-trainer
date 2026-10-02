# Task B08: Deliver F2L case and slot practice

## Agent setup

### Workflow to follow

Vibe Build, coder, `openai-codex/gpt-6.1-sol`, high thinking. Owner authorized continuation after the Q02 recap. Parent owns task state, Git and acceptance.

### Prime agent context

- `docs/imports/PLAN.md` §§3, 4.3, 5, 6.3 and `docs/Project_Requirements.md`
- `docs/issues/FR-008.md`, `FR-002.md`, `FR-003.md`, `FR-004.md`, `FR-012.md`, `FR-013.md`
- `docs/features/Case_Libraries.md`, `docs/data/Case_Sources.md`, `docs/audits/Case_Libraries_Verification.md`
- `docs/features/Cross_One_Trainer.md`, `docs/audits/Q02_Cross_One_Acceptance.md`
- `docs/design/Training_Experience.md`, `docs/design/Design_System.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `src/app/App.tsx`, `CrossPractice.tsx`, `TimerPractice.tsx`, `AttemptHistory.tsx`, `MoveReview.tsx`, `styles.css`
- `src/cases/`, `src/data/`, `src/cube/`, `src/timer/controller.ts`, `src/statistics/attempts.ts`
- `src/store/records.ts`, `repository.ts`, `validation.ts`, `trainer-validator.ts`, `attempt-timing.ts`
- `src/pwa/`, `src/cross-one/client.ts`, `protocol.ts`, `validation.ts`
- `tests/unit/case-libraries.test.ts`, `tests/helpers/case-oracle.ts`, `tests/helpers/timer-browser.tsx`, `tests/browser/cross-one.spec.ts`, `cross.spec.ts`, `timer.spec.ts`, `tests/helpers/update-release.ts`, `package.json`, `.gitattributes`

Read actual types/flows before editing. A named missing predecessor is a blocker, not permission to improvise or fabricate its evidence.

### Overlays

Use `unslop` for readable labels/documents. No new visual direction or unrequested dependencies.

## Objective

Make the accepted 41-case library usable for isolated F2L recognition/execution across slots, with verified overrides, real timing, compatible statistics, backups and offline 3D review. This is FR-008/012/013 integration, not OLL/PLL Time Attack yet.

## Context and dependencies

B07 is accepted. Stable HEAD `e61fd5a` includes `0bc5a8b` libraries and a parent fix preserving pinned source/license bytes through Windows checkout. Both MIT grants were read and all six raw pinned upstream artifacts independently matched SHA-256/length. The Cartesian oracle established exactly 41/57/21 identities, all F2L slot/angle defaults and OLL's permutation-invariance contract. Parent passed lint/typecheck/168 unit tests (one intentionally skipped explicit generator), build/eight Cross/Cross+1 Chrome flows/rebuild/whitespace, then 16 further library tests and ten Windows-filtered artifact/license hashes. New libraries do not enable UI or weaken semantic gates. Remote remains `973a879`; Cross+1 and B07 commits are local. No push authorized here.

## Scope

1. Write `docs/features/F2L_Trainer.md` before significant persistent-flow/schema changes. Document client/worker/validation components, physical base, source/version policy, algorithms/settings/attempt flow, comparison keys and schema compatibility.
2. Use the real 41 F2L cases and source-qualified IDs, source mapping/families and canonical setup. Provide case/family/subset selection, FR-only or random one of FR/FL/BR/BL, rotation hint shown/hidden and execution/recognition. Per-case compatible timing can support manually selected weak-case subsets; do not claim automated coaching or mix unlike slot/hint/mode/inspection/frame/version configurations into one ranking.
3. Generate legal actual challenges with canonical identity, selected slot, supported pre-AUF, color/down-front frame, versions, scramble/start and proof. Preserve solved Cross and other three pairs. Personal algorithms replace guidance only, never setup or identity. Validate transformed overrides against the actual presented state and goal, not only the canonical case or some unrelated F2L state.
4. Physical reset is F2L solved and aligned before each inverse setup: Cross and all four pairs solved; LL arrangement may vary. After setup the target pair is isolated. Make this explicit before every scramble; after Next return to reset/confirmation. A fully solved cube works but is not required. The 3D LL is representative unless the physical starting state was fully solved; never imply actual unrelated pieces were observed. No scrambled-other-pairs mode.
5. Show the isolated case and setup with the shared timer and post-attempt player. Execution may show identity/guidance. Recognition hides current identity, family/algorithm/explanation and reveals only after intended stop/review, including visible text, ARIA and live regions. Requested hint controls only the rotation/view hint. Do not record a physical rotation as observed. Controls/subset choices may naturally state what the user selected, but may not mark the generated current identity during recognition.
6. Personal algorithm editor/reset, canonical and slot-specific guidance where the existing record supports it. Correct slot-specific override wins over canonical fallback; otherwise use sourced default. Honor explicit pre-AUF. Validate all input/import fields, source-qualified IDs, slot/version/identity and intended-case completion before atomic acknowledgement. Rejected input leaves existing algorithms/history untouched; reset removes override. Freeze guidance with presentation/attempt so later changes never rewrite old history/review.
7. Reuse actual TimerController/TimerPractice behavior: background Space without initial click, native controls/editors/dialogs/player retain keyboard ownership, pointer selection/focus repair, cancellation/repeat/competing-source guards, 300 ms arm/release, strict inspection boundaries including fractional rounding, completed-transaction save acknowledgement, failure retry/emergency export, penalty/delete/latest Undo, activity/update isolation. No manual-timer record type or fake seed attempts.
8. Integrate genuine F2L semantic validation before Repository construction. Personal algorithm records may be supported only through complete case validation. F2L saved/restored attempts must verify legality, actual setup/start/scramble/frame/version/identity/isolated context/guidance/timing and compatible session. Retain old valid Cross/Cross+1 backups. Unsupported trainer attempts, practice sets/runs still fail closed until B09 or their own integration. No database/export migration unless needed and explained; existing version 1 can remain when existing record shapes suffice. Persist actual new configuration through a precise backward-compatible settings decoder, not broad casts or unknown-field acceptance.
9. Reuse revision-safe presentation/generation ownership: request/worker instance/epoch/options/frame/session/settings/restore identities, post-await rechecks, suspend before timing/player, invalidate rejected/stale presentations. F2L does not require search; avoid a new generalized catalog framework or expensive speculative solver. Production initialization must validate the real library/model, not a synthetic request sentinel.
10. Update PWA readiness/scope with actual F2L library initialization, required bytes and notices; cold disconnected first-use F2L and post-attempt player, cache repair and safe real update while active. Retain Cross/Cross+1 offline behavior. Update fixture releases must use actual bytes prepared outside the timed exercise; never extend/skip retained assertions to mask a production defect. Rebuild final dist after update exercises.

## Definition of done

- All 41 actual identities work in all slots/allowed angles and six frames, with isolated context preserved and correct source/guidance labeling.
- Recognition does not leak current identity/guidance; hint choice obeyed; keyboard/native control/pointer isolation remains working.
- Default/canonical/slot overrides validate, wrong case/malformed imports reject atomically, reset and history snapshot stability work.
- Real attempt/timing/session history/statistics and penalty/delete/Undo survive restart and confirmed atomic backup restore, including old Cross/Cross+1.
- Actual model/library assets and post-attempt review work from never-opened cold offline state after setup, with repair/update coverage.
- Relevant checks pass and actual failures/limits are recorded. No OLL/PLL/ZBLL/Cross+2 production trainer claim.

## Expected artifacts

- Focused F2L runtime/UI, generator/validator, repository/statistics/PWA integration and strict configuration changes
- Independent case/slot/frame/presentation/override/storage tests and actual F2L browser flows; preserved Cross/Cross+1/input regressions
- `docs/features/F2L_Trainer.md`, `docs/audits/F2L_Trainer_Integration.md`, final asset/source evidence
- README/foundation feature accuracy; do not modify parent orchestration files

## Constraints

No commits/push/branch/Git mutation or task/master/index/summary/board changes. Preserve parent edits and source/license bytes. No new worktrees, dependencies, research, accounts, teaching, deployment, automatic coaching or design polish. Main checkout has one writing agent. Follow established strict TypeScript and storage patterns; no `any`, broad casts or fallbacks that hide missing proof. Source/UI tests are not physical-phone, installed-PWA, audibility, screen-reader, battery or GPU/leak certification.

## Verification and handoff

Use independent Cartesian identities/goals for actual generated presentations rather than production helper self-agreement. Cover all cases/slots/angles/frames and accepted transformed personal algorithms; wrong case, invalid fields/versions/context, stale generation, recognition accessible leaks, requested-versus-observed hint metadata, compatible statistics, strict timing boundaries, valid and invalid old/new backup imports, rejected override atomicity, immutable old review, cold offline/repair and active update/history retention. Run lint/typecheck/focused units/build/production browser; run full relevant regressions when shared flows change. Report actual commands/counts, asset hashes/source notices and unresolved blockers. One implementation and focused self-check; parent reviews before B09, Q03 independently reviews the completed trainer sequence. If blocked stop with exact evidence instead of enabling an unverified trainer.
