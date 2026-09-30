# Trainer foundation

Status: B01 implementation blueprint, session `orch-20260930-021158`. The Build foundation handoff authorizes this slice; older Build-paused notes below are historical. Scope comes from [PLAN §§3, 5–7](../imports/PLAN.md). Read [Core architecture](../architecture/Core_Architecture.md) first for state, goals, worker messages and reconstruction interchange, then [Tool decision](../architecture/Cube_Tools_Decision.md) for reuse evidence.

## Goal and scope

Provide shared challenge, timer, review, local history and offline foundations for Cross, Cross+1, isolated F2L, OLL/PLL Time Attack, ZBLL and feasibility-gated Cross+2. Deliver Cross/Cross+1 first without weakening later contracts. No initial backend, auth, network trainer API, video persistence, teaching database or speculative sync columns.

Coverage: FR-001–005 and FR-012 directly; shared contracts support FR-006–011 and FR-013. FR-014 gets only the versioned interchange in Core architecture. FR-015/016 remain later tracks.

## Client and hosting boundaries

| Responsibility | Planned component | Contract |
| --- | --- | --- |
| Navigation, explanations, settings | React shell/trainer screens | Phone-first. Scope included features by release; previews state incomplete case coverage. |
| Challenge lifecycle | Challenge controller and transient state | Immutable config/frame/version snapshot, epoch cancellation, one optional queued challenge, presentation timestamp. No pending search time counted as preparation. |
| Legal moves and goals | Shared cube adapter and predicates | Core v1 wire format; one model for generators, validation and review. |
| Bounded generation | Generation Web Worker | Explicit time/node limits, stale-result rejection, cancellation/restart. Cache only compatible tables. |
| Physical timing | Shared timer/input controller | Explicit phase machine, monotonic elapsed times, interruption, self-reported completion. |
| Review | Text moves and locally bundled player | Verified initial state, isolated gestures, representative OLL labels, failure/reduced-motion fallback. |
| Durable records | `idb` repository functions | Atomic transactions, runtime decoding, visible storage failures. No duplicate persistence through Zustand/localStorage. |
| Statistics | Pure derived selectors | Compare compatible records, never store rolling averages as authority. |
| Offline assets | Service worker and setup controller | Release-specific asset manifest, readiness verification, explicit safe update. |
| Hosting | Static origin, chosen only when authorized | Serve emitted assets and navigation fallback. No server data/schema/API. HTTPS needed outside local development for PWA capabilities. |

D01 owns layouts, mockups, focus behavior and screen copy. It must include setup incomplete/retrying, worker progress/failure, recognition-hidden identity, inspection/arming, interrupted attempt, saving/save-failed, backup/restore confirmation, update-waiting and offline-unavailable states.

## Local schema v1

Use IndexedDB database `cube-trainer` with initial database version 1. IDs are random local strings created once, not timestamps. Timestamps are UTC ISO strings; durations are rounded finite nonnegative integer milliseconds. Validate all stored/imported data at boundaries. Retain schema-version constants separately from release, engine, dataset, solver-table and export-format versions.

The following field tables are the durable contract. `GoalOptions`, `TrainingFrame`, `Versions`, `Challenge`, `Move` and `CubeStateV1` refer to Core architecture. Named unions must be discriminated in TypeScript; JSON enters as unknown, never as an unchecked interface.

| Store / primary key | Required fields and indexes |
| --- | --- |
| `settings` / `key` | Single `key: 'preferences'`, theme `'dark'|'light'|'system'`, default trainer, crossColor, inspectionMode `'untimed'|'15s'`, audibleWarnings boolean, reducedMotion `'system'|'on'`, last per-trainer options. Validate options against delivered features; unsupported historical choices remain visible rather than silently changing an attempt. |
| `sessions` / `id` | id, trainer, label, createdAt. Index trainer. Sessions contain one trainer category; OLL and PLL are distinct values. |
| `attempts` / `id` | id, sessionId, trainer, challenge snapshot, presentedAt, endedAt, preparationMs, timing union below, penalty union below, optional runId/repIndex, optional selfReport. Index `[sessionId, endedAt]`, `[trainer, endedAt]`, runId. |
| `personalAlgorithms` / `[caseId, slot]` | caseId, slot `'canonical'|'FR'|'FL'|'BR'|'BL'`, moves, preAuf 0..3, updatedAt, identityPolicyVersion, identityKey, validatedDatasetVersion, validatedEngineVersion. Only F2L accepts slot-specific overrides. No canonical entry is overwritten. |
| `practiceSets` / `id` | id, label, trainer `'oll'|'pll'|'zbll'`, unique ordered caseIds, createdAt, updatedAt. No initial mixed OLL/PLL set. |
| `runs` / `id` | id, sessionId, setId or null for default, frozen set snapshot and comparison key, frozen actual ordered rep plan with caseId/preAuf/yaw, status `'active'|'complete'|'interrupted'|'abandoned'`, cursor, rep outcomes, createdAt, endedAt or null. Index sessionId. No live monotonic start timestamp survives restart. |

A challenge snapshot embeds the legal scramble/start, options/frame, proof and versions. It remains replayable if the bundled dataset changes. Default algorithm/setup at generation and the algorithm actually shown at review are distinguished when an override is selected; persist the selected review Move list and explicit AUF with its validation versions if it differs from the challenge's default. Historical metadata is immutable except explicit timing-penalty edits or deletion. Personal algorithms may change future guidance but cannot rewrite prior challenges.

```ts
type Timing =
  | { status: 'completed'; executionMs: number; inspectionMs: number | null }
  | { status: 'interrupted'; executionMs: number | null;
      inspectionMs: number | null; phase: 'preparation' | 'inspection' |
      'arming' | 'execution'; reason: 'background' | 'restart' | 'cancelled' };
type Penalty = { kind: 'none' | 'plus2' | 'dnf';
  source: 'inspection' | 'manual' | 'none' };
type SelfReport = { executedSlots: readonly Slot[] };
type RepOutcome =
  | { kind: 'attempt'; repIndex: number; attemptId: string }
  | { kind: 'skipped'; repIndex: number; caseId: string }
  | { kind: 'interrupted'; repIndex: number; attemptId: string | null };
```

`inspectionMs` is null only in untimed mode or when inspection never began. No absent duration becomes zero. Penalty source is none exactly when kind is none. Inspection penalties are permitted only for a started strict inspection; manual edits change the source to manual. Raw execution survives +2/DNF. Interrupted timing never contributes a successful time even if penalty is edited. SelfReport is optional and explicitly distinct from proof.solvedSlots. No actual physical pair order or solved state is inferred.

When stopping a rep, write attempt and corresponding run outcome/cursor in one transaction. A transaction abort cannot leave a run pointing at a nonexistent attempt. A save failure keeps the unsaved attempt in memory, blocks automatic advance, offers retry/export of that unsaved record, and never displays "saved". An unsaved record is explicitly tagged in an emergency export and must pass normal validation before later restore. Do not invent durable history when IndexedDB is unavailable.

Editing +2/DNF or deleting an attempt is an explicit transaction. For a run-linked deletion, replace its outcome with interrupted, leave the case in its frozen plan and mark the run non-successful. Undo stores the previous record and affected run in memory until the next edit/deletion or app restart; undo is not a durable audit/sync store. Session deletion confirms deletion of its attempts and runs. Set deletion leaves historical run snapshots intact. Removing an override deletes it, exposing the canonical default.

Disposable solver data lives in a separate IndexedDB database `cube-trainer-solver`, initial version 1, store `tables` keyed by cacheKey. Each entry has engineVersion, contractVersion, tableVersion, moveMetric, framePolicyVersion, checksum, byteLength and bytes. Versioned key and verified checksum prevent incompatible reuse. Storage failure here means rebuild/unavailable generation, not history loss. Cache clearing targets only this database and old asset caches, never personal stores. A separate cache database makes that separation testable without pretending its size is already known.

No bundled dataset lives in personalAlgorithm records. Case data is an immutable versioned local application asset with the rights/coverage manifest in the tool decision. Orphaned historical IDs remain readable through snapshots. An unknown future case in a personal override/set is not silently dropped; restore reports a missing dataset and cannot activate that override/set until validated. B07/B10 must define a deliberate old-ID alias/migration if identity changes, never reassign an existing ID to another case.

## Statistics and comparison keys

Raw successful execution plus 2,000 ms for +2 is the effective time. DNF/interrupted is not zero. Mean/median/population standard deviation of successful times may exclude failures only with an explicit successful count and failure count. WCA-style ao5/ao12 trim one best and one worst result; DNF ranks worst, one DNF can be trimmed, any remaining DNF makes the average DNF. Do not silently replace missing attempts with times. Preparation statistics are separate and labeled "includes scrambling". Inspection is a separate value.

An attempt comparison key includes trainer, frame cross color, inspection mode and applicable options: K/actual depth for Cross; K/L/slot mode for Cross+1/+2 with witness metadata filterable; F2L case/slot/hint/mode; LL case/mode/AUF/yaw settings. UI can filter or intentionally aggregate with clear counts, but must not imply identical difficulty from mixed depths, cases or settings. Witness slot remains filterable generator metadata, not user execution evidence.

Run comparison key is a versioned deterministic serialization of sorted membership, multiplicities, trainer, inspection, recognition/execution, angle randomization policy and algorithm-selection snapshot. Do not include random shuffled order in the default set PB class; store actual order for interpretation. Membership/settings changes create a new class. Provisional conservative choice compares only the same algorithm snapshots. D01 should explain this rather than implying overrides are observed physical algorithms.

A successful set PB requires every planned rep completed, no DNF, skip or interruption. Set successful-rep mean is allowed with its count and separate failed/skipped counts, but not labeled a successful set mean/PB. Whole-run summaries and per-case reps are separate records/statistics. Defaults and custom sets freeze their plan when starting a run so later edits do not change history.

## Export, restore and migration contracts

Normal backup envelope:

```ts
interface TrainerBackupV1 {
  format: 'cube-trainer-backup'; version: 1;
  exportedAt: string;
  cubeContract: 'cube3-facelets-v1';
  settings: readonly SettingsRecord[];
  sessions: readonly SessionRecord[];
  attempts: readonly AttemptRecord[];
  personalAlgorithms: readonly PersonalAlgorithmRecord[];
  practiceSets: readonly PracticeSetRecord[];
  runs: readonly RunRecord[];
}
```

The Record names mean the exact store schemas above, not open dictionaries. Export includes all six personal stores in one consistent readonly transaction. It excludes tables, derived statistics, application caches, canonical case assets and videos. An emergency unsaved-record export uses a distinct format so it cannot masquerade as a complete backup. B01 defines and tests that small format only if the save-failure flow needs it; a normal backup alone does not include an unsaved attempt.

Restore v1 is confirmed replace, no automatic merge. Parse and validate the entire envelope before opening a write transaction. Validate format/version, required fields/enums, bounds, dates, unique IDs, references, trainer/config/proof correspondence, scramble→state equality, goal/witness correctness and personal algorithms against the available compatible dataset. Reject unknown newer versions. A provisional 20 MiB file limit and explicit array/move limits bound validation memory; B01 measures and documents limits, with an actionable rejection rather than partial loading. Never resolve unavailable engine/dataset semantics by trusting imported "validated" fields. If compatible validation is impossible, reject with a prerequisite/version error and preserve current data.

Show record counts and replacement scope, offer a current backup, then require confirmation. Pause timer/generation/editing and recheck that data has not changed since confirmation. Clear and insert the six stores in a single readwrite transaction in the same database. No network, user prompts or asynchronous solver work inside it. Any failure aborts everything and retains previous data. Rebuild transient state after commit; runs imported as active recover interrupted with explicit reset, never resume a timer. Verify IndexedDB transactional atomicity under quota/error/interruption fixtures. Clearing personal data also requires scope confirmation.

IndexedDB database version controls store structure. Backup format version controls file decoding. Do not equate either with app release. Future migration is forward-only, deterministic and transactional; never delete/recreate the personal database as an upgrade strategy. Test old fixtures and aborted migrations. Versionchange closes idle connections; blocked connections show instructions to close another tab. A migration failure keeps old data and exposes backup/recovery instructions rather than silently resetting it. Do not activate an app release that cannot read its local schema.

Explain local storage eviction/deletion/device loss and offer backup early. Request persistent storage through supported browser APIs, report actual grant/denial and quota failures, and never promise durability. No cloud fallback.

## Offline readiness and safe updates

Each release emits a required-asset manifest with releaseId, cube contract/engine/dataset/table versions, asset URLs, integrity/length evidence and required initialization tasks. It includes shell/routes, icons/fonts/explanations, all included case libraries, all player chunks/dependencies, worker scripts and required table data. Runtime lazy rendering may defer execution, never required downloads. A release that does not yet include a later trainer cannot claim all-roadmap readiness.

Setup states are `not-started`, `downloading`, `initializing`, `verifying`, `ready`, `failed`. Persist resumable completion evidence by release; recheck it against actual storage on restart. Preserve already verified assets/tasks after interruption. Show known progress and retry missing work. Do not use navigator.onLine as proof.

Readiness requires all of the following for the active release:

1. A controlling compatible service worker and navigation fallback exist.
2. Every manifest-required asset is in the release cache with verified content/version. Player/worker dynamic chunk inventory is complete, not just entry scripts.
3. Required table initialization succeeded and compatible data is readable with checksum verification. If tables are generated locally, setup must complete it before declaring that trainer ready.
4. Personal IndexedDB opens/migrates and a probe write/read/delete succeeds. Distinguish usable offline assets from failed durable storage.
5. Local shell, never-opened feature/player and generation initialization pass cache-only smoke probes. Release verification separately tests real offline cold navigation/installed restart on actual browsers. Readiness probes are not a substitute for those tests.

Evicted assets or tables downgrade readiness and identify missing work. Offline missing work cannot be "repaired" through a hidden remote dependency. Reconstruction model readiness is separate only after that feature is approved, never part of current trainer setup.

Download an update into a separate release cache. A waiting service worker cannot automatically skipWaiting/reload. Prompt only; active preparation/inspection/arming/execution and save-pending block activation. Preserve saved history and persist run interruption/recovery state before a user-confirmed idle update. Other open tabs must also acknowledge idle/close; if they cannot, leave the update waiting. New worker, table and dataset versions initialize together under the new release. Old clients retain their coherent old cache until closed, not a mixture of chunks. Cleanup old caches only when no controlled client needs them, and never delete personal databases. B01 tests the chosen service-worker lifecycle, including multi-tab blocking, rather than assuming plugin defaults provide it.

## B02 implementation contract

B02 adds an entered-move review drawer, not a trainer. `src/cube` owns the restricted expanded notation and cube3-facelets-v1 conversion to the pinned cubing 0.63.8 KPuzzle. Six proper physical frames, center normalization, slot conjugation and the explicit OLL sticker projection follow Core architecture. Imported state legality is separate from trainer optimality validation. Nonempty trainer backups remain gated until complete semantic validators and datasets exist.

The review validates setup and moves before replacing its current immutable review. Text and step state remain available without WebGL and under reduced motion. The locally bundled TwistyPlayer owns rendering and animation. A source-backed material adapter supplies physical colors because its default scheme differs from the contract. The drawer holds the existing editing activity gate throughout input, initialization and playback. Its events never enter the timer context.

The release manifest scope becomes `move-review`, pins the engine, includes every emitted chunk and local notice/source asset, and requires `cube-model-v1`, `player-module-v1` and `generation-scaffold-v1` initialization. Setup verifies cached bytes first, then initializes the model and player module without opening a player. Cache-only rechecks and real cold-offline browser tests remain distinct evidence. No solver tables or dataset are claimed.

`src/workers` implements the G02 request/reply and cancellation boundary. Missing generators/tables fail explicitly. Setup probes the worker's explicit initialization failure, not generator readiness. `src/reconstruction` supplies runtime-validated synthetic JSON interchange only, outside IndexedDB. Neither component enables training record imports or claims video recognition. No personal database/schema change is needed.

## B01 implementation boundary

B01 creates `src/app`, `src/store` and `src/pwa`. The React workspace uses A's 248 px desktop dock above 900 px and B's 86 px mobile shelf at or below 900 px. Native dialogs contain settings, sessions/help and local data. The clock and scramble are unavailable placeholders, not a timing or generation implementation. Zustand holds only the update activity lock; IndexedDB remains authoritative.

The six personal stores and separate solver table database use the v1 names/keys/indexes above. Settings `lastOptions` is a partial trainer-to-GoalOptions map, initially empty. There are no historical application schemas to migrate. The supported migration fixture is an empty database at version 0 upgrading transactionally to version 1; unknown newer databases fail without reset. A `revision` record in settings is transaction metadata, excluded from backups, and increments on every personal write. Restore compares this revision inside its replacement transaction, rejecting a stale preview across tabs.

The repository exposes acknowledged settings/session/attempt writes. Attempt writes require a supplied compatible semantic validator, including scramble/state and proof checks. No such cube validator is bundled in B01. Backups with attempts, overrides, sets or runs therefore report a missing compatible engine/dataset validator before any mutation. B02 and subsequent case slices must supply those checks before enabling these records. Empty groups and settings/sessions round-trip now. This is a prerequisite failure, not discarded data or claimed cube validation. The attempt API awaits validation and transaction completion; failed attempts remain the caller's responsibility until B03 implements its unsaved-record UI. No emergency export is needed for the inactive B01 clock.

Normal file imports are limited to 20 MiB, 100,000 records per group, 10,000 moves per list and 64 KiB per string. Validation precedes preview and mutation. The UI offers current backup and requires a separate checked replacement confirmation. Personal clearing uses the same confirmed atomic replacement path. A persistent-storage request reports the browser's answer. Connection/versionchange and storage errors stay visible.

The build emits `release-assets.json` with release ID, cube contract, null absent engine/dataset/table versions, SHA-256 and byte length for every emitted shell asset. `vite-plugin-pwa` builds a custom service worker with no automatic activation. The worker verifies and retains assets in a release-specific cache; setup verifies those bytes again, navigation fallback, and the IndexedDB probe. The foundation says only "Offline shell ready" and states player/training assets are absent. B02 must include every lazy player/model/worker dependency and initialization task in this same complete-release manifest, set compatible versions, and add cache-only unopened-player/initialization probes before claiming trainer readiness.

Update application is an explicit all-tab handshake. The waiting worker asks every window to acquire its synchronous activity lock. Preparation, inspection, arming, execution, save-pending, save-failed and editing/restore block the lock. A locked tab cannot start an attempt or edit until activation/reload or cancellation. Missing replies, changed client membership or a busy tab cancel activation. Recheck all locked clients immediately before `skipWaiting`; reload only clients holding that activation token. A newly opened tab during the handshake cancels it. Old release caches are retained so old clients never lose their chunks. Cache cleanup is deferred, with no database deletion during update.

Actual setup/check commands and platform evidence belong in README and the implementer's handoff, not the old G02 validation record.

## Implementation plan and gates

| Task | Reads first / depends on | Acceptance evidence |
| --- | --- | --- |
| D01 | Core architecture and this blueprint, after parent G02 acceptance | Screen/state mockups, phone touch/keyboard separation, setup/backup/failure/update flows, recognition and OLL reset distinctions. No Build. |
| B01 | Accepted D01, schema/offline sections here | Actual tooling, atomic local records/restore, migration and storage-failure fixtures, asset readiness and update baseline. Requires separate Build authorization. |
| B02 | Tool decision and Core state/frame contract | Pinned licenses/artifact, fixture-tested notation/frame/slots, offline player/model agreement and browser measurements. Update manifest with all emitted runtime dependencies. |
| B03/B04 | Timer/result schema and Cross goal | Input/15–17-second/statistics fixtures, stopped-save failure handling, independently verified Cross depths/reveals and integrated backup/offline review. |
| B05/B06 | Worker and combined-goal contracts | Measured supported caps, witnesses, cancellation, budget failure, any-pair/target-slot separation. |
| B07–B11 | Case identity and rights gates | Legitimate manifests, complete inventories, setup/override goals, restartable runs and exported sets, permutation-varied OLL tests. |
| B12/B13 | Two-pair contract | Separate resource/runtime evidence; owner go before integration. |
| R01/R02 later | Small reconstruction interchange after B02 | Separately authorized experiment/worktree/samples; independent ground truth and owner go before integration. |

## Risks, open questions and handoff

No unresolved product choice prevents D01. All six trainer contracts are represented, but Build must prove package behavior, solver ranges, rights and data identity. The 493 ZBLL manifest convention remains a named B10 gate, not an owner question to guess through. B05 cannot invent supported caps in Design; show pending/unsupported states. B02 may require adapter changes if experimental player setup is unsuitable.

Storage eviction, interrupted transactions, multi-tab updates and iOS offline behavior remain empirical risks. Application tests, browser runs, benchmarks and offline installation were not run because no app/toolchain exists. G02 validation is document/link/contract review only.

Next permitted action is parent review/acceptance, then D01 within the owner's Design authorization. D01 should read Core architecture first, preserve the data and goal distinctions, and return genuine product changes to the owner. Do not scaffold an app or begin Build from this handoff.

## G02 validation record

Checked all three deliverables for balanced Markdown fences, trailing whitespace and relative links. All 11 relative links resolve. All 20 distinct public evidence links returned HTTP 200 through their documentation URL or equivalent raw source URL. Commit APIs confirmed the two pinned source revisions in the tool decision. Reviewed contracts against PLAN and FR-001 through FR-005, FR-012 and FR-014, including the different OLL, PLL/ZBLL and isolated F2L goals.

`git diff --check` passed; Git reported only pre-existing CRLF warnings on the unrelated session summary. The new documents also passed the direct whitespace check because untracked files are not covered by that Git command. The staged/index state and unrelated files were not changed. No application typecheck, unit/browser test, build, offline run or benchmark was run. `src/` is empty and no package manifest exists.
