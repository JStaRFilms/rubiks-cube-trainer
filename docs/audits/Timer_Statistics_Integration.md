# Timer and statistics integration

This is the historical B03 integration record. B04 and Q01 subsequently delivered and accepted the Cross loop. The post-Q01 input repair is recorded at the end.

B03 implementation for `orch-20260930-021158`, starting code baseline `dd59b22`. PLAN sections 3.2, 3.3, 3.4 and 11 control behavior. The feature blueprint was updated before component/data-flow changes. No package/lockfile changes, generator, manual-timer record type, fake production attempts, deployment, Git mutation or task-board change was made. The parent's existing task relocation and summary/master-plan changes were left alone.

## Delivered boundary

`TimerController` and `TimerPractice` implement the physical-practice flow. Untimed holds arm at 300 ms and release starts execution. Strict mode uses a separate first inspection action; holding that first gesture cannot arm. A later hold includes its arming time in inspection. Stop is a press, not a release. Extra owners/repeats, early release, cancellation, pointer exit/capture loss and stop-release do not start another execution. Presentation after stop has a 250 ms guard.

Elapsed timing uses `performance.now()`. Animation frames update display and warnings, not start/stop timestamps. Penalties use unrounded inspection elapsed at execution release, with +2 at 15,000 ms and DNF at 17,000 ms. A release at 14,999.6 ms therefore persists 15,000 inspection ms with no penalty. A validator must not reinterpret that rounded boundary as a different penalty. Raw execution, preparation, inspection and penalty remain separate. Preparation starts in the component's post-DOM-commit layout effect, never during generation, and no ticking preparation clock is shown.

Visual warnings occur at 8/12 inspection seconds. Optional Web Audio tones initialize on a timer user gesture, with visual warnings retained if audio is unavailable. Space only works on the dedicated timer button. Native inputs, dialogs and other buttons keep their own keyboard behavior. Enter/native click may begin inspection or stop, but cannot bypass a hold to start execution. Phase/warning/save text uses a polite status region; frame-by-frame numbers do not.

Foreground loss, pagehide and explicit cancellation produce interrupted records with the available durations, never successful results. A component mounted while already hidden immediately interrupts. Nothing persists or restores a monotonic live start timestamp. Restart can read saved attempts but never resumes timing. `beforeunload` warns while an attempt or unsaved record is active. An abrupt browser/OS kill before a write commits can still lose an in-memory attempt; no durable in-flight checkpoint system is claimed.

Stopping immediately enters save-pending and calls the injected persistence API. Only its acknowledged transaction allows saved/Next. Save-failed retains the same deeply frozen attempt with its original ID and durations. Retry resubmits that same record. It blocks advance and the update gate. Emergency export is `cube-trainer-unsaved-attempt`, version 1, with `unsaved: true` and the exact attempt, and its filename starts `UNSAVED-attempt-`. It is not a complete backup and normal backup parsing rejects it. This task does not add an emergency-file importer. Explicit discard requires a loss confirmation.

Production practice is still gated. The app contains no challenge supplier or production semantic validator. Shared timer source is ready for B04 integration; it is not mounted as a manual timer or falsely advertised as a usable Cross loop. Production history and statistics are wired to actual repository records in the existing Session drawer. Empty history remains empty.

## Exact B04 integration API

Imports:

```ts
// Imports from a trainer integration file in src/app.
import { TimerController, type Presentation } from '../timer/controller';
import { TimerPractice } from './TimerPractice';
import { Repository } from '../store/repository';
```

`new Repository(name, notify, semanticValidator)` requires the actual compatible `SemanticValidator` from `src/store/records.ts` for nonempty attempt read/save/import/edit/delete/undo. `App` accepts an optional `validator` prop and supplies it to both its repository and restore parser. Initialize the validator before mounting App; its repository is created once. No test fixture belongs in that prop.

`new TimerController(repository)` uses browser monotonic time, ISO dates, random IDs and the real activity gate. Its optional constructor clock/activity/warning arguments serve deterministic tests; production must keep the defaults unless it has an equivalent monotonic implementation. Use one controller for the practice lifecycle, including successive presentations, so the stop guard remains intact.

`Presentation` is:

```ts
interface Presentation {
  challenge: Challenge;
  session: SessionRecord;
  settings: Pick<SettingsRecord, 'inspectionMode' | 'audibleWarnings'>;
  run?: {
    id: string;
    repIndex: number;
    outcome: (attempt: AttemptRecord) => RunRecord;
  };
}
```

For Cross, omit `run`. B04 must validate legality, scramble-to-state equality, independent optimal depth, solution and requested frame/options/version correspondence before creating this presentation. The timer does not prove generation semantics. It clones/freezes the challenge, session and timing settings. Session ID/trainer are fixed from presentation; a later label rename remains session metadata. Save still goes through the repository validator.

Mount one `TimerPractice` per challenge with `key={challenge.challengeId}`, the same controller, and the verified presentation. It renders the scramble rail and timer canvas as siblings within the existing `.practice` area, so replace both unavailable placeholders rather than adding a second rail. Its props are:

- `controller: TimerController` and `presentation: Presentation`.
- `onNext: () => void`, explicit next challenge request only after saved or acknowledged discard and the stop guard.
- `onSaved?: (attempt: AttemptRecord) => void`, once per saved record, for repository refresh. It does not control save acknowledgement.
- `onReview?: (attempt: AttemptRecord) => void`, post-save review of the immutable recorded challenge/frame/proof.

Do not call `controller.present` before mounting the component. It commits presentation in a layout effect. Do not unmount/replace it during inspection/arming/execution or save-pending/save-failed. Its snapshot never follows new settings props. Gate navigation through `controller.blocked` and the activity phase. B04 should explicitly cancel/discard before changing a presented challenge, invalidate pending/queued worker epochs on settings changes, and wait for recovery before accepting a replacement. Neither reconfiguration nor a late worker reply may silently swap the scramble while timing.

Public controller methods are `present`, `press`, `release`, `action`, `cancelInput`, `tick`, `interrupt`, `retry` and `discardUnsaved`. The component owns normal input/display use. `subscribe/getSnapshot`, `active`, `blocked` and `canPresent` support integration. The real activity gate covers preparation, inspection, arming, execution, save-pending and save-failed; editing also blocks a new default-controller presentation. B03 adds App guards against opening/reconfiguring through existing toolbar/dialog actions while those attempt phases are active.

The optional run callback must derive a frozen run update for this exact record. The repository validates it with existing `validateTrainingData` capabilities and writes attempt plus run in one transaction. A missing run validator fails closed. B03 supplies no run/set/catalog UI or new validator. Run-linked deletion changes the linked outcome to interrupted/null and marks the run interrupted; undo restores the prior run atomically.

`AttemptHistory` accepts `repository`, `sessionId`, optional `onChanged` and optional `onBusyChange`. App uses the last callback to prevent dialog dismissal during a write. Surrounding dialogs retain their editing gate; standalone history temporarily takes/releases it. All mutations are revision-checked, including another-tab edits and undo.

## Schema and statistics

Database version and backup version remain 1. There are no production B01/B02 attempts to migrate. `AttemptRecord` now requires `settingsSnapshot` with inspectionMode and audibleWarnings. Duration validation rejects inspection values in untimed records and requires inspection for completed strict records. It does not derive penalties from rounded duration values. Session/trainer correspondence and full challenge/training semantics remain validator gates.

`Repository.editAttempt(id, kind, expectedRevision)` changes only penalty kind/source. `deleteAttempt(id, expectedRevision)` removes only that attempt plus the prescribed affected-run change. Both return `AttemptUndo`. `undoAttempt(token)` requires the latest unchanged in-memory token and its revision. Internally retained snapshots prevent callers from smuggling challenge/duration edits into undo. Successful mutations resolve only after transaction completion; stale edits, stale undo and quota errors retain the old records. Undo is not durable and expires after another mutation/restart.

`comparisonKey` derives conservative classes from actual record trainer, all six frame colors/cross color, frozen inspection mode, goal options and applicable proof metadata. Cross includes both K and actual depth; combined goals include K/L/pair mode, depth and witness slots/length; case reps include identity/options/slot/hint/mode/AUF/yaw plus proof identity and optional reviewed-algorithm snapshot. The Configuration filter lists these actual historical groups rather than using current settings. All-configurations views disclose mixed configurations, counts and recent rows, with no pooled best/averages.

Execution best/mean/median/population SD use successful effective times. +2 adds 2,000 ms without changing raw time. Counts include successful, DNF, interrupted and +2. Interrupted remains unsuccessful even after removing a penalty. ao5/ao12 take the latest chronological comparable records, trim one best and one worst, rank DNF/interruption worst and return DNF when any remaining failure is untrimmed. Insufficient and mixed classes have distinct results, never fabricated zeros.

Preparation has its own statistics view and sample count. It includes completed attempts, including completed inspection/manual DNFs, and excludes interrupted/incomplete preparation samples. Its text says it includes scrambling and thinking, not pure planning. It is not penalty-adjusted. Inspection stays a separate history/result duration. The selector accepts attempts, not whole RunRecords; no whole-set PB or run-versus-rep pooling is claimed.

## Changed paths

- `src/timer/controller.ts`, new shared phase machine and emergency export envelope.
- `src/statistics/attempts.ts`, new pure comparison/metrics/averages/format selectors.
- `src/app/TimerPractice.tsx`, new shared timer/result/recovery component.
- `src/app/AttemptHistory.tsx`, new history/statistics/filter/edit/delete/latest-undo components.
- `src/app/App.tsx`, existing Session integration, compact actual summary, validator prop/restore wiring and active-attempt guards.
- `src/app/styles.css`, timer targets, armed ring, long-time/result sizing and compact history/statistics, with the existing desktop/mobile layout unchanged.
- `src/store/records.ts`, `src/store/validation.ts`, `src/store/repository.ts`, frozen timing-settings field, validation and narrow revision-safe mutations.
- `tests/unit/fixtures.ts`, existing storage fixture updated for the new snapshot field. Existing semantic-gate tests remain intact.
- `tests/unit/timer.test.ts`, `statistics.test.ts`, `history.test.ts`, new focused timing/statistics/acknowledged-storage fixtures.
- `tests/helpers/timer-fixtures.ts`, `timer-browser.tsx`, `browser-server.mjs`, explicit test-only known-challenge validator and real-component browser mount.
- `tests/browser/timer.spec.ts`, new actual component/input/storage/emergency/warnings checks.
- `docs/features/Trainer_Foundation.md`, this audit and `README.md`, contract and delivered-boundary updates.

## Commands and results

All package commands used pnpm 10.33.2, confirmed by `pnpm --version`. Installed desktop Google Chrome reported 154.0.8037.59 on Windows. Touch/CDP tests are emulation, not physical-phone evidence.

- `pnpm exec vitest run tests/unit/timer.test.ts tests/unit/statistics.test.ts tests/unit/history.test.ts tests/unit/storage.test.ts`: 47 tests passed in the first focused run. A later undo-tampering regression brought the total unit suite to 90.
- `pnpm exec playwright test tests/browser/timer.spec.ts --reporter=list`: final focused run passed all 7. It exercises real Space ordering/repeats/early release/input focus, strict first-action separation, pointer exit/capture loss/cancel/extra-owner isolation, browser touch events, acknowledged IndexedDB writes, penalty/delete/undo, real quota failure, exact retry and downloaded emergency JSON, interruption/reload, stale cross-tab edits and visual warnings plus actual Web Audio oscillator starts at 8/12 seconds.
- `pnpm test`: final run passed 90 tests in 7 files, including unchanged cube/reconstruction/PWA/storage regressions.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed for app/tests and service worker.
- `pnpm build`: passed. Test harnesses are not app entries or emitted production assets. The gated timer source becomes reachable when B04 mounts it.
- `pnpm test:browser`: final cumulative run passed all 24 tests in 1.8 minutes, preserving all 17 existing foundation/review/update checks and the 7 timer checks.
- `git diff --check`: passed. Git emitted existing Windows line-ending warnings, not whitespace failures.

Failures encountered and resolved/checked:

1. One first strict typecheck found test code accessing K without narrowing GoalOptions; fixed with the Cross discriminant. Runtime tests had already passed.
2. The presentation-commit layout effect intentionally sets the accepted flag after a DOM commit. The React lint rule required a local documented exception for that one call; lint passes. Moving presentation to render would incorrectly count pre-commit work.
3. The initial 6 browser timer tests could not mount because the test-only library bundle referenced `process.env.NODE_ENV`. The harness build now defines it as production; no app dependency/build configuration changed. All focused tests pass.
4. The first full browser suite hit the existing 45-second update-contract timeout after the activation reload, with 22 other tests passing. The unchanged isolated update test passed in 21.1 seconds, then the unchanged full 23-test suite passed in 1.7 minutes. No timeout increase or weakened assertion was used. The transient timing cause was not established.

## Parent display review correction

The parent verified lint/typecheck/build, all 90 unit tests and the original 7 timer Chrome checks, then identified two explicit D01 display violations. The primary stopped clock showed raw execution even for +2, DNF and interrupted records. Late inspection froze its primary countdown at zero instead of showing elapsed overtime.

This correction changes only `src/app/TimerPractice.tsx`, `tests/browser/timer.spec.ts` and this audit. The primary result now shows successful effective execution, including +2, or the explicit DNF/Interrupted status in save-pending, saved and save-failed states. Raw execution, preparation and inspection remain separately labeled and unchanged. Late inspection counts positive elapsed overtime from 15 seconds and shows '+2 on start' or 'DNF on start'. The controller's unrounded threshold math, persisted fields, statistics and semantic-validation gates were not changed.

Three new browser regressions use the existing test-only component mount and paused Playwright clock. They verify the rendered primary +2 value through a deferred real repository write, quota failure and acknowledged retry; a primary DNF status with separately labeled raw execution; and overtime progression at and after 15/17 seconds, including arming. The existing background-interruption check now also asserts the primary Interrupted status and separately labeled raw duration. No dependency, harness API or build-tool change was needed.

The first overtime regression expected an exact boundary value from the last animation frame and observed 0.109 rather than 0.100. The revised test uses real input phase transitions at the paused clock's exact timestamps, plus the controller's existing tick for the arming threshold. This avoids confusing display-frame sampling with timestamp accuracy. No production timing change or existing assertion was weakened.

Checks run after the correction, using pnpm 10.33.2:

- `pnpm exec playwright test tests/browser/timer.spec.ts --reporter=list`: all 10 timer Chrome checks passed.
- `pnpm test`: all 90 unit tests in 7 files passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: application/tests and service worker passed.
- `pnpm build`: passed.
- `git diff --check` and a direct whitespace check of the three follow-up files: passed.

The full 24-test browser result above predates this display correction. This follow-up reran all timer browser checks, not the unrelated full browser suite. Manual-device gaps remain unchanged.

## Parent dependency check

The parent inspected the controller, statistics and component integration and reran lint, strict typecheck, all 90 unit tests, production build and the focused Chrome timer suite. Source review found two display violations: the primary stopped clock showed raw rather than effective time, and late inspection froze at zero. The same implementer corrected them without changing timing or persistence semantics. The parent inspected the corrections and reran all 10 timer browser tests plus whitespace checks. All passed. B03 is accepted as a tested building block for B04, not a claim that production practice is already usable. Q01 will review the integrated trainer.

## Remaining integration and device gaps

B04 is the next implementation dependency. It must supply real Cross challenges, independent optimality verification and a compatible semantic validator, mount the timer in the existing practice area and update release readiness honestly. No product decision blocks that integration. B03 alone does not produce a usable public practice loop.

Emergency JSON export is delivered, but no dedicated emergency-import UI is delivered. A later recovery path must preserve its unsaved label, validate normally and resolve the session reference rather than pretend the file is a complete backup.

Physical iPhone Safari, Android Chrome, Firefox, desktop Safari, assistive technology, actual audible output, OS-installed PWA restart, abrupt OS kill and real storage pressure remain unrun. Chrome emulation checks event ordering, not device ergonomics or audio audibility. No timer benchmark, mobile latency budget, peak memory or battery claim is made. The existing cold-offline entered-move/player and update checks were rerun; their historical evidence files were not rewritten as new B03 benchmark claims.

## Post-Q01 input repair

The owner reported that Space required clicking the timer and supplied an inspection screenshot showing a large blue rectangle. Keyboard handlers were attached only to the timer. The rectangle included the armed border; prevented pointer defaults also made programmatic pointer focus match Chrome's `:focus-visible`.

The mounted practice component now owns background Space only during an active challenge. Native controls, editable content, dialogs, players, hidden tabs and update locks retain their isolation. Key repeats and competing pointer/Space owners remain guarded. Moving a held Space to a native control or losing window focus cancels the hold. Execution timing, strict first inspection action, unrounded penalties and persistence are unchanged.

Pointer focus is marked explicitly because Chrome may retain `:focus-visible` after prevented pointer defaults. Pointer interaction hides that outline; keyboard input or blur clears the marker. Tab navigation still shows focus. Arming changes clock color with the existing armed text instead of a rectangle. Standard and WebKit-prefixed selection prevention stays local to the timer.

The production offline Cross helper no longer focuses the timer before Space. A new browser regression covers background Space, focus-loss cancellation, native input/button ownership and visible Tab focus. Existing strict-mode coverage begins inspection without timer focus and still tests Enter on the focused timer. Pointer coverage checks no border/outline or selected text while dragging, retaining cancellation and real touch-start/stop assertions.

Initial focused run passed 13 of 14; the new outline assertion caught the programmatic-pointer-focus issue. After the explicit pointer marker, parent `pnpm lint`, `pnpm typecheck`, `pnpm build`, all 31 focused timer/statistics/history unit tests and the complete 32-test Chrome browser suite passed. Parent rebuilt after update tests. No assertion or timeout was weakened. Parent reviewed the narrow diff; no dependency, schema, solver, timing-controller or unrelated layout change was made. Physical-device and assistive-technology gaps remain.
