# Task B09: Deliver OLL and PLL Time Attack

## Confirmed Q03 repair, current scope

The initial B09 checkpoint is committed as `335a730`. Fresh independent Q03 returned FAIL for one confirmed integration blocker: saving a valid OLL or PLL override prevents F2L from starting because `F2LPractice` dispatches all stored personal algorithms to F2L-only generation validation. Read `docs/audits/Q03_Case_Trainers_Acceptance.md` and reviewer traces in `.pi/takomi/q03-mixed-guidance/`.

Reuse `coder-b09`. Make only the narrow dispatch correction and focused mixed-guidance regression. Pass genuine F2L overrides to generation, retaining the full selected/stored algorithm list for global validation and post-await ownership checks. Do not broaden `createF2L` validation, delete LL records, weaken backups or stale guards, or change canonical setup/history. Production regression must save valid OLL and PLL guidance, retain F2L guidance as applicable, then actually generate/time/save F2L with preserved algorithms. Update the B09 audit with commands/results. Parent records Q03 outcome and task state. Existing 260-unit/math/offline/source checks are baseline evidence, not permission for unrelated changes. Return actual focused PASS/FAIL/BLOCKED; same reviewer performs a targeted recheck. No Git/state writes or new trainer work.

## Agent setup

### Workflow to follow

Vibe Build, coder, `openai-codex/gpt-6.1-sol`, high thinking. Owner authorized continued case-trainer work after Q02. Parent owns Git, task state and acceptance.

### Prime agent context

- `docs/imports/PLAN.md` §§3, 4.4, 6.3, 6.4 and `docs/Project_Requirements.md`
- `docs/issues/FR-009.md`, `FR-002.md`, `FR-003.md`, `FR-004.md`, `FR-012.md`, `FR-013.md`
- `docs/architecture/Core_Architecture.md`, `docs/design/Training_Experience.md`, `docs/design/Design_System.md`
- `docs/features/Case_Libraries.md`, `F2L_Trainer.md`, `docs/data/Case_Sources.md`
- `docs/audits/Case_Libraries_Verification.md`, `F2L_Trainer_Integration.md`
- `docs/tasks/orchestrator-sessions/orch-20260930-021158/master_plan.md`
- `src/data/`, `src/cases/`, `src/cube/`, `src/f2l/`
- `src/app/{App,TimerPractice,AttemptHistory,MoveReview,F2LPractice,F2LSettings,F2LAlgorithms,F2LCaseView}.tsx`, `src/app/styles.css`
- `src/store/{records,repository,validation,trainer-validator,attempt-timing}.ts`, `src/timer/controller.ts`, `src/statistics/attempts.ts`, `src/pwa/`
- `tests/unit/{case-libraries,f2l,f2l-client,cross-one-storage,timer,statistics,history,storage,pwa}.test.ts`
- `tests/helpers/case-oracle.ts`, `tests/browser/{f2l,cross-one,timer,cross,update-contract}.spec.ts`, `tests/helpers/update-release.ts`, `package.json`, `.gitattributes`

Read actual code/types/tests before edits. Missing required outputs are blockers, not permission to fabricate them.

### Overlays

Use `unslop` for readable copy. Reuse the interim desktop A/mobile B layout; no design exploration or new dependencies.

## Objective

Deliver separate, offline OLL and PLL Time Attack sets with real per-rep timing, validated personal guidance, correct physical reset semantics, transactional outcomes/recovery and honest compatible results. Do not start ZBLL or research.

## Context and dependencies

B07 source libraries and B08 actual F2L are parent accepted. HEAD `c1c6c47` is the local F2L checkpoint, following `e61fd5a` exact-source-byte fix and `0bc5a8b` library checkpoint. Source-qualified 41/57/21 identities, two pinned MIT grants and all six upstream artifacts are verified; retain notices/bytes. The Cartesian oracle exhaustively checked all 288 legal oriented LL permutations for every OLL/angle and all PLL angles; symbolic proofs support arbitrary allowed physical bases. Parent B08 checks passed lint/typecheck/212 units with one intentional generator skip, fourteen F2L/Cross/Cross+1 and four input/cache Chrome regressions, final 46-asset/source rebuild and whitespace. Implementer separately passed all 43 Chrome cases. Current OLL/PLL attempts/overrides and sets/runs remain closed. Remote is still the explicit `973a879` push. Parent edits to orchestration files are expected; do not overwrite them.

## Scope

1. Write `docs/features/Time_Attack.md` before changing persistent flow/schema. Describe components, physical bases, case/algorithm/version snapshots, set/run state machine, comparison/mean/PB policy, storage transactions and backward-compatible data boundaries.
2. Separate OLL and PLL flows, full 57/21 defaults, custom nonempty unique subsets/sets, case/family selection where sourced, manually chosen weak cases, optional shuffle and AUF randomization, execution/recognition and existing inspection modes. Freeze membership and relevant settings/angles/versions/guidance per run. Personal algorithms must never change canonical setup or identity.
3. Use actual B07 data and proper frame/pre-AUF/yaw transformations. OLL physical base: F2L solved and LL oriented, any legal LL permutation. Setup yields intended orientation from every permitted base; completion preserves F2L and orients LL, not necessarily solves PLL. Consecutive OLL reps need no mandatory PLL. PLL base: fully solved/aligned; complete required final AUF before the next setup. Explicitly confirm the appropriate aligned base before every rep, including resume/skip/failed/uncertain state. A model/player's OLL permutation is representative, not observed. PLL's model comes from the confirmed solved base, not a camera. Do not direct a user who executed a different unobserved algorithm to blindly apply the frozen guide's AUF; frame/base alignment is the confirmation authority.
4. Validate canonical/default and personal OLL/PLL guidance against intended identity and actual presented angle. Correct OLL algorithms that change permutation are valid; wrong orientation/F2L damage is not. PLL must solve permutation with explicit final AUF. Honor personal pre-AUF, preserve F2L slot overrides, validate complete imports before atomic storage, reject malformed/unknown/wrong-case/version fields without old-data mutation. Reset deletes only the override. History/review uses immutable captured guidance even after later edits. Do not permit silent mid-run changes to comparison-relevant snapshots.
5. Recognition hides current identity/family/algorithm/explanation until intended stop or deliberate post-interruption review, including ARIA/live regions. Actual setup and nonidentifying cube view remain usable. Execution may show guidance; running timer retains established hiding. No observed physical solution/rotation/permutation claims.
6. Reuse shared TimerController/TimerPractice/input/save acknowledgement/failure recovery/penalty/delete/Undo and activity/update/visibility behavior. Background Space, native controls/editors/dialogs/player, hold/release, competing input, fractional strict-inspection boundaries and pointer focus/selection fixes must survive. No manual timing record, seed attempts or fake full-set results.
7. Implement strict actual OLL/PLL challenge/attempt/algorithm/set/run semantics before Repository construction. Preserve old valid Cross/Cross+1/F2L backups. Reject unsupported ZBLL/Cross+2, unknown IDs/fields/versions, duplicate memberships/rep references, wrong trainer/session/set snapshots, forged comparison keys/angles/guidance, mismatched cursor/outcomes and dangling cross-run links. Per-rep actual timing/context legality must be validated, not inferred from a trusted-looking run label. Dataset/identity policy versions are separate; do not change existing trainer historical versions.
8. Persist start/plan before presenting reps. Acknowledged attempt and matching run outcome/cursor advancement must be one revision-safe transaction, including retry/idempotence and cross-tab races. Skips/interruption/abandonment and recovery are explicit, never fabricated completed times. Restart/restore must mark active work honestly, require physical reset and avoid duplicate reps. Keep membership/plan/captured settings/guidance stable, retain interruption evidence needed for truthful result eligibility. Define/verify the exact state transitions before coding. Existing backup/database version 1 may remain if already-supported structural extensions suffice; do not migrate unnecessarily. User-set edits/deletes cannot rewrite historical run snapshots.
9. Summary: completed/skipped/DNF/interrupted counts and per-case raw/effective time/penalty/preparation/angles, best/worst successful rep/spread and explicit set mean policy. Any DNF must not become a successful mean/PB by dropping it. Skipped/interrupted/incomplete/abandoned runs cannot produce a misleading successful set PB. Compare PB/change only for identical membership and relevant settings/frame/dataset/identity/guidance/policies; never ten cases versus full list or OLL versus PLL. Compute comparison keys from validated snapshots, not imported strings. Preparation/execution remain separate and observed timing labels honest.
10. History penalty edits, deletion and latest Undo must preserve/reconcile linked outcomes atomically, invalidating formerly successful run results where appropriate. Validated file preview/confirmed restore, emergency attempt recovery, sets/run restart and source notices stay functional. Don't orphan run-linked attempts or attach old records to a different frozen plan.
11. Actual LL library/model readiness and emitted bytes join offline setup. Cold disconnected never-opened OLL/PLL and player, full/subset runs, restart/backup, cache repair and safe actual update while active must work. Keep all Cross/Cross+1/F2L offline contracts. Prepare alternate actual release outside timed update exercise; preserve retained timeouts/assertions; final rebuild after updates. No synthetic readiness sentinel.

## Definition of done

- Complete sourced 57 OLL and 21 PLL runs/subsets/algorithms are usable with correct independent state/angle/base proofs.
- All legal OLL base permutations preserve orientation identity and goal; PLL final AUF/alignment and six physical frames work.
- Genuine per-rep save/outcome/cursor transactions, skips/DNF/interruption/abandon/resume/retry and imported snapshots cannot duplicate or fabricate results.
- Compatible statistics/PBs, sets/overrides/history mutation and file/restart recovery work without corrupting earlier trainers.
- Recognition/keyboard/pointer/editor isolation and actual offline initialization/review/repair/update are tested; relevant checks pass.
- Unsupported trainers remain closed; no unrun device/certification claim.

## Expected artifacts

- Focused LL generator/validator and Time Attack set/run/editor/result UI, minimal shared storage/timer/statistics/PWA integration
- Independent LL/base/angle/guidance and strict set/run/atomicity/statistics/client fixtures, production run/recovery/offline browser tests and preserved regressions
- `docs/features/Time_Attack.md`, `docs/audits/Time_Attack_Integration.md`, final asset/source evidence; accurate README/foundation/library docs

## Constraints

No Git/index/commit/push/branch mutation, board/task/master/index/summary edits, worktrees, new dependencies, teaching, deployment, accounts, video research, datasets beyond B07 or new visual language. Preserve unrelated parent changes and exact source/licenses/.gitattributes. Main checkout is single-writer. Strict idiomatic TypeScript, no broad casts/`any`, no fake datasets/semantic bypass or unsupported feature defaults. Library/Chrome/touch-emulation checks are not physical-phone, installed-PWA, actual audio/screen-reader, thermal/GPU/leak certification.

## Verification and handoff

Use independent Cartesian replay/identities for actual generated LL setups and transformed guidance, all cases/angles/six frames, OLL legal base permutation robustness and accepted permutation-changing overrides, PLL final AUF. Exercise real saved runs with unique links, chronological cursor/outcomes, full memberships and custom subsets, same/different comparison scopes, +2/DNF/skip/interruption/abandon/restart/restore, quota/rollback/stale revisions/retry/undo/editor failure and frozen review. Full 57/21 plan/coverage must be proven, not claimed from a two-case demo. Production browser flows must time real reps through the actual timer, with no seeded history; full-run checks may use test clock acceleration but disclose it, not physical solves. Preserve existing timing/PWA/Cross/Cross+1/F2L regressions. Run lint/typecheck/focused and full relevant units/build/browser, then actual final asset/source check after updates. Report exact commands/counts/failures/conditions and PASS/FAIL/BLOCKED. Parent reviews, then fresh read-only Q03 before further trainers. Stop if blocked; do not enable an unverified screen to satisfy a milestone.
