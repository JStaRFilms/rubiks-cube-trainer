# Workspace proposals and training screens

D01 rework, session `orch-20260930-021158`, local exploration branch `design/solver-workspace-v2`. Owner rejected the initial visual proposal. This replaces its phone/desktop specimen page and form-first hierarchy. [Design system](../design/Design_System.md) owns proposed visuals and component contracts. [Training experience](../design/Training_Experience.md) preserves the full behavioral specification. PLAN/G02 remain authoritative. The owner subsequently chose A desktop plus B mobile as an interim baseline and asked to proceed. Build starts with B01; further style work is deferred. The comparison HTML remains an archived design prototype.

## Open the two proposals

- [A · session dock](Training_Review.html?variant=dock): [desktop capture](Training_Review-desktop.png), [phone capture](Training_Review-phone.png).
- [B · focus shelf](Training_Review.html?variant=focus): [desktop capture](Training_Review-focus-desktop.png), [phone capture](Training_Review-focus-phone.png).
- Cross+1 example uses `?variant=dock&trainer=cross1`.
- Representative recognition drill uses `?variant=focus&trainer=oll`.
- Width specimen uses `?variant=dock&state=long` or `?variant=focus&state=long` and shows `12:34.567`.

Double-click the HTML locally. Its preview fills the browser, with no documentation wrapper or repeated phone/desktop mockups. A discreet bottom bar changes direction and illustrative state. Trainer/state are shareable in the URL, not storage. Arrow keys cycle direction only outside controls, editable regions and dialogs. All app-looking actions are presentation only; the clock never runs, Space never times, player never plays and no record is written. Short cue says "Prototype · sample data". Cube images are schematic, notation is illustrative and no verified case/solve/library claim is made.

## Layouts being compared

A has a 248 px left desktop dock, aligned decimal log rows, compact statistics and the remaining viewport as clock canvas. Top scramble is readable and uninterrupted. On phones the dock becomes an explicit Session drawer. B has no permanent side panel, a centered wide sans readout and a bottom horizontal session shelf. That shelf is 126 px desktop/86 px phone and expands to a drawer. The phone shelf keeps attempt/failure counts and a compact history-scope line with selected values, distinct from current challenge settings; it does not show a hidden case or witness. The Session drawer spells out the full scope. Both use a compact toolbar and secondary settings/help/review drawers. Desktop session dock starts above 900 px; below that, controls use portrait anatomy. No 48/64 px clock cap survives.

The static prototype focuses on Cross/Cross+1 and OLL recognition. It samples untimed, first inspection tap, inspection, armed, strict penalty boundaries, execution, result, long time, unsaved and interruption. Drawers show settings, session/preparation, attempt edits, case/set selection, algorithm editor, post-attempt schematic player, base confirmation and confirmed restore. This is a visual choice exercise, not an exhaustive state machine or another 308-state factory.

## All six trainer families use the same components

| Trainer | Toolbar/settings and scramble rail | Canvas/result/review |
| --- | --- | --- |
| Cross | Named color, maximum K 1–8 HTM, inspection; "Solve cross only" and stored holding frame. Maximum means at most K, not exact K. | Giant shared clock. Post-attempt drawer reveals optimal cross with actual verified depth and selected ceiling. No planning-time claim. |
| Cross+1 | Same K/color/inspection, measured L, Any pair or FR/FL/BR/BL goal. No invented easy/medium/hard tiers. | Found complete-goal witness within L, not global optimum; witness slot hidden before review and labeled generator metadata after. Optional executed slot is separate self-report. |
| F2L | Case/family pool, execution/recognition, FR-only/random slot, rotation hint. Before setup confirm cross/all four pairs solved; produced challenge isolates target with cross/other pairs solved. | Non-identifying isolated case view and shared clock. Reveal case/slot/algorithm only after recognition rep. Other pairs/cross solved at completion, LL unconstrained. |
| Time Attack · OLL | Separate OLL full/custom set, selected count, shuffle, AUF/yaw/mode/inspection. Base says F2L solved and LL oriented, permutation may remain. | Run progress contains no hidden identity. Saved rep confirms orientation-solved base before next setup; no PLL required. Review is representative, unobserved LL permutation may differ. |
| Time Attack · PLL | Separate PLL full/custom set and same controls. Initial base is fully solved/aligned. No mixed OLL/PLL set. | Finish final AUF and confirm solved/aligned before next setup. Failed/unsure rep resets full base, unlike OLL. Run results separated from rep history. |
| ZBLL | Verified families/subsets/individual or shuffled pool, AUF/yaw/mode/inspection. Target 493 only after frozen sourced convention/manifest; previews say actual verified coverage. | Challenge preserves F2L/oriented LL edges. Setup base and next rep require fully solved/aligned including final AUF. Identity/family/algorithm/recognition note hidden until reveal. |
| Cross+2 | Visible unavailable status until separate measured feasibility and owner go. Conditional controls K, measured L, named color, inspection; any two distinct pairs, no initial slot targeting. | Complete-goal two-pair witness within cap, upper bound not global optimum. Two witness slots are not observed physical pair order. No one-pair/sequential substitute on failure. |

Case numbering, algorithm samples and supported combined caps are not frozen by Design. Manifest/rights/fixture and feasibility gates stay with their named Build tasks. Trainer navigation does not imply roadmap features have shipped.

## State placement and transitions

| State | Workspace treatment | Drawer/actions |
| --- | --- | --- |
| Setup incomplete/download/init/verify | Scramble unavailable; status indicates phase, verified completed work retained. No fake progress percentage if unknown. | Resume missing work. Required tasks include all player dependencies never opened, libraries, worker/tables, storage probe and cache-only checks. |
| Ready offline | Release-scoped readiness only after G02 checks, not navigator.onLine. | Storage/asset failures are distinct. Missing offline assets request reconnection; history stays usable where storage works. |
| Generating/failure | Rail replaces stale scramble with progress. Timer unavailable. Preparation has not started. | Cancel; explicit budget exhaustion, unsupported cap, version/invalid result, init/worker failure. Retry same settings or explicit Change settings, never weaker goal. |
| Untimed preparation | Committed scramble/goal/frame, large 0.00/Ready and hold instruction. No ticking prep clock. | About 300 ms hold arms; short/cancelled hold does not start. |
| Ready for inspection | Same readable scramble, "First tap starts inspection only". | First tap/Space action and release are separate from subsequent arming hold. |
| Inspection/arming | Countdown and written warnings at elapsed 8/12 s; scramble stays visible. | Subsequent hold about 300 ms, release starts. Hold time remains inspection. Early release/cancel returns without execution, original inspection continues. |
| At 15/17 s | "+2 on start" at elapsed 15,000 through below 17,000 ms; "DNF on start" at 17,000 ms and later. No rounded-countdown penalty logic. | Penalty evaluated at release. DNF can retain raw execution for review but never successful aggregates. Practice, not official results. |
| Execution | Clock dominates; stop instruction. No prep ticking, hidden identity, solution or player. | Only timer-focused Space/timer touch stops. Other controls cannot time. Settings changes locked. |
| Stopped/saving | Frozen effective time; save-pending word; raw preserved separately. About 250 ms input guard. | No Next until save outcome. Stop/release never starts next. |
| Saved | Clock remains result, compact metadata, Review and explicit Next/base confirmation. | Post-attempt drawer has raw/penalty/preparation includes scrambling/inspection, notation/player. |
| Save-failed | "Not saved. Keep this tab open" with raw result; no log row or automatic advance. | Retry same record or distinctly labeled unsaved-record export. Leaving warns loss of in-memory record. |
| Interrupted | Phase/reason, available raw or "Execution not started"; excluded from successes. | Fresh attempt, never Resume timer. Runs retain durable completed/skipped/failed reps and require appropriate reset on recovery. |
| Failed/unsure physical rep | No new actionable setup before confirmation. OLL orientation-only; PLL/ZBLL fully solved/aligned with final AUF; F2L restores solved F2L before setup. | Mark completed failure DNF, or Skip if no execution record. Neither is a successful run. Physical base is user assertion. |
| Update waiting | Quiet status action, no automatic reload. | Preparation/inspection/arming/execution/save-pending and other active tabs block activation. Recover unsaved data first; explicit idle confirmation only. |

## Session, editor, player and restore detail

The dock/shelf is a summary, not a second dashboard. Log has attempt, effective time, written penalty and prep duration. Each row opens a detail drawer with explicit No penalty/+2/DNF/Delete/Undo buttons. Undo lasts until next edit/deletion or restart. Session deletion confirms attempt/run counts; deleting a linked rep makes run non-successful. Named sessions/new session and filter controls live in Session. Preparation opens a separate view with preparation-only seconds metrics and the selected history scope. It never reuses execution best/mean/median/SD. The sample includes scrambling; no guessed subtraction.

Compare compatible trainer/color/inspection/K/actual depth/L/goal/case/slot/hint/mode/angle as applicable. Witness slot is filterable generator metadata, not execution observation. Intentional mixed grouping says Mixed configurations and counts, without equivalent-task PB. Best/mean/median/population SD use successful effective times with success/failure counts. ao5/ao12 trim one best/worst; DNF ranks worst and any remaining DNF makes average DNF. Empty filters show "No saved attempts" with Clear filters/Practice. No attempt becomes zero because its time is missing.

Set summaries remain separate from rep averages. Show completed/planned, skipped/DNF/interrupted, per-case outcomes, best/worst/spread and successful-rep mean n/N. Successful set PB requires every rep and no DNF/skip/interruption. Compare frozen same membership, mode, inspection, angle policy and algorithm-guidance snapshots, not observed algorithms; random order can differ. Changed set/settings/guidance gives a different comparison class. No full-list PB comparison against a custom subset.

Selection/editor are secondary drawers, not visible practice forms. Nonempty case checkbox pool required; separate OLL/PLL lists; ZBLL manifest families and honest preview coverage. Recognition secrecy covers title/number/family if identifying/algorithm/thumb labels/accessibility metadata/tooltips/player and current selection highlights. One-case pool inherently limits uncertainty. Editor identity is visible outside a rep; Save requires intended-case validation across allowed context/slot/angle, not just notation. Wrong-case/missing-dataset/storage errors retain prior override. Use default removes override; canonical setup never changes. OLL may change LL permutation while orienting/preserving F2L; PLL/ZBLL require documented AUF.

Review drawer has a 180 px schematic player placeholder in prototype and actual offline player area in future Build. Play/pause, step back/forward, speed and replay operate outside timer region. Text always available; loading says Loading local player, failure says Player unavailable, text review still available. Reduced motion disables autoplay. Camera orbit never changes frame or slot. OLL says representative case; no claim to observe unrelated physical permutation.

Local data in Help/session explains browser storage eviction and early backups. Normal backup covers settings/sessions/attempts/algorithms/sets/runs, not caches or unsaved records. Persistent storage granted/denied/unavailable is truthful, not a durability promise. Cache cleanup explicitly retains history and may need table rebuild. Personal clearing confirms scope separately.

Restore is file selection, validation-only progress, retained-data rejection or six-group count preview, current-backup offer, explicit Replace local data confirmation, busy lock, committed success or atomic rollback. No automatic merge. Unknown newer/incompatible dataset errors preserve data; active/save-pending blocks restore, data is rechecked before replacement. Imported active runs recover interrupted and confirm base. Migration/another-tab errors offer backup/recovery/close-tab, never silent reset.

## Verification and visual critique

Ran `node .pi/takomi/design-rework/validate-preview.cjs` with installed Chrome 154.0.8037.59, no dependency installation. The helper uses Chrome DevTools Protocol and a temporary browser profile, not app storage. Screenshot/results files are tool-managed temporary artifacts, final run at `C:/Users/johno/AppData/Local/Temp/cube-workspace-review-JcdF23/`. Parent can regenerate them with the same command; do not treat temporary paths as durable design links.

- Both directions rendered at 320×640, 390×844, 768×1024, 1440×900 and 1920×1080, each in untimed and `12:34.567` states. Twenty viewport checks passed. Page scroll dimensions equaled the viewport, clock text stayed inside width, timer was reachable without page scroll and chrome controls were not clipped.
- Twenty-four further 320×640 layouts covered both directions, Cross+1/OLL, preparation, inspection, running, saved, save failure and interrupted. All passed page/clock bounds and 44 px chrome touch-target checks. The trainer selector is disabled during active inspection/arming/execution samples.
- Headless DOM checks confirmed no revealed OLL identity in practice, no direction change from ArrowRight in a drawer select, focus returned to Settings after close, background/prototype controls were inert under the drawer, and OLL review carried representative/permutation and orientation-only reset labels. The static preview has no timer behavior to test; it deliberately has no Space handler.
- Read actual generated PNGs with the image tool, including desktop A/B, phone A/B, 320 px long numbers, Cross+1 result, OLL inspection, and the phone review drawer. Compared them with both original csTimer PNGs. Timer now wins the hierarchy, scramble stays immediately visible and session data sits at the edge. Settings and Help no longer occupy the solving canvas.
- Self-critique found phone prototype controls crowded and icon targets slightly too narrow. The focused correction widened targets to 44 px and folded the phone sample cue into the compact direction label. Final screenshots and bounds checks were rerun. No gradients, form stacks, branding hero or giant disclaimer remains.
- A's mono digits are heavier and the log is more useful at a glance; slashed zeros may appeal less to the owner. B gives more visual silence and lighter digits, but the shelf costs 86 px on a phone and hides its log there. Its compact selected scope line and attempt/failure counts stay visible; other metrics remain in Session. These are deliberate tradeoffs for owner choice, not an assertion that one profile has won.

Calculated sRGB contrast against all three surfaces in each direction. Dock minimum ratios: main text 11.47:1, secondary 6.76:1, action 7.58:1, warning 8.85:1, error 7.68:1, focus 8.67:1, interactive border 3.86:1. Focus minimum ratios: main text 10.59:1, secondary 6.45:1, action 6.98:1, warning 8.11:1, error 7.04:1, focus 7.94:1, interactive border 3.77:1. Primary-button contrast is 9.60:1 for dock and 9.46:1 for focus. Quiet structural dividers are not interactive boundaries.

Python checked 16 relative design links, Markdown fences and whitespace across the four artifacts. `git diff --check` passed, with CRLF warnings only. No external assets, CDN/imports, network fetch, real timer/solver/player or persistence function is present. The small helper is the only extra written path. PLAN, architecture, app paths, attachments, session state and Git index were not edited.

Not run: physical iOS Safari/Android Chrome, Firefox/desktop Safari, screen readers, touch hardware, platform font comparison, zoom/device safe-area testing, real timer/solver/player fixtures, storage/restore/offline/update behavior or application tests/build. Headless Windows Chrome viewport checks do not prove mobile-platform support.

The owner chose A's desktop dock and B's mobile shelf to move forward. Apply the selected breakpoint and numeric treatment in Design_System.md. The owner still dislikes the visuals, so further polish remains deferred work, not a new gate. The comparison screenshots above are proposal evidence, not working-application tests. B01 is the next authorized slice.
