# Cube trainer project plan

Status: consolidated from the takeover audit and owner interview. Ready for owner review before implementation.

## 1. Context and authority

The owner is taking charge of the project and will collaborate with the friend who started it. The earlier application code is no longer available. This checkout contains project notes and imported documents, not a working application. Do not count the earlier milestones, tests, datasets, or performance claims as delivered work here.

This is the original planning file, revised at the owner's request rather than replaced by a competing plan. It is the current product plan. `TECHNICAL.md` and the imported `AGENTS.md` describe the earlier effort and need reconciliation before use as implementation guidance. In particular, their exact-K default, desktop-first layout, F2L placement algorithm, 3D first-use caching, timer precision, and completed-milestone claims are not current requirements.

The audit is in `../audits/import-audit.md`. The original conversation remains in `convo.txt`. Speaker attribution is uncertain; confirmed decisions below come from the takeover interview, not guesses about who wrote each chat line.

## 2. Product goal and delivery approach

Build an offline, installable 3×3 speedcubing practice app for all skill levels. The owner is an experienced cuber, but beginner and intermediate users should also understand the controls, terminology, and difficulty settings.

The first audience is the owner, their friend, and other friends. Share working increments throughout development. There is no fixed release date. Correctness and usable training loops determine delivery, not a promise to finish everything before anyone can try it.

Cross and Cross+1 lead the implementation order, with interactive 3D solution review included early. F2L and OLL/PLL Time Attack follow as immediately useful additions. ZBLL and Cross+2 remain committed roadmap features, with Cross+2 behind a solver feasibility gate.

Early delivery does not reduce planning detail for later trainers. Each trainer below has a defined goal, flow, difficulty or case contract, statistics, dependencies, and completion criteria.

Video reconstruction is a prominent parallel research track. It should not wait until every trainer is finished, and trainer delivery must not depend on its success. Structured teaching and account sync have separate later tracks.

### Initial boundaries

- 3×3 only. Other puzzles require a later scope decision.
- No account, backend, cloud sync, or automatic coaching dependency for the initial trainer.
- No smart-cube hardware requirement. Physical completion is self-reported through the timer; the initial app does not observe whether the user solved the requested goal.
- No audio-based scrambling detection or statistical subtraction of guessed scrambling time.
- No custom cube engine or 3D renderer by default. Evaluate existing tools first.
- No full teaching course in the first delivery. Include useful explanations and solution review.

## 3. Shared training experience

### 3.1 Platforms and layout

Phone-first on modern iPhone and Android browsers, with responsive desktop layouts and keyboard controls. Standard touch controls must not depend on owning a particular phone model.

The verification matrix should cover current iOS Safari, Android Chrome, and desktop Chromium/Firefox, with desktop Safari where available. Record actual tested browser/device versions during implementation. Do not translate broad phone support into a guarantee for every obsolete browser or unlimited video-processing capability.

Use a compact dark-default interface: trainer navigation, controls, scramble, timer, optional cube view, and accessible history/statistics. Keep the primary actions reachable on a phone. Interactive player, settings, and history controls must not accidentally trigger timer start/stop. Support visible focus, keyboard navigation, adequate contrast, reduced motion, and large touch targets. Do not make cube colors the only way to identify controls or states.

Introduce shared components when there is actual reuse. Avoid building a large speculative component library before the first training screen works.

### 3.2 Timing flow

Preparation starts when a generated scramble is actually presented, not while its worker request is pending. It ends when execution starts.

Untimed mode:

1. Present the scramble and silently measure total preparation duration.
2. The user scrambles and plans without a deadline or visible preparation clock.
3. Hold the timer area or Space for approximately 300 ms to arm.
4. Release to start execution timing.
5. Tap the timer area or press Space to stop.
6. Save execution and preparation durations, then offer results and review.

15-second inspection mode:

1. Present the scramble and begin the same preparation measurement.
2. After scrambling, tap the timer area or Space to begin inspection. This first action does not also start execution.
3. Show the inspection countdown, with visible warnings and optional audible warnings at 8 and 12 seconds.
4. A subsequent approximately 300 ms hold arms execution; release starts it. Arming time still belongs to inspection.
5. Apply standard-style inspection penalties: start at or after 15 seconds adds +2; at or after 17 seconds is DNF. These are practice records, not official competition results.
6. Tap or press Space to stop execution and save the attempt.

Retain raw execution duration separately from penalties. Inspection DNFs may retain their raw execution duration for personal review, but must not appear as successful results in aggregates.

Use `performance.now()` for elapsed execution and preparation measurements and `requestAnimationFrame` only for display. Persist rounded integer milliseconds. Ignore key repeats, pointer cancellation, and accidental post-stop inputs. Start with a roughly 250 ms post-stop guard and verify it on touch and keyboard.

If the app loses foreground visibility during an attempt, mark it interrupted rather than silently treating it as a valid timed result. Disarm on cancelled input. Offer recovery without losing already saved history. Service-worker updates must never reload an active attempt.

### 3.3 Preparation data is not pure planning data

The owner chose to record total preparation time rather than add a mandatory ready action in untimed mode. It includes physical scrambling, thinking, interruptions, and time spent preparing the attempt.

Explain this in the mode description. Hide its ticking clock, but show the duration after an attempt and in history/trends. In inspection mode, also record the explicitly bounded inspection duration separately.

Do not subtract a guessed scrambling duration, infer a pure planning duration through regression, or describe preparation trends as proof of improved inspection ability. Trend analysis must compare compatible configurations and show sample counts. Sound-based segmentation remains deferred.

### 3.4 History and statistics

Save sessions per trainer, with labels and an attempt list. Support deleting mistakes, +2/DNF edits, and a simple undo for the latest edit/deletion. Save a stopped attempt immediately; reporting persistence failure takes precedence over showing a false saved state.

Shared statistics include recent attempts, best successful time, mean, median, standard deviation, and WCA-style trimmed ao5/ao12 where appropriate. Larger rolling windows and histograms can follow once core records are stable. Handle DNF and +2 explicitly; do not average DNF as zero or silently omit it from a purported competition-style average.

Group/filter by trainer, inspection mode, cross color, selected difficulty ceiling, actual optimal cross depth, combined move cap, selected slot, case, and set as applicable. Display execution and preparation trends separately. Do not combine case reps, whole set runs, and Cross attempts into one average.

For any-pair Cross+1, distinguish the generator's witness slot from what the user actually executed. Do not pretend the app observed the physical choice. A user-reported slot can be optional.

## 4. Trainer specifications

### 4.1 Cross

**Goal.** Practice planning and executing only the cross on the physical cube.

**Controls.** Select cross color and a maximum optimal length K from 1 through 8 in the half-turn metric. A half turn counts as one move. Default color can be white, but every face/color must work through a tested orientation mapping.

Selecting K means the state's shortest cross solution is at most K moves. It does not mean exactly K. Generate nontrivial depths from 1 through K; record the actual optimal depth. Exact-K selection is not required in the agreed delivery.

**Generation.** Use a verified cross-distance table or equivalent proven solver. A cross coordinate tracks four labeled edges and their orientations. There are 190,080 such coordinates; the raw one-byte distance table is roughly 190 KB, not the entire engine/cache footprint.

Sample a supported depth and target coordinate, then generate a legal scramble that reaches it. Randomize unrelated pieces without changing the final selected cross constraint. Verify the final state rather than relying on the name of the construction. Do not advertise uniformly random competition scrambles unless the distribution actually supports that claim.

One viable construction solves the random state's cross and then applies a path from solved cross to the sampled target. Its transition suffix is not itself the solution reveal. Review needs a separate target-to-solved path.

**Attempt and review.** Scramble, plan, time cross only, stop. Reveal an optimal cross in notation and interactive 3D after the attempt. Keep the view and solution aligned with selected color and orientation. Explain that shorter preparation does not necessarily mean better planning.

**Statistics.** Selected ceiling and actual depth, execution, preparation, inspection, penalties, and color. The actual depth allows meaningful comparisons when several depths share one ceiling.

**Completion.** Generated states are legal, independently verified to have depth within the selected ceiling, and nontrivial. Reveals solve the selected cross with the reported optimal length. Touch/keyboard timing, history, backup, and offline 3D work together on supported mobile and desktop browsers.

### 4.2 Cross+1

**Goal.** Plan the cross and first pair together during inspection, then execute until the cross and at least one F2L pair are solved.

**Controls.** Maximum optimal cross depth K, a combined solution move cap L, and an any-pair default with optional FR/FL/BR/BL targeting. Use the same color and inspection controls as Cross.

**Difficulty contract.** The starting state has optimal cross depth at most K. A verified solution solves the cross and permitted pair within L HTM. L is an upper bound backed by an actual solution, not a claim that the shortest combined solution has length L.

K constrains the starting state's independent cross difficulty; it does not promise that the combined witness uses an optimal cross prefix. Intermediate moves may disturb the cross. The final goal must contain a solved cross and the specified completed pair.

Do not silently replace this with the cost of a cross solution followed by an unrelated unconstrained pair BFS. A standalone pair-distance table cannot prove cross-preserving completion.

**Generation and search.** Run bounded search in a worker using valid lower bounds and explicit goal checks. Reuse cross distances and independent pair distances where useful. A maximum of admissible subgoal distances is a valid lower bound; adding them without proof is not.

Prototype targeted construction and filtering before choosing the final strategy. Preserve a concrete witness for each accepted state. Any-pair search must consider the permitted goals; selected-slot mode must verify the chosen slot specifically. Freeze useful caps/tiers only after measuring hit rates and phone latency.

**Attempt and review.** Same preparation/inspection flow as Cross. In any-pair mode, let the user choose their pair without exposing the generator's witness in advance. Stop after cross plus pair. Review the verified solution, its move length and slot in 3D; label it as a found solution, not an optimal one unless independently proved.

**Statistics.** K, actual cross depth, L, slot mode, witness length/slot, execution/preparation/inspection, and penalties. Keep manually reported executed slots distinct from generated metadata.

**Completion.** Every returned challenge meets the selected cross constraint and has a valid combined witness within the cap. Any-pair and targeted-slot goals agree between generation, UI, and review. Budget exhaustion produces a retry/error, never a mislabeled challenge. A representative offline mobile practice session remains responsive.

### 4.3 F2L case and slot practice

**Goal.** Recognize and execute individual pair cases across slots, with useful explanations for less experienced users.

**Initial context.** Isolate the target pair with the cross and all other pairs solved. This is deliberate, not a full random cube with two pieces merely parked into target positions. A more realistic scrambled-other-pairs context can be proposed later, but is not required initially.

**Coverage and controls.** Complete verified 41-case standard inventory, case/family selection, FR-only or random slot practice, rotation hint shown or hidden, personal algorithms, and execution/recognition modes. Define the canonical numbering before importing data; do not count solved or duplicate angle variants as extra cases.

**Generation.** Derive a canonical case from a verified inverse algorithm or equivalent canonical state. Map it into the selected slot using tested orientation/conjugation rules. Verify that the cross and other pairs remain solved. A user's algorithm changes execution guidance, not the identity of the selected case.

**Attempt and review.** Show the isolated case and setup scramble. Execution mode can show identity; recognition mode hides identity and algorithm until review. Slot practice can show or hide the rotation that maps the slot into a familiar view. Use the shared timer and 3D player.

**Statistics.** Per case, slot, hint setting, execution/recognition mode, and inspection mode. Track requested hint/slot metadata, not an unobserved physical rotation. Aggregate weak cases into selectable practice subsets without claiming automated coaching.

**Completion.** All 41 canonical cases and supported slot transforms have fixture-based state tests. Setup and algorithms preserve the required context. Personal overrides are validated against the intended case, not merely accepted because they solve some F2L state. Recognition labels do not leak before the intended reveal.

### 4.4 OLL/PLL Time Attack

**Goal.** Practice algorithm execution and recognition through configurable timed sets.

**Coverage and sets.** Full verified 57 OLL and 21 PLL inventories. Provide full-list defaults and custom subsets such as a user's selected weak cases. Allow personal algorithm overrides, shuffled ordering, optional AUF randomization, and execution/recognition modes.

**Flow.** OLL reps begin with F2L solved and LL oriented; LL permutation need not be solved. The setup must produce the intended OLL orientation pattern from any permitted LL permutation. A successful OLL rep returns to that orientation-solved base, not necessarily a solved cube. This allows consecutive OLL reps without a mandatory PLL between them.

PLL reps begin from a fully solved, aligned cube. Complete the final AUF after each rep before applying the next setup. If a rep failed or the user is unsure of the physical state, restore the appropriate base before continuing. Initial sets contain OLL or PLL cases, not a mixed sequence with an implicit reset rule.

Setup scrambles derive from canonical case data, not from whichever algorithm a user happens to type. Validate OLL overrides for the intended orientation case and preserved F2L; do not reject a correct OLL algorithm merely because it changes LL permutation. PLL overrides must solve their intended permutation under the documented AUF convention. Show identity in execution mode; hide it until after a rep in recognition mode. Inspection behavior is selectable using the same shared modes.

**Results.** Per-rep raw time, penalty, preparation, case, and angle settings. A run summary reports completed/skipped/DNF counts, per-case results, best/worst successful rep, spread, and set mean with an explicit DNF policy. Failed runs must not produce a misleading successful set PB.

Compare set PBs and changes only for the same membership and relevant settings. Per-case rolling results can help choose a new custom practice set. Do not compare a ten-case run to a full list as if they were the same task.

**Completion.** Complete canonical inventory verified, including OLL setups tested across valid LL permutations; sets survive restart/export/import; interrupted runs recover honestly; AUF does not change case identity unexpectedly; timing and run statistics handle skipped/failed reps. A full offline OLL or PLL run works on a phone with responsive review controls.

### 4.5 ZBLL

**Goal.** Practice recognition and execution of last-layer cases with F2L solved and last-layer edges oriented.

**Coverage.** Target the full standard 493-case convention. Before declaring complete coverage, freeze a sourced canonical inventory with explicit family/subset identifiers, AUF equivalences, PLL inclusion, and solved-state policy. Reuse relevant verified PLL data where appropriate rather than creating inconsistent duplicate identities.

**Controls.** Family/subset selection, individual cases or shuffled selected cases, angle/AUF randomization, execution and recognition modes, personal algorithms, and on-demand post-attempt review. Start with verified families in previews; do not advertise a complete ZBLL trainer while shipping a handful of seeds.

**Generation.** Canonical case states and inverse setups preserve solved F2L and oriented LL edges. Test every entry's identity, starting-state constraints, and solving algorithm. Alternative personal algorithms must solve that same case under its documented AUF convention.

**Flow and review.** Last-layer-only reps, not full solves. Begin each setup from a fully solved, aligned cube, and finish the previous rep's AUF before continuing. Unlike OLL, an arbitrary oriented LL permutation is not a valid base for a specific ZBLL setup. Recognition mode must avoid identity/algorithm leaks. Playback and useful short recognition notes are available for review; this is not yet a full guided lesson system.

**Statistics.** Case/family/subset, recognition versus execution, angle settings, inspection mode, execution/preparation, and failures. Show coverage and attempted-case counts so aggregate results are interpretable.

**Completion.** Inventory manifest proves claimed coverage. Every case has validated canonical data and a correct setup/solution. Family selection, personal overrides, offline library access, review, and case-level statistics work without confusing case variants with separate identities.

### 4.6 Cross+2

**Goal.** Plan and solve the cross plus two distinct F2L pairs.

**Initial contract.** Build on Cross+1: maximum optimal cross depth K, a verified complete-goal move cap L, and an any-two-pairs goal. Globally optimal combined length is not required. Additional two-slot targeting is a possible later enhancement, not an initial requirement.

**Hard part.** Do not extrapolate Cross+1 latency to two pairs or ship enormous full combined-coordinate tables by assumption. Search-space size, generation hit rate, cache footprint, startup cost, and heat/memory behavior on mobile must be measured.

**Feasibility gate.** Prototype bounded search or constructive generation using explicit two-pair goal checks and valid heuristics. Validate every witness against the full cube model. Benchmark several cross depths and move caps, including difficult requests. Produce supported cap ranges and failure behavior before setting UI tiers.

If practical generation fails, keep the feature visibly undelivered and bring the findings to the owner. Do not silently rename sequential pair-insertion practice as an equivalent difficulty metric. A sequential alternative is a product change requiring approval.

**Flow and review.** Shared preparation, inspection, and timing; stop when cross and two pairs are complete. Review the verified witness and which two slots it solves in 3D. Do not imply the app observed the user's actual pair order.

**Statistics.** K, actual cross depth, L, witness length and solved slots, execution/preparation/inspection, penalties, and optional user-reported choices.

**Completion.** Feasibility report supports the offered ranges on tested browsers/devices. Generated states and witnesses meet the exact stated goal. Timeouts/cancellation are safe, the timer stays responsive, offline caches are bounded, and no weaker challenge is returned under the requested label.

## 5. Interactive 3D and algorithm review

Include an interactive player in the early Cross/Cross+1 delivery. Evaluate cubing.js and other established cube tools before choosing custom rendering. Record package identity, license, supported notation, offline dependencies, accessibility limitations, and bundle/performance results.

Required player behavior:

- Orbit/zoom on touch and pointer without triggering timer actions.
- Play/pause, step forward/back, speed control, and replay from the generated canonical starting state. In drills that permit variable unrelated pieces, such as consecutive OLL reps, label the view as a representative case rather than claiming it matches every unobserved physical piece.
- Face, wide, slice, and cube-rotation notation needed by verified libraries.
- Correct selected color, frame, and F2L slot mapping.
- Text notation available even when animation is reduced or unavailable.
- Loading/error states and isolation from timer input.

Use one canonical cube-state/notation contract across generator, data verification, 2D views, and player integration. Do not maintain unrelated engines without consistency tests. An animation's final state must match the logical move sequence.

Load 3D code lazily for rendering if useful, but include all required code/assets in initial offline setup. Lazy rendering is not a reason to postpone downloading offline dependencies. Mirroring and advanced playback modes can remain later enhancements.

## 6. Architecture and local data

### 6.1 Technical direction

Use Vite, React, and strict TypeScript for a static PWA. Retain the inherited Tailwind, Zustand, `idb`, and `vite-plugin-pwa` direction where it serves the actual implementation; do not introduce abstraction layers just to satisfy a dependency list.

Use Vitest for focused logic tests and Playwright for browser flows/offline verification. Keep solving/generation in a Web Worker. Keep small synchronous case lookups simple unless measurements justify worker overhead.

First evaluate existing cube models, notation parsers, solvers, and players. Any csTimer-derived code or public algorithm collection needs license/source review before reuse. Do not assume a public repository or sheet is unrestricted to copy.

Only build a missing custom component after the evaluation identifies a requirement an existing tool cannot reasonably meet. Record the decision and tests, not a blanket commitment to reimplement the ecosystem.

### 6.2 Generation contract and failure behavior

Requests include trainer, options, and a request ID. Replies include the legal scramble, canonical resulting state or reproducible state identity, configuration, verified metadata/witness, and engine/dataset versions.

Prepare a small bounded next-challenge queue where useful. A settings change invalidates old requests; a stale result cannot overwrite the selected challenge. Support cancellation, progress during first-run initialization, time budgets, and worker failure recovery. Search failure must be explicit.

Do not change requested difficulty silently, block the main thread for a long search, or let background candidate generation contend with active timing/player interactions. Solver caches are disposable and versioned; deleting them must not delete personal history.

### 6.3 Case data and personal algorithms

Maintain stable case IDs and canonical states independently of personal algorithms. Each entry records trainer/family, canonical identity, default algorithm, setup/angle rules, source attribution, and dataset version.

Verify setup constraints, intended identity, and solving behavior through the selected cube engine. Distinguish valid notation, a genuine case, and the correct requested case. All three matter.

Validate imports before storage. A malformed file or invalid override leaves existing data intact and reports actionable errors. Define allowed AUF/rotation equivalence explicitly. Reset-to-default removes the override rather than overwriting the canonical dataset.

### 6.4 IndexedDB and exports

Initial logical stores are settings, sessions, solves/attempts, personal algorithms, practice sets/runs, and disposable solver cache. Add reconstruction, teaching, or sync stores only when those features are actually integrated.

An attempt records identity/session/trainer, scramble, timestamp, raw integer execution/preparation durations, optional inspection duration, penalty, interruption status, applicable configuration, verified generation metadata, and engine/dataset versions. Avoid persisting derived rolling averages when they can be computed from records.

Use IndexedDB's database version for store migrations. Export files have their own explicit format/version. Keep those concepts distinct. Test forward migrations against fixtures before release; report unsupported newer exports rather than discarding unknown data.

Export/import includes settings, sessions, attempts, personal algorithms, and sets/runs, not rebuildable solver caches. Validate the whole import before mutation. Initial restore can use a clear confirmed replace operation after offering a backup; do not silently merge ambiguous duplicate histories. Clearing data also requires confirmation.

Browser storage can be evicted or cleared. Explain that it is local, offer file backup early, request persistent storage where supported without promising it, and handle quota/storage errors honestly. Sync later is not a substitute for current backup.

## 7. Offline and update contract

Every included trainer, case library, timer, history view, explanation, font/icon, and 3D dependency works offline after initial setup completes. No external CDN or API is needed for normal trainer operation.

Initial setup must download the required assets, initialize needed caches/tables as applicable, and confirm offline readiness. If interrupted, preserve completed work and provide retry/resume without claiming setup finished. Define the readiness check from actual cache/asset availability, not `navigator.onLine` alone.

Precache versioned application assets, including the player. Test a feature that has never been opened before disconnecting. Cold offline navigation and an installed-app restart must still load it.

Prompt for available updates. Never reload or replace an active attempt automatically. Keep new worker/asset versions consistent; stale caches must not combine incompatible engine data. Normal history survives an update and migrations. Static hosting can be chosen when deployment is authorized; no production deployment is part of this plan-writing task.

The eventual reconstruction model/download may have its own explicit readiness step. Until that research feature is integrated, it is not a hidden requirement for downloading or using the trainer.

## 8. Prominent parallel video-reconstruction track

### 8.1 Intended result

Given an uploaded solve video and the known initial scramble, reconstruct moves with timestamps, expose uncertain intervals, and provide correction tools. Use the corrected move sequence to derive solve/phase information only where the available observations support it.

The target is local processing without uploading recordings after necessary models/assets are downloaded. A desktop research prototype is acceptable first, but browser and mobile feasibility is a separate gate. Broad phone support for the timer does not prove broad phone performance for computer vision.

### 8.2 Research setup and evidence

Start this track once the shared cube-state, notation, and reconstruction-result interface are stable enough to avoid coupling both agents' work. The owner will authorize a separate worktree and agent when ready. No research agent is launched automatically by this plan.

Before that launch, agree a bounded experiment packet, consented sample recordings, and stop/review criteria. Known scramble reduces ambiguity but does not remove occlusion, blur, rotation, skipped visible states, or uncertain video timestamps.

Test uploaded recordings under documented framing/lighting conditions, with different speeds, rotations, resolutions, and frame rates. Include ordinary 30 fps and higher-frame-rate recordings as test conditions, not promised accuracy classes. Ground truth must be independently annotated or otherwise verified. Do not use the model's own reconstruction as its correctness reference.

Report:

- Move error rates under a defined normalization/alignment convention.
- Whole-solve exact reconstruction rate and correct final-state rate separately. Reaching solved alone does not prove every move was recovered.
- Timing error against annotated intervals, plus uncertainty from frame resolution.
- Manual correction effort versus reconstructing the same solve manually.
- Failure/abstention rates, rotations, occlusion, and high-speed cases.
- Runtime, peak memory, download size, and device/browser compatibility.

### 8.3 Correction and integration

The prototype should support video-aligned move review, insertion/deletion/replacement, uncertain-span markers, and replay from the known initial state. Preserve which moves were detected versus corrected. Model scores are not guaranteed confidence percentages without calibration.

Provide a versioned result format with initial scramble/state, moves/timing intervals, uncertainty, source markers, and validation status. Use the shared engine to check legal transitions and final state. Do not invent a fully observed sequence through ambiguous spans merely to return a complete-looking result.

Only integrate after the owner reviews evidence that assisted reconstruction is useful, uncertainty is honest, corrections are feasible, and local browser processing has a supported path. Freeze numerical release thresholds from the measured baseline before advertising supported performance. Otherwise retain the experiment and findings without blocking the trainer.

Recordings stay local by default. Persistence/export of large videos must be user-controlled. No server fallback or upload is silently introduced. Any proposal for online processing requires a new privacy, cost, and scope decision.

## 9. Later teaching and sync tracks

### 9.1 Structured teaching

Initial screens explain terminology, goal, difficulty, setup/reset, and solution review. Later teaching can add guided cross planning, first-pair prediction, F2L recognition/slot handling, and last-layer recognition modules.

Research professional guidance through permitted sources. Record attribution, relevant timestamps/links, and disagreements; do not assume permission to scrape or republish video transcripts, illustrations, or course content. An agent may help draft source-backed lessons after a separate research authorization.

The owner reviews and edits every module before publication. A module needs a learning objective, prerequisites, an explanation/example, a compatible practice activity, and a way to check understanding. Avoid calling one professional's preferred technique universally optimal. Pilot modules with cubers at the intended level before building a large course.

No generated automatic coaching claims or prebuilt learning-management system are required initially. Audio-based detection is a separate deferred idea, not part of the lesson pipeline.

### 9.2 Accounts and synchronization

Plan cross-device settings/history/algorithm sync after local schemas, backups, and migration behavior are stable. Choose hosting/authentication/provider only through a later architecture decision with cost and privacy requirements.

That plan must address offline writes, stable IDs, conflicts, duplicate attempts, deleted records, algorithm/set edits, device loss, authentication failure, and account deletion/export. Test concurrent changes before exposing sync to friends. Do not rely on naive last-write-wins for every domain without examining data loss.

Do not add an initial backend or speculative sync fields everywhere merely because this track exists. File export/import remains useful even after synchronization.

## 10. Delivery stages and gates

| Stage | Deliverable | Gate |
| --- | --- | --- |
| D0 | Evaluate reusable cube/player tools; establish cube/notation contract, minimal PWA shell, timer input prototype, canonical case conventions | Written reuse/license decision, state/notation fixtures, mobile touch/keyboard prototype, offline asset strategy |
| D1 | Complete Cross loop with preparation data, optional strict inspection, history, file backup, color selection, optimal review, and interactive 3D | Legal bounded-depth generation, correct reveals, accurate timer state machine, cold offline readiness including never-opened player, browser flow tests |
| D2 | Cross+1 with any-pair/targeted-slot goals and verified move caps | Measured generation ranges, every challenge has a correct witness, cancellation/timeouts safe, UI/statistics label bounds honestly |
| D3 | F2L case/slot trainer and full verified standard library | All cases/slots preserve isolated context, overrides and recognition rules correct, offline case progress |
| D4 | OLL/PLL Time Attack with full verified sets, custom sets, AUF options, and run summaries | Canonical coverage, known-state rep flow, DNF/set-comparison semantics, restart/export recovery |
| D5 | ZBLL family/subset training and full inventory | Sourced coverage manifest, every case verified, honest progress/identity/angle behavior |
| D6a | Cross+2 feasibility experiment | Supported ranges, bounded runtime/memory, correct two-pair witnesses, owner go/no-go review |
| D6b | Cross+2 integration if D6a passes | Same correctness/offline/input gates as Cross+1, no undocumented sequential substitute |
| R1 | Video research in a separate authorized worktree, beginning after D0 contracts are usable | Ground truth, measured errors/correction effort/runtime, uncertainty review, browser/mobile go/no-go |
| R2 | Sourced, owner-reviewed teaching modules after practice foundations are usable | Rights/attribution review, editorial acceptance, beginner/intermediate pilot feedback |
| R3 | Account/sync architecture and later implementation | Approved provider/privacy/cost model, conflict and data-loss tests, offline behavior |

Share development previews at every usable stage. A preview can explicitly show limited verified case coverage; a completed trainer cannot hide missing inventory behind a milestone label. UI, offline behavior, persistence, backup, and relevant tests are part of each stage, not one final polish milestone.

No calendar estimate is asserted before the library and solver experiments. Research tracks get bounded packets and explicit review checkpoints rather than indefinite instructions to keep trying.

## 11. Verification and release discipline

Run the narrow checks relevant to each change, then broader build/browser checks when its impact warrants them. Initial tooling should provide lint, typecheck, unit tests, and production build scripts; do not claim inherited results as fresh verification.

### Required evidence

- Cube fixtures, move/inverse and frame/slot consistency, and engine/player end-state agreement.
- Cross depths independently checked against known fixtures or a separate reference, plus generation assertions across every supported depth/color.
- Cross+1/+2 witnesses applied to the full state, exact goal checks, configuration changes, cancellation, and exhausted-search tests.
- Every bundled canonical case/setup/solution validated, with duplicate/coverage checks and invalid personal-override/import tests.
- Timer tests for 300 ms arming, press/release ordering, key repeat, touch cancellation, inspection at 15/17 seconds, penalties, and background interruption.
- Statistics fixtures for DNF, +2, trimmed averages, incompatible set comparisons, and preparation labels.
- Persistence/export/import round-trip, migration fixtures, malformed-file rejection, interrupted writes, and visible storage failure.
- Offline cold start, never-opened features after setup, interrupted setup recovery, safe update while timing, and retained history.
- Mobile and desktop practice sessions with player gestures isolated from timer controls.

Performance targets are hypotheses until measured. Start by aiming for immediate UI feedback and warm generation in the hundreds of milliseconds for Cross/Cross+1. Record p50/p95, cold initialization, memory/cache/download costs, and difficult configurations on representative iOS/Android browsers. Freeze enforceable budgets from those results. Cross+2 and video need their own measured gates, not borrowed targets.

A stage is done when its stated behavior works, focused checks pass, and no confirmed blocking regression remains. Use one focused correctness/interaction review and repair confirmed defects. Do not impose an endless "zero criticism" loop or turn stylistic suggestions into extra product scope.

## 12. Collaboration and next action

Use one shared repository. Both the owner and friend can contribute code and real-cube testing; the owner owns scope and final integration. Keep changes small and reviewed. Independent research can use separate branches/worktrees with explicit file/interface ownership. Do not have agents concurrently modifying the same checkout.

A research handoff needs an objective, inputs, allowed scope, expected artifacts, verification method, and stop condition. Review findings before merging research dependencies or changing the main app's guarantees.

Next, the owner reviews this consolidated plan. Once approved, start D0. Do not start application implementation, create worktrees, scrape external material, configure accounts, or deploy simply because they are described here.

Naming, host selection, exact dataset sources, package versions, measured tier caps, video thresholds, lesson content, and sync provider are deliberately deferred to their named stages. These are implementation/research decisions with gates, not missing permission to expand product scope.
