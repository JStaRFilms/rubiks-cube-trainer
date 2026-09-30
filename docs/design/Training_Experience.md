# Training experience

D01 design review, session `orch-20260930-021158`. Working name: Cube Trainer. This is a proposed visual direction for owner review, not permission to Build. [PLAN](../imports/PLAN.md), [Core architecture](../architecture/Core_Architecture.md) and [Trainer foundation](../features/Trainer_Foundation.md) control behavior and data. Layouts are in [Training screens](../mockups/Training_Screens.md); open [Training review](../mockups/Training_Review.html) locally to inspect phone and desktop compositions.

## Users and structure

The owner and friends need fast physical-cube practice without a dashboard getting in the way. Newer cubers need plain goal/reset explanations; experienced cubers need compact controls and reliable start/stop. No automatic physical solve detection is implied.

Primary journey: select trainer and options, confirm the physical base where required, apply the setup, plan, time, save, then review or continue. Secondary journeys are compatible history, case/set selection, personal algorithms, and local backup/restore.

Screen inventory:

| View | Purpose and transitions |
| --- | --- |
| Setup | Download, initialize and verify the included release, including never-opened 3D. Ready enters practice; failures retry missing work. |
| Practice | Trainer controls, goal/base, holding frame, scramble and dedicated timer. Completed saved attempt opens result and review. |
| Case/set selection | F2L cases/families; separate OLL and PLL lists/sets; ZBLL families/subsets. Apply selection before generating a new challenge. |
| Algorithms | Inspect/edit a selected case's guidance, validate and save override, or remove override. Not accessible during timing. |
| Result/review | Raw/effective time, preparation and inspection, penalty, save status, notation and player. Case sets confirm next physical base before another setup. |
| History | Sessions per trainer, attempts and compatible statistics, separate preparation trends and run summaries. |
| Local data | Backup, validated confirmed replacement restore, persistent-storage status, cache cleanup and confirmed personal-data deletion. |

Navigation uses the trainer toolbar, Session access and Help/Settings drawers. History and Local data open from session/help rather than a permanent three-button navigation bar above the clock. OLL/PLL Time Attack is one trainer navigation entry with two explicitly separate set types. This makes six trainer families, with separate OLL and PLL compositions in the review. Conditional Cross+2 remains visible as unavailable until its gate passes; early releases must label undelivered trainers rather than suggesting all six already work.

## Workspace system and candidate profiles

[Design system](Design_System.md) is the visual/component authority for this rework. The rejected lime-on-near-black form stack, small 48/64 px timer, document-style phone/desktop specimens and permanent form grid are retired. No profile is owner-approved yet.

A, session dock, has a 248 px dense desktop log beside a large mono clock. B, focus shelf, has a full-width centered sans-serif clock and a 126 px bottom session shelf. Both use compact toolbar options, a readable top scramble rail and secondary settings/help/review drawers. On phones A's log becomes a Session drawer; B's shelf contracts to 72 px. Neither puts settings forms above the clock. The canvas fills the available viewport without a page scroll to find the timer.

Type, color, chrome dimensions, long-time sizing, contrast and component contracts come from Design_System.md, not this document. Prototype `?variant=dock` and `?variant=focus` are two proposals with the same behavior. Static HTML samples Cross, Cross+1 and OLL recognition to test the visual system, rather than generating every trainer/state combination. All six trainer families remain specified below and in Training_Screens.md.

The trainer toolbar exposes selected trainer and a concise configuration summary. Details open Settings; case selection/editor are drawers outside active recognition. Required goal/base and holding frame stay on the scramble rail. History, preparation and run results belong in session drawers/dock/shelf, not floating panels scattered around the clock. Player and algorithm reveal remain post-attempt drawers. In-app offline readiness and storage health are distinct; the prototype's short sample status makes no readiness claim.

## Timer state contract

The hidden preparation measurement starts only when the verified scramble is committed to the screen. Search/download/init time is excluded. A presented challenge and its options stay fixed. Changing options before execution explicitly discards that challenge and generates another; it never silently restarts preparation. Do not allow option changes during inspection, arming, execution or save-pending.

| State | Visible copy and controls | Accepted timer input / transition |
| --- | --- | --- |
| Generating | "Preparing challenge"; known progress or phase text; Cancel. No invented percentage if total unknown. | Timer disabled. Success presents scramble and begins preparation; failure shows retry or change settings. |
| Preparation, untimed | "Scramble, then hold to arm". No ticking preparation clock. Mode help says "Preparation includes scrambling and thinking. Its duration appears after the attempt." | Hold timer/Space for about 300 ms to arm. Short release does nothing. |
| Preparation, 15 s | "Scramble, then tap to inspect". No preparation clock. | First tap or non-repeated Space press/release starts inspection once. This action cannot arm execution. Require release before accepting a new hold. |
| Inspection | Remaining time, "Hold, then release to start"; written warnings at elapsed 8 s and 12 s. Optional audible warnings, off unless enabled. | A subsequent hold begins arming. Inspection continues during the hold. |
| Arming | "Keep holding" before threshold; then "Armed · release to start", with text and border change. | Release after about 300 ms starts execution. Early release or cancellation returns to preparation/inspection without execution. Pointer exit/capture loss cancels. Inspection keeps its original start. |
| Execution | Execution elapsed, "Tap to stop". No prep/inspection ticking clock, solution or case identity. | Timer tap or non-repeated Space keydown stops once. Do not require another hold to stop. |
| Stopped / save-pending | Frozen raw/effective result, "Saving attempt…". No Next. | About 250 ms guard rejects accidental follow-up input. Input stays inactive until a new challenge is explicitly presented. |
| Saved | "Saved on this device"; result, Review, Next; timing penalty edit and delete through history. | Next generates a new challenge or asks for the case-run base confirmation. Stop gesture never starts next. |
| Save-failed | "Not saved. Keep this tab open." Retry save; Export unsaved record. No automatic advance. | Retry same record. Emergency export is distinctly labeled, not a normal complete backup. Warn before leaving and losing the in-memory record. |
| Interrupted | "Interrupted · excluded from successful times"; phase/reason and available raw durations. No invented execution value if not started. | Disarm immediately. New attempt starts fresh, never resumes elapsed timing. Case run requires reset/base confirmation. Preserve saved history and completed reps. |

Inspection penalty is determined from elapsed inspection at the release that starts execution, not from a rounded countdown. At less than 15,000 ms there is no penalty. At exactly 15,000 through less than 17,000 ms it is +2. At exactly 17,000 ms or later it is DNF. Display late inspection as elapsed overtime with "+2 on start" or "DNF on start", not a negative countdown. DNF can still start/stop for personal review; retain raw execution but exclude it from successful aggregates. These are practice records, not official competition results. For an illustrative raw 4.382 s and +2, show effective 6.382 s and raw 4.382 s separately.

Visibility loss in preparation, inspection, arming or execution interrupts. Return offers fresh attempt, not Resume timer. Navigation away from a presented attempt warns about discard/interruption. A resumed set after restart says "Run interrupted. Confirm the base before continuing" and retains only durable completed/skipped/failed reps plus recovery position. Do not reveal hidden identity on an interruption screen unless the user explicitly enters review and abandons that rep.

## Input isolation and accessibility

Timer is a dedicated, labeled, focusable region, not a document-wide tap handler. Touch outside it, scrolling, player orbit/zoom, playback buttons, navigation, selects, text inputs, dialogs and settings never time an attempt. One primary pointer owns a hold. Ignore extra pointers, repeats, cancelled pointers and the release following a stop keydown. Scrolling or cancelled hold disarms without start.

On desktop, Space works only while the practice timing context has focus and no interactive non-timer control/dialog/editor/player owns focus. Show "Space: hold/release to start; press to stop" near the timer. First action in inspection mode is separate. Returning from navigation/player does not itself arm; focus the timer before using Space. Enter/native click can perform the discrete first inspection and stop actions, but never bypass the arming hold to start execution. Keep native keyboard activation in non-timer controls. Builder must test event ordering and assistive-device input rather than duplicate handlers that start twice.

Screen-reader timer name includes mode, phase and accepted action. Announce phase changes, armed, warnings, stopped/save outcome once in polite live regions; DNF/save failure may use an assertive alert. Do not announce every animation frame. Inspection has a readable text countdown. Focus remains stable during timing, moves to the result heading after save outcome, and returns to the opener after closing selection/editor/restore dialogs. Dialogs have labeled headings, keyboard dismissal and contained focus. Cancel is always visible. Do not rely only on red/green, sound or cube colors. Reduced motion disables auto playback and transitions; step/text controls remain. Light/system preferences use the same hierarchy and contrast rules, with colors verified during Build.

## Trainer-specific rules

| Trainer | Controls and pre-attempt text | Revealed result and continuation |
| --- | --- | --- |
| Cross | All six named colors, "Maximum cross depth" K 1–8, HTM help, Untimed/15 s. "Solve only the cross." Explain "Shortest cross is at most K, not exactly K. A half turn counts as one move." | "Optimal cross · d HTM" from proof, with selected ceiling and actual depth. Text/player use stored holding frame. No pure-planning claim. |
| Cross+1 | Color, maximum cross depth K, "Combined solution cap" L, Any pair/FR/FL/BR/BL. "Solve cross and one permitted pair." Supported cap options only after B05 measurement; no frozen invented tiers. | "Found solution · n HTM, cap L" and witness slot. "Verified upper bound, not a globally shortest solution." In any-pair mode witness slot/algorithm/player remain hidden before review. Optional "Pair I executed" is explicitly self-reported, separate from witness. |
| F2L | Case/family subset, Execution/Recognition, FR only/Random slot, rotation hint Shown/Hidden, personal algorithm link. "Isolated pair. Cross and all other pairs solved." Before applying canonical setup, confirm the cross and all four pairs solved. Setup then isolates the target pair; LL is unconstrained. | Case identity only after reveal in recognition; solve target pair while restoring cross/other pairs, LL unconstrained. Hint follows requested setting; slots are frame-relative. Personal override changes guidance, not canonical setup or case identity. |
| OLL Time Attack | OLL/PLL set type, full list/custom subset, shuffled ordering, AUF/angle options, Execution/Recognition, inspection. Run freezes membership/settings/algorithm guidance. "F2L solved, last layer oriented. Permutation may remain." | Each successful rep returns to orientation-solved base with F2L solved. "LL orientation restored" confirmation permits next setup without PLL. Failure/unsure routes to base reset. Representative-case player does not claim to match unobserved LL permutation. |
| PLL Time Attack | Separate full/custom PLL set. "Start fully solved and aligned." Same run/mode/angle controls, no mixed OLL/PLL set. | "Finish final AUF. Cube solved and aligned" confirmation before next setup. Failed/unsure rep requires full reset. Record final AUF, not a hidden rotation requirement. |
| ZBLL | Family/subset, individual cases or shuffled selected cases, AUF/angle options, Execution/Recognition, personal algorithms. Coverage label is verified inventory for current preview/release, never inferred from target 493. "F2L solved and LL edges oriented" describes challenge; physical setup base is fully solved/aligned. | Solve LL including final AUF, confirm fully solved/aligned before next setup. Cannot use OLL's arbitrary oriented permutation base. Show identity/family/short recognition note only after reveal. |
| Cross+2 | Gated unavailable view explains feasibility and owner-go dependency. Conditional design has K, measured L, all colors, Any two distinct pairs, shared inspection. No initial two-slot targeting. | After gate, reveal complete-goal witness, two distinct solved slots and cap, not global optimum or observed pair order. Failure never returns a one-pair/sequential substitute. |

A run failure offers "Mark DNF" for a completed but failed rep, or "Skip rep" when no execution record exists, with explicit counts. Neither makes a successful run. "Not sure of cube state" blocks next setup until appropriate base confirmation; a timer stop alone is not physical correctness verification. Existing +2/DNF records remain editable, but an interrupted record cannot become a successful time via a penalty edit.

## Recognition, selection and algorithms

Recognition must hide identity everywhere before deliberate post-attempt reveal: heading, case number, algorithm, family if it identifies the selected case, thumbnails, accessibility labels, tooltips, DOM data attributes exposed to assistive output, player metadata and current-row highlights. Practice can show "Recognition · rep 3 of 10" and the allowed non-identifying slot/rotation hint. Selection screens necessarily show eligible cases before a run; close them before presenting a random challenge, and do not mark the current hidden choice. A one-case subset inherently limits uncertainty; explain "Recognition is limited to your selected pool" without promising secrecy beyond that. Do not preload visible review content under a collapsed disclosure.

Selection panel has text search, family filter where defined by manifest, labeled case checkboxes and selected count. Full lists show verified coverage, not fabricated numbering. Zero selection disables Apply/Start with "Select at least one case". OLL/PLL switching resets the unstarted selection only after confirming unsaved edits. Set editing changes future runs, not active or historical snapshots. Set deletion leaves historical summaries intact. ZBLL preview says verified subset/target and lists missing coverage honestly.

Algorithm editor shows manifest identity, canonical frame, default versus personal guidance, F2L canonical/slot choice and explicit pre-AUF where applicable. States are untouched, editing, validating, valid, invalid, saving, saved and save-failed. Validation distinguishes unsupported notation, wrong case and missing compatible dataset. Example error: "Valid notation, but it does not solve this case. Your current algorithm is unchanged." OLL help allows LL permutation change if orientation/F2L are correct; PLL/ZBLL require documented final AUF. "Use default" removes the override after explicit action. Save remains disabled until validation passes; failed validation/storage does not change existing guidance. Static review examples are not verified algorithms.

## Results, history and local data

Result shows effective time first, penalty word beside it, raw execution on a separate line, "Preparation · includes scrambling" and bounded Inspection when present. Untimed inspection says "Not used"; interrupted-before-inspection says "Not started", never 0. Preparation includes thinking and interruptions and is not evidence of pure inspection ability. Saved/unsaved is separate from timed success/failure.

History has trainer/session labels, editable session name, new session, attempts, and distinct Runs tab for set trainers. Filters expose inspection, color, K, actual cross depth, L, slot/mode/hint, case/family/subset/set/angle as applicable. Witness slot is explicitly generator metadata; reported slot is separate. Default compatible comparison is conservative and matches the foundation keys. Mixed filters say "Mixed configurations" with counts and no equivalent-task PB claim. Preparation and execution have separate tabs/axes and sample counts. Preparation tab says "Includes scrambling; not pure planning time".

Show recent times, best successful, successful mean/median/population SD with successful/failure counts, and ao5/ao12 when there are enough comparable attempts. DNF ranks worst; trim best/worst once, one DNF can be trimmed, any remaining DNF makes the average DNF. Empty view says "No saved attempts for these filters" and offers Clear filters or Practice. Interrupted/DNF are never zero or successful. Attempt details support +2/DNF edit and deletion; latest successful edit/delete offers Undo until the next edit/delete or restart. Session deletion names attempt/run counts and confirms scope. A run-linked deletion makes that run non-successful as defined by foundation.

Run result shows completed/skipped/DNF/interrupted counts, per-case outcomes, best/worst successful rep, spread and "Successful-rep mean · n/N". A successful set PB requires every rep completed and no DNF/skip/interruption. Incomplete/failed run says "No successful set PB". Compare only same membership, mode, inspection, angle policy and algorithm-guidance snapshot, not observed physical algorithm use; shuffled order may differ. Membership/settings/guidance changes say "Different comparison class". Individual reps and whole runs never share one average.

Local data explains "Stored in this browser. Clearing storage or losing this device can remove it. Keep a file backup." Show persistence granted/not granted/unavailable without durability promises. Normal backup includes settings, sessions, attempts, algorithms, sets and runs; excludes solver caches and unsaved records. Clear solver cache explicitly says history retained, but required tables may need rebuilding. Personal-data clearing is a separate confirmed destructive action.

Restore flow: choose local file → validation-only progress → invalid/version/prerequisite error with current data retained, or valid preview → offer Download current backup → confirmed Replace local data → busy locked dialog → success or failed/rolled-back. Preview gives counts for all six record groups and exact replacement scope. Confirm button says "Replace local data", never just OK. Cancel changes nothing. Disable restore during an active attempt/save-pending; recheck data has not changed before replacement. Imported active runs recover interrupted and require base reset; no live timer resumes. Storage/migration/another-tab blocking states offer backup/recovery or close-other-tab instructions, never silent reset.

## Setup, offline, generation and update copy

Setup sequence is Not started, Downloading, Initializing, Verifying, Ready or Failed. Show tasks for app/explanations, included libraries, worker/tables, all 3D player dependencies, local storage probe and cache-only checks. Include never-opened player in initial setup. Known totals may show counts; unknown work says its phase. Interrupted setup preserves verified work and offers Resume/Retry. Ready says "Offline ready for included trainers · release …" only after the foundation checks, not based on online status. Missing/evicted assets downgrade readiness, list missing work and request reconnection if offline. Assets-ready/storage-failed must not claim durable practice readiness.

Generation errors distinguish budget exhausted, unsupported cap, invalid result/version mismatch, initialization failure and worker crash. Retry keeps requested options; Change settings is explicit. Never change K/L or goal silently. No previous scramble remains actionable under a new loading/settings label. History remains accessible when solver assets fail.

Update banner says "Update downloaded. Apply when idle." Preparation, inspection, arming, execution and save-pending block activation. Save-failed requires recovery/export or explicit discard before update. Confirm at idle and preserve case-run interruption/recovery. Other active tabs say "Close or finish practice in the other tab". No automatic reload or mixed versions. Offline connection badge is information only; asset readiness and storage health have separate labels.

## Builder handoff and coverage

After owner acceptance, use this document for interaction/copy and [Training screens](../mockups/Training_Screens.md) for layout. Design_System.md and HTML are the two candidate visual references, with schematic imagery and sample data only. Neither is selected yet. Architecture/PLAN win in a conflict; report it rather than copy mock data into production. These documents update builder guidance without editing the staged Builder_Prompt or authorizing application work.

FR-001 setup/offline/update; FR-002 post-attempt text/player; FR-003 phase table and strict boundaries; FR-004 compatible history/run metrics; FR-005 backup/restore/storage; FR-006 Cross; FR-007 Cross+1; FR-008 isolated F2L; FR-009 OLL/PLL; FR-010 ZBLL; FR-011 gated Cross+2; FR-012 selection/overrides; FR-013 responsive/input/accessibility are covered above. Video, accounts and lessons are not new screens here.

No product question blocks Design. Build still owns engine fixtures, measured supported caps, sourced manifest/numbering/rights, browser behavior and atomic/offline validation. Schematic review is not evidence for any of these.

## Owner review questions

- Do you prefer the persistent session dock or the centered canvas with a bottom shelf?
- Are mono or light sans clock digits easier to read at your practice distance?
- Does the short phone shelf earn its space, or would you rather open session data only on demand?
- Are the base-reset confirmations clear when using a physical cube, especially OLL versus PLL/ZBLL?

These are review preferences, not blockers. Stop after Design for owner feedback; do not begin B01.
