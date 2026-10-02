# Project checkpoint and remaining delivery

## Current status

The verified app delivers offline Cross, Cross+1, F2L and separate OLL/PLL Time Attack. The complete 493-case ZBLL library is implemented and verified, but ZBLL practice is not built. Cross+2 and the rest of the roadmap remain unfinished.

The owner authorized committing/pushing the accumulated release and current orchestration documents, publishing on GitHub Pages, and opening this consolidated status issue. Confirmed production target is https://jstarfilms.github.io/rubiks-cube-trainer/. Local Pages preparation passed; actual workflow/live deployment verification is recorded separately after publication. This document does not turn a configured site into a completed deployment.

## Product and planning

- Audited imported discussions and unavailable original application code. Eight interview rounds produced the authoritative `docs/imports/PLAN.md`; inherited technical/agent documents are historical.
- Created FR-001 through FR-016, builder/coding guidance, source/tool decisions and core architecture.
- Initial design was rejected. Owner selected an interim A-desktop/B-mobile workspace to prioritize functionality; visual polish is deferred. Responsive/focus/contrast checks do not establish aesthetic approval or physical accessibility certification.
- All levels are intended. Desktop Space and modern phone browsers are supported targets. Everything included must work offline after setup. Local persistence/file backups lead; accounts/sync/teaching and video research remain later tracks.

## Delivered app

### Foundation and cube review

React/Vite/strict TypeScript PWA, pnpm 10.33.2, local settings/sessions, acknowledged IndexedDB writes, quota/error handling and file backups. Restore previews are validated and revision-safe, with confirmed atomic replacement and rollback. Database/export remain version 1. No cloud account, server history or sync is required.

Pinned cubing model/player integration includes a versioned facelet wire format, legality, notation bounds, six color frames and slot transforms. Interactive 3D offers play/pause, step/replay/speed, orbit/zoom, reduced-motion and text/loading/retry behavior. Included model/player/source/notice assets are hashed and work offline. Optional GPL solver/search paths are not imported.

Worker correspondence/cancellation and synthetic reconstruction interchange exist. They are not video recognition or reconstruction from footage.

### Timer, history and statistics

Shared real challenge timing has hold/release arming, preparation/inspection/execution, +2/DNF/interruption, save acknowledgement/retry/emergency export and immutable review snapshots. Penalty/delete/latest Undo, sessions and compatible statistics use real saved records. Preparation includes setup/thinking, is separate from execution and hidden while running.

Space works without clicking the timer while native buttons/editors/dialogs/player retain keyboard ownership. Held-key focus/window loss cancels safely; pointer focus/selection suppression is scoped and Tab focus remains visible. Completion is physically self-reported, not sensor-observed.

### Cross and Cross+1

Cross uses a project-owned independently checked 190,080-state four-edge HTM table. K1 through K8 is a ceiling, not exact difficulty; half turns count as one move. All six down colors work, with optimal Cross review. Physical base needs solved/aligned Cross; unrelated displayed pieces are representative unless starting fully solved. No full-cube optimality or uniform competition-scramble claim.

Cross+1 supports any pair or FR/FL/BR/BL. Independent Cross depth must be within K and a concrete simultaneous Cross/pair witness within L. Current K1..8/L1..12 ranges, five-second/10,000-node budget and initial K3/L8 are provisional desktop-tested bounds. It requires fully solved/aligned confirmation each setup. Review is a found upper-bound witness, not a global optimum or an observed executed pair.

### F2L, OLL and PLL

Complete sourced 41 F2L / 57 OLL / 21 PLL inventories have stable identities, source aliases/families, independent geometry and default/setup/angle/override proofs. Exact pinned source and license bytes are protected from Windows newline conversion.

F2L supports case/family/search/manual subsets, FR/random slot, fixed/random pre-U, execution/recognition and canonical/slot algorithms. Start with solved/aligned Cross and all four pairs; arbitrary LL is allowed and review LL is representative. Slot override takes precedence over transformed canonical guidance, then source default. Recognition hides generated identity/guidance until the intended reveal.

Separate OLL and PLL Time Attack use full or unique custom subsets, weak-case selections, shuffle/angles/modes/inspection and frozen real run plans/settings/versions/guidance. Presented markers and stopped attempt/outcome/cursor acknowledgement are durable and idempotent. Resume/skip/failure/abandon/restart are honest and need physical base confirmation. Linked penalties/delete/Undo reconcile results.

OLL needs F2L solved and oriented LL as the setup base, allowing all 288 legal oriented permutations. Reps orient LL and need not solve PLL. PLL starts fully solved/aligned; guidance restores held frame before final AUF. After an unobserved different execution, users physically align rather than blindly applying the displayed guide AUF. Successful set mean/PB requires a complete successful compatible run; skipped/DNF/interrupted/incomplete/abandoned runs cannot earn successful set PB.

Saving OLL/PLL algorithms previously blocked F2L generation. The Q03 defect was repaired by filtering only F2L's generator payload while preserving full global semantic validation and stale ownership snapshots. A real mixed-editor/generation/timing/history regression and independent targeted recheck passed.

### Verified ZBLL data, not practice

B10 supplies 472 sourced non-PLL entries plus the unchanged 21 canonical PLL entries, exactly 493 non-solved identities. T/U/L/Pi/S/AS have 72 each, H40 and PLL21, with declared family/COLL-subset/source mappings. Independent 7,776 legal states form 494 pre-U/proper-yaw classes including solved. Mirrors/inverses/tilts are not quotiented.

47,328 default and 47,328 personal case/angle/six-frame presentations, all-case wrong-guidance rejection, 4,608 ending-regrip presentations and 11,832 identity/regrip checks passed. Shared PLL IDs/override keys/policies remain old; new non-PLL data and identity versions are separate. Source setup never depends on personal guidance. Trusted source-only `R3` spelling normalization does not weaken personal notation.

Publisher MIT permission permits bounded ZBTrain move-string/label reuse with Christian Naguio notice and reported Roman Strakhov credit; AlphaSheep definitions retain Brendan James Gray notice. No separate upstream ownership grant is asserted. Two historical source BLOCKED rounds and the independent source-only PASS remain documented.

B11's async dispatch has no recoverable status/result or implementation. Native control reports no active async run; the cause is unknown. Its prior running claim was corrected, B11 is blocked and Q04 pending. ZBLL UI, worker, attempt/storage/statistics readiness and full integration review must still be delivered. The production app does not advertise them.

## Release and verification

P01 adds the official main/manual GitHub Pages workflow, frozen pnpm/Node build, scoped repository base, correct HTML/manifest/icons/public links, strict in-scope asset evidence, worker registration/cache/navigation/update isolation and root compatibility. No schema/model/timing/source data changed. Other-app caches/windows do not block or leak into this deployment; old caches are not automatically deleted.

Important evidence is attributed, not pooled into a fictional aggregate:

- Foundation/migration, cube/player, timer/Cross and Cross+1 checks are retained in their integration/Q01/Q02 audits. B02 initially FAILED, was fixed and parent-verified; missing reports are not independent PASS.
- Q03 initially FAILED mixed guidance, then the same reviewer approved a targeted recheck. Earlier startup/update timeouts and separately passing reruns remain. No clean final full historical browser aggregate is claimed.
- B10 parent independently repeated lint/typecheck and 45 tests, including all eight full new proof tests, plus 52-asset source/notice inspection and Windows-safe byte checks.
- P01 coder passed 162 relevant units, 22 root browser regressions and seven Pages tests. Parent repeated lint/typecheck, 80 relevant units and all seven Pages tests, then rebuilt the 52-asset Pages bundle with exact pins/notices/source inspection. Repeated runs do not increase unique coverage.
- Live Actions, HTTPS delivery and public-origin runtime/offline checks are a separate publication step. The build includes a large source archive and a main-chunk warning; startup/readiness variability is not declared fixed.

Moving from localhost/dev/preview to the Pages HTTPS origin creates separate browser storage. Export a validated backup from the old origin and restore it on the new one if transferring history. No automatic transfer, server database or deployment of personal records occurs.

## Remaining roadmap and limits

- [ ] Recover/resume B11 ZBLL family/subset/case/mode/angle practice, shared PLL editing, genuine strict storage, immutable history, compatible statistics and truthful coverage.
- [ ] Fresh Q04 mathematical/integration/recognition/storage/offline review after B11, then Q06 cumulative core readiness.
- [ ] B12 Cross+2 feasibility proof; B13 only after an explicit go decision, then Q05. Not a delivered feature.
- [ ] R01/R02 separately authorized local video research, uncertainty/manual correction and grounded experiments. Current synthetic interchange is not recognition. No research launch occurred.
- [ ] Source-backed teaching pilots and later account/sync architecture. No invented lessons/accounts/backend.
- [ ] Visual polish after functional feedback.
- [ ] Physical iPhone/Android, Firefox/Safari, OS-installed PWA restart/update, screen readers, real audio, physical touch/solve, GPU/thermal/battery/performance and long-session leaks. Desktop Chrome/headless/touch emulation does not certify them.
- [ ] Investigate retained startup/model-readiness and history/update-hydration variability with evidence, without hiding failures or weakening deadlines.

## Durable orchestration and references

Session master, index, summary, task packets and `Agent_Execution_Ledger.md` under `docs/tasks/orchestrator-sessions/orch-20260930-021158/` record actual acceptance, missing dispatches and role overrides. Initial board model/persona hints are not proof of served models or completed runs. Parent owns integration/Git/acceptance; coders and read-only reviewers have separate evidence.

Key audits include `B01_Foundation_Handoff.md`, `Cube_Tools_Integration.md`, `Timer_Statistics_Integration.md`, `Cross_Trainer_Integration.md`, `Q01_First_Usable_Increment.md`, `Cross_One_Feasibility.md`, `Cross_One_Integration.md`, `Q02_Cross_One_Acceptance.md`, `Case_Libraries_Verification.md`, `F2L_Trainer_Integration.md`, `Time_Attack_Integration.md`, `Q03_Case_Trainers_Acceptance.md`, `ZBLL_Source_Acceptance_Review.md`, `ZBLL_Library_Verification.md` and `GitHub_Pages_Deployment_Preparation.md`. The project is a verified useful increment, not the full finished plan.
