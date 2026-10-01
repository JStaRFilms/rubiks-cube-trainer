# Cross+1 trainer

PLAN 4.2 and 6.2 and FR-007 control the contract. Parent accepted B05's provisional K1..8/L1..12 construction range for B06 desktop/touch-emulated integration. Physical-phone performance remains unverified. The integration plan was added before application changes; the components below now implement it. Q02 remains the next review gate.

## Goal and physical base

The starting state's independent optimal Cross depth is at most requested K. A retained outer-turn HTM witness ends with the Cross and a permitted F2L pair solved within requested L. These are ceilings, not exact depths or global combined optimality. Intermediate moves may disturb the Cross. Any pair permits FR, FL, BR and BL; targeting permits only the requested slot. K3/L8 and any pair are the initial options.

Every Cross+1 scramble requires a fully solved physical cube. Hold the selected color down and the frame-v1 front color forward. A solved Cross or Cross plus pair does not fix the other pieces and is not a supported base. The user confirms the solved cube and displayed frame before each request. Next returns to that reset/confirmation screen. Cross-only retains its solved, aligned Cross base and representative non-Cross pieces.

The canonical 54-facelet state matches the physical cube only from the stated fully solved base. Camera orbit does not change the training frame or slot. Completion remains self-reported, not observed by the app.

## Components and generation

- App enables Cross and Cross+1, with per-trainer settings and sessions. Cross+1 settings expose every accepted K/L value and any/FR/FL/BR/BL. Unsupported trainers remain visibly unavailable.
- CrossPractice uses the existing TimerController/TimerPractice lifecycle for either trainer. Verified immutable challenges mount only after current-session/settings/restore-epoch, worker identity, visibility, dialog, activity and update checks. Repository reads yield, so adoption repeats those checks afterward.
- Generation uses OneClient and the project-owned one.worker. Initialization has a separate 60-second watchdog. Construction requests get 5,000 ms and 10,000 charged nodes. There is one pending job and no speculative next queue. Cancellation terminates the worker. Opening review suspends pending generation; accepted snapshots survive deliberate suspension before timer mount.
- A returned challenge receives a second full semantic validation RPC in the same cancellable generation worker. Request ID, epoch, K/L/goal, frame, versions and worker identity must agree. Old replies cannot replace the selected challenge.
- TimerPractice starts preparation only in its post-DOM-commit layout effect. It preserves background Space/native ownership, 300 ms hold/release, separate first inspection action, unrounded 15/17-second penalties, interruptions, the 250 ms stop guard and transaction-acknowledged saves. Rejected presentations never become active timers.
- Any-pair witness moves, solved-slot metadata and player remain absent from visible and accessibility output before stopping. Results show found length/cap and generator solved slots. MoveReview uses the recorded scramble/state/frame, text witness and existing lazy player. It never labels a combined witness globally optimal.

## Construction and proof

Reuse pinned cubing 0.63.8 for legal full-state parsing/replay and move transforms. No cubing search, scramble or optional GPL modules are imported.

The accepted strategy attempts eight project-authored U or side/U/inverse-side triggers and retains only those preserving a chosen permitted complete goal. It appends an outer-turn tail of length sampled from 1..requested L and retains its inverse. Filtering checks actual independent Cross depth and rejects every already-complete permitted goal. Sampling is nonuniform after filtering; low K can favor shorter tails. There is no exact-depth, uniform competition-scramble or silent cap-reduction claim.

The persistent 190,080-state Cross distance table remains independently checked and separately checksummed. Four 576-coordinate corner/edge tables live only in worker memory. They ignore Cross preservation and are lower bounds, not combined completion tables. The B05 comparison search uses the maximum of independent Cross and permitted-pair distance, with the minimum pair distance for any pair. It never sums unproved lower bounds. Normal practice uses accepted construction, not comparison search.

Each candidate charges nine nodes, including eight background attempts. Construction yields after each candidate and before return. A valid retained witness needs no extra search, but it cannot survive cancellation or expiry. Exhaustion, crashes and unsupported options return an error; retry keeps requested options and requires the physical-base confirmation again.

## Data flow and schema

Solved-base confirmation -> immutable request -> worker initialization/construction -> full legality, scramble equality, actual Cross distance, complete simultaneous goal and slot validation -> request-correlated result -> second validation RPC -> post-read adoption checks -> frozen presentation -> timer stop -> semantic validation -> acknowledged repository transaction -> result/history/review.

One trainerValidator facade exists before App's one-shot Repository construction. It routes actual Cross and Cross+1 records to their real worker validators. Its Cross+1 validation worker is separate from generation, so suspension cannot cancel a history write. Backup batches serialize validation RPCs. Both trainers reuse the strict attempt-timing decoder. Unsupported Cross+2/case attempts, extra attempt fields, and nonempty algorithms/sets/runs fail closed. Existing backup version/reference checks, revision-protected mutations, atomic confirmed replacement, stale-preview handling and quota recovery remain.

Personal database and backup versions remain 1. The existing Challenge and combined-bound shapes store requested L as cap, actual independent Cross depth, a found witness and all actual final solved slots. Contract is 1, engine is `cubing@0.63.8`, dataset is null and the Cross+1 policy is `cross-four-labeled-edges-v1-HTM18-frame-v1+cross1-construction-search-v1-pair576-max-v1`.

No executed-slot report is collected or invented. Result, review and history explicitly say it was not recorded. Generator slots never count as observed physical execution. Comparison keys retain trainer, frame/color, inspection, K/L, any/target goal, actual depth, witness length and solved slots. Mixed configurations show counts without pooled best/averages. Edited/deleted/undone/restored result cards follow actual repository history rather than the original stopped record.

## Offline setup and cache boundary

The release manifest covers both trainers, all emitted workers/model chunks and all player dependencies. Setup verifies bytes and initializes actual Cross+1 model/pair tables even when that trainer has never been opened. The temporary readiness worker is suspended after initialization. Ready copy names both delivered trainers.

Pair tables are memory-only. The Cross payload remains 190,080 bytes, pinned to SHA-256 `28cf7e33c5fbe83584dfaf30afbe633141e76df91c14ea647f81f3fb802c853a`, in the separate disposable solver database. Solver-cache repair never replaces personal data. Cache-only rechecks do not rebuild missing/corrupt tables. Repair can rebuild disconnected only if executable assets remain cached; missing executable assets need reconnection. Update activation uses the existing all-tab idle handshake and preserves saved history.

## Evidence and limits

`docs/audits/Cross_One_Feasibility.md` and its retained runtime evidence record B05's accepted construction proof, independent Cartesian checks, desktop cold/warm measurements and touch emulation. B06's commands, failures, browser/Node/Vite checks, final asset/source evidence and manual gaps are in `docs/audits/Cross_One_Integration.md`. Synthetic client metadata tests are not solver proof. Prototype tools and test fixtures remain outside production assets.

Physical iPhone Safari/Android Chrome, Firefox, OS-installed PWA restart, assistive technology, actual audio output, GPU/process peaks and long-session thermal/leak behavior are not established by desktop Chrome emulation. No later trainer follows automatically from this integration.
