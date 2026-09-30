# Core architecture

Status: G02 contract proposal, session `orch-20260930-021158`. Architecture only. [PLAN](../imports/PLAN.md) controls product behavior; [requirements](../Project_Requirements.md) map coverage. [Tool decision](Cube_Tools_Decision.md) records source evidence and provisional reuse. [Trainer foundation](../features/Trainer_Foundation.md) defines persistence and offline delivery.

## Boundaries and decisions

Use Vite, React and strict TypeScript for a static PWA. No initial server API, account or backend. React owns screens; a small transient store may use Zustand if useful. IndexedDB is the personal-data authority. The service worker owns versioned application assets. A generation worker owns bounded search and disposable tables. Small verified case lookups stay synchronous unless measured work warrants a worker.

Provisionally reuse `cubing` for parsing, KPuzzle operations and TwistyPlayer. One tested conversion boundary connects its model to the wire format below. Do not expose vendor orbit indices or live class instances in workers, backups or reconstruction results. This narrow boundary avoids a second engine without tying durable data to experimental APIs. B02 must prove conversion and playback agreement. Tool selection and search strategy remain engineering hypotheses, not measured guarantees.

Flow: settings → immutable request snapshot → generation worker → validated challenge → scramble presentation → timer → atomic attempt save → history/review. Changes to settings invalidate queued work, never alter a running attempt. Reconstruction, lessons and sync stay separate later tracks. The reconstruction interchange below is a shared-file contract, not a video storage design.

## State and frame contract v1

Type declarations here specify interfaces for future implementers; they are not application code.

```ts
type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
type Color = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange';
type Slot = 'FR' | 'FL' | 'BR' | 'BL';
type QuarterAmount = 1 | 2 | -1;
type MoveFamily = Face | 'Uw' | 'Rw' | 'Fw' | 'Dw' | 'Lw' | 'Bw'
  | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
interface Move { family: MoveFamily; amount: QuarterAmount }
interface TrainingFrame {
  colorOfFace: Readonly<Record<Face, Color>>;
  crossColor: Color;
}
interface CubeStateV1 {
  format: 'cube3-facelets-v1';
  facelets: string;
}
interface Versions {
  contract: 1;
  engine: string;
  dataset: string | null;
  tables: string;
}
```

`facelets` is exactly 54 ASCII face-identity labels in URFDLB face order, each face row-major looking at its outside surface. Labels describe original centers/pieces, not current camera color. Solved is nine U, nine R, nine F, nine D, nine L, nine B. There are nine of each label. Center arrows are ignored, ordinary 3×3 only. Import validates cubie uniqueness, orientation sums and parity after center-frame normalization; counts alone do not prove legality.

Geometric definition removes back/down indexing ambiguity. Set world R=+X, U=+Y, F=+Z. For face normal n, row r and column c from 0 through 2, position is `n + (c-1)*right + (1-r)*up`.

| Face | normal | right on face | up on face |
| --- | --- | --- | --- |
| U | +Y | +X | -Z |
| R | +X | -Z | +Y |
| F | +Z | +X | +Y |
| D | -Y | +X | +Z |
| L | -X | +Z | +Y |
| B | -Z | -X | +Y |

Positive face moves turn clockwise viewed from outside that face. `x`, `y`, `z` turn as R, U, F; M turns as L, E as D, S as F. Wide moves turn the named face and adjacent middle layer. Normalize lower-case wide aliases to `Rw` etc., `2'` to `2`. Expand groups/commutators through the selected parser, then reject unsupported moves. Persist the expanded Move list and canonical text generated from that list. Reject pauses, non-3×3 layers, noninteger turns or vendor-only notation from the durable list. Bound text length, nesting and expanded move count before applying untrusted input; initial provisional limits are 64 KiB text, depth 32 and 10,000 expanded moves, to be verified in B02. No executable input.

Search uses only the 18 outer-face moves. HTM is expanded outer turns, a half turn counts once. Do not count rotations/wides/slices in a challenge cap by an improvised metric. Case algorithms can use them; any displayed case move count must name its separate policy.

The wire state preserves actual spatial stickers and current centers. Slice/wide/rotation moves can move centers. Center labels must form one of the 24 rigid cube orientations. To evaluate a goal or case key, undo the unique rigid rotation that returns centers to the declared initial frame, then inspect pieces. Retain the unnormalized state for replay. This prevents a net regrip from changing case identity or pretending a different pair was solved. Camera orbit is purely visual and never changes state, moves, frame or slot.

The training frame relabels physical colors so selected cross is D. Provisional fixed color scheme is physical U=yellow, R=red, F=green, D=white, L=orange, B=blue. Opposite pairs are white/yellow, green/blue, red/orange. Use this table of physical colors in training D and F, with U/B opposite and R/L determined by the proper rigid rotation of the physical scheme:

| Cross color at D | Color at F |
| --- | --- |
| white | green |
| yellow | green |
| green | yellow |
| blue | yellow |
| red | green |
| orange | green |

This defines all six frames without mirrored color mappings. Store the full colorOfFace map in each challenge/attempt. Always show how to hold the cube for the scramble. It is a provisional default, not an arbitrary color-scheme editor. B02 fixtures must verify each proper rotation and readable text/player agreement.

In the center-normalized training frame, cross pieces are DF, DR, DB, DL. FR is corner DFR with edge FR; FL is DFL/FL; BR is DBR/BR; BL is DBL/BL. "Solved" means exact piece placement and sticker orientation relative to centers. Slots never mean whatever looks front-right after camera orbit. For F2L slot mapping, use proper yaw conjugation with face-label relabeling, not a bare U move or reflection. With the rotation directions above, map canonical FR using identity for FR, y for FL, y' for BR and y2 for BL. Transform both positions and sticker identities; apply the inverse transform before computing the canonical pair key. B02 records the explicit permutation for each slot and proves cross/other-pair preservation, inverse mapping and goal agreement.

## Case identities and goals

A CaseId is an opaque stable string such as `oll:manifest-v1:entry-027`. Display numbering belongs to the verified manifest, not a guessed universal numbering. IDs must not depend on personal algorithms or viewing angle. State keys use the contract version plus the full canonical facelet key or specified projection. Hashes can index these strings but do not replace equality checks.

For LL case equivalence, center-normalize first. Allow pre-AUF U^a and proper yaw conjugation C_b, each a,b in 0..3. C_b rotates positions and relabels solved side identities together, so solved F2L remains solved. Canonical key is the lexicographically smallest projected serialization among `U^a C_b(S)`. No x/z tilt, mirror or inverse equivalence. Record the applied pre-AUF/yaw separately in the challenge. Algorithms are transformed and validated for the actual presented state; equivalence does not make an untransformed algorithm work from every angle.

| Trainer | Canonical identity / initial constraints | Completion predicate and reset |
| --- | --- | --- |
| Cross | Full legal state, independent exact cross distance d satisfies 1 ≤ d ≤ K, K ∈ 1..8. | All four labeled D edges solved. Optimal reveal length d verified. Other pieces unconstrained. |
| Cross+1 | Full legal state, independent cross d ≤ K and complete witness length ≤ L. Goal mode any pair or one target slot. | Solved cross and at least one permitted solved pair. Save witness slot; do not reveal it before attempt or call it observed. Other pairs unconstrained. |
| F2L | Canonical FR target corner/edge position and sticker-orientation projection, normalized back from selected slot, then lexicographic minimum over four pre-U turns. Cross and all other pairs solved. Identity excludes LL arrangement. The sourced manifest must verify that this equivalence gives the standard 41 non-solved identities and map source numbering; a mismatch blocks B07 rather than silently changing the equivalence. | Cross, target pair and every other pair solved at the end. LL unconstrained. This is an isolated-context goal, not full solve or arbitrary pair placement. Intermediate moves can disturb preserved pieces; final constraints must hold. |
| OLL | F2L solved. Key is a 20-bit mask of U-identity occupancy at the U-layer edge/corner sticker locations, ordered by ascending wire facelet index. It ignores LL piece permutation. Canonicalize with the LL equivalences above. Manifest contains 57 non-oriented cases. | F2L solved and every LL sticker on U has U identity. Permutation ignored. Begin next setup from any legal orientation-solved LL permutation with F2L solved. Never demand PLL between successful reps. |
| PLL | F2L solved and LL oriented. Key is full LL piece permutation after LL equivalences. Manifest contains 21 non-solved cases. | Fully solved after an explicit recorded final AUF. A validator may accept solved modulo a post-U turn, but supplies that turn; physical rep completes it before next setup. Reset is fully solved/aligned. |
| ZBLL | F2L solved and LL edges oriented. Key is full LL piece identity and sticker orientation after LL equivalences, not OLL projection. B10 freezes sourced 493 inventory, families/subsets, solved exclusion and PLL aliases. | Fully solved including final AUF, then next setup from solved/aligned. OLL's variable permutation base is invalid here. |
| Cross+2 | Full legal state, cross d ≤ K, witness length ≤ L, any-two distinct slots. B12/B13 gate applies. | Cross and at least two distinct pairs solved simultaneously at the end. No sequential-cost substitute and no initial two-slot targeting requirement. |

The OLL mask has four U edges with two possible sticker locations each and four U corners with three each. It discards LL piece identities, not orientation locations. B02 freezes the explicit 20-index list as a geometry fixture before any dataset keys are generated.

Each CaseEntry contains id, trainer, family/subset, display/source aliases, representative legal CubeStateV1, identity-policy version/key, canonical setup Move[], default solution Move[], allowed angle rules, source/permission evidence and dataset version. A manifest lists exact expected IDs, excluded solved states, aliases and duplicate policy. Family classification alone does not prove identity. B07/B10 require unique keys, intended counts and a mapping to the legitimate source inventory.

Setups derive from canonical data, never personal overrides. Inverse algorithms are acceptable only after verifying the resulting identity and starting constraints. For OLL, verify that the setup applied to every permitted orientation-solved base yields the intended orientation case and that each accepted override preserves F2L and orients LL for all legal LL piece permutations in that case. Enumerate the finite parity-compatible LL permutations or provide a proven permutation-invariance check. One solved-base fixture is insufficient. Representative playback is labeled as such because the app does not observe physical LL permutation.

PLL/ZBLL overrides must solve the exact presented representative, or its explicitly transformed angle, to solved modulo documented final AUF. Reject wrong-case algorithms even if syntactically valid. F2L overrides must solve the requested projected pair across its allowed isolated-context variants while preserving cross/other pairs at the end. Validate canonical and all supported slot/angle transforms. Rotations are normalized, not blanket permission to accept any case. If an algorithm requires a different pre-AUF, store that pre-AUF as part of the explicit solution contract. Reset-to-default deletes only the override.

## Requests, worker lifecycle and results

```ts
type CrossDepth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type GoalOptions =
  | { trainer: 'cross'; K: CrossDepth }
  | { trainer: 'cross1'; K: CrossDepth; L: number;
      pair: { kind: 'any' } | { kind: 'slot'; slot: Slot } }
  | { trainer: 'cross2'; K: CrossDepth; L: number }
  | { trainer: 'f2l'; caseId: string; slot: Slot; hint: boolean;
      mode: 'execution' | 'recognition' }
  | { trainer: 'oll' | 'pll' | 'zbll'; caseId: string;
      preAuf: 0 | 1 | 2 | 3; yaw: 0 | 1 | 2 | 3;
      mode: 'execution' | 'recognition' };
interface GenerateRequest {
  kind: 'generate'; protocol: 1; requestId: string;
  epoch: number; workerInstance: string; versions: Versions;
  frame: TrainingFrame; options: GoalOptions;
  seed: string; budget: { timeMs: number; maxNodes: number };
}
type WorkerRequest = GenerateRequest
  | { kind: 'initialize'; protocol: 1; workerInstance: string;
      versions: Versions }
  | { kind: 'cancel'; requestId: string; epoch: number };
type Proof =
  | { kind: 'cross-optimal'; depth: CrossDepth; solution: readonly Move[] }
  | { kind: 'combined-bound'; crossDepth: number; cap: number;
      witness: readonly Move[]; solvedSlots: readonly Slot[] }
  | { kind: 'case'; caseId: string; identityKey: string;
      setup: readonly Move[]; solution: readonly Move[];
      finalAuf: 0 | 1 | 2 | 3; representative: boolean };
interface ChallengeCommon {
  challengeId: string; requestId: string; epoch: number;
  versions: Versions; frame: TrainingFrame;
  scramble: readonly Move[]; start: CubeStateV1;
}
type Challenge = ChallengeCommon & (
  | { options: Extract<GoalOptions, { trainer: 'cross' }>;
      proof: Extract<Proof, { kind: 'cross-optimal' }> }
  | { options: Extract<GoalOptions, { trainer: 'cross1' | 'cross2' }>;
      proof: Extract<Proof, { kind: 'combined-bound' }> }
  | { options: Extract<GoalOptions, { trainer: 'f2l' | 'oll' | 'pll' | 'zbll' }>;
      proof: Extract<Proof, { kind: 'case' }> }
);
type WorkerReply =
  | { kind: 'ready'; workerInstance: string; versions: Versions }
  | { kind: 'progress'; workerInstance: string; requestId: string | null;
      epoch: number; phase: 'tables' | 'search'; completed: number;
      total: number | null }
  | { kind: 'result'; workerInstance: string; challenge: Challenge }
  | { kind: 'failed'; workerInstance: string; requestId: string;
      epoch: number; code: 'cancelled' | 'budget-exhausted' |
      'unsupported-options' | 'version-mismatch' | 'invalid-result' |
      'worker-crashed'; message: string }
  | { kind: 'initialization-failed'; workerInstance: string;
      versions: Versions; message: string };
```

All integers/budgets are finite and nonnegative; L is a positive integer within the measured supported range. Combined crossDepth is 0..K, witness length is at most L, and solvedSlots contains distinct slots that actually satisfy the final goal. Cross+1 records a permitted witness slot; Cross+2 records at least two. No one-pair result can satisfy Cross+2. Runtime decoders validate messages from unknown input, then trainer/proof correlation: Cross accepts only cross-optimal; Cross+1/+2 only combined-bound with required distinct slots; case trainers only matching case proof. The Challenge union correlates trainer and proof category; runtime checks also correlate caseId, cap, slots and configuration. Seeds reproduce construction only with the exact generator/table versions. A challenge is replayable from its stored scramble/state even when the original seed implementation changes.

Each settings change increments epoch, clears the queue and cancels old requests. Request IDs never repeat within a worker instance. Accept a result only when instance, requestId, epoch, versions and options/frame equal the pending snapshot. Verify scramble applied to solved frame equals start, legality, depth and complete witness goal before presentation. An optional one-item next queue follows the same rules. Pause speculative generation while execution/player work needs resources.

Cooperative cancellation requires search chunks that yield to the worker event loop and check cancellation, monotonic deadline and node budget. A synchronous vendor solver cannot process a posted cancel while blocked. The UI immediately invalidates its request and uses a main-thread deadline watchdog to terminate that worker if necessary, then starts a fresh instance and reinitializes verified caches. Late replies can never be adopted. No SharedArrayBuffer or cross-origin isolation requirement is assumed. B05 measures chunk sizes and watchdog timing; no latency guarantee exists yet.

Only a verified result is success. Exhausted search, missing tables, worker crash and unsupported caps have distinct retry/change-setting states. Never weaken a goal or return a partial challenge. Version mismatch rejects initialization/result. First-run progress uses requestId null and epoch 0 and reports completed work, not fabricated percentages when total is unknown. Initialization has visible failure/retry even without a generate request.

## Timer and result semantics

D01 owns interaction detail. Required state flow is generating → preparation → optional inspection → arming → execution → stopped/save-pending → saved or save-failed. Cancellation disarms without start. Settings never mutate a presented attempt snapshot. Preparation begins on committed scramble presentation and includes scrambling. Inspection starts on its own first action and includes arming. Execution starts on release after approximately 300 ms hold. Use performance.now, round persisted durations only, use wall-clock ISO time for history ordering. At inspection elapsed ≥15,000 ms add +2; ≥17,000 ms DNF. Keep raw execution independent of penalty. Approximately 250 ms post-stop guard and input isolation need B03 tests.

Visibility loss during preparation/inspection/arming/execution interrupts the attempt and disarms. If execution began, retain available raw duration as interrupted, never successful; if not, no invented execution time. Restart cannot resume performance.now timestamps. Active case runs persist only completed/skipped/failed reps and a recovery cursor. An in-flight rep is interrupted on recovery and requires explicit base confirmation/reset before presenting a new setup. Physical goal completion and executed pair are self-reported, not verified by timer input.

## Reconstruction interchange v1

A small JSON boundary is usable by separately authorized R01 after B02. It is not stored in trainer IndexedDB v1 and does not start research or download a model.

```ts
interface TimeInterval { earliestMs: number; latestMs: number }
type ReconstructionEvent =
  | { kind: 'move'; id: string; move: Move; time: TimeInterval | null;
      origin: 'detected' | 'manual'; supersedes: readonly string[];
      score: { value: number; model: string; calibrated: false } | null }
  | { kind: 'gap'; id: string; time: TimeInterval;
      reason: 'occlusion' | 'blur' | 'rotation-ambiguity' | 'unobserved' };
interface ReconstructionV1 {
  format: 'cube-reconstruction'; version: 1;
  cubeContract: 'cube3-facelets-v1'; engineVersion: string;
  initial: { scramble: readonly Move[]; state: CubeStateV1;
      frame: TrainingFrame };
  media: { durationMs: number; timeOrigin: 'video-start';
      sourceId: string };
  events: readonly ReconstructionEvent[];
  revisions: readonly { id: string; action: 'insert' | 'delete' | 'replace';
      removed: readonly ReconstructionEvent[];
      addedIds: readonly string[] }[];
  validation: { transitions: 'valid' | 'invalid' | 'incomplete';
      finalState: CubeStateV1 | null;
      solved: boolean | null; exactSequence: 'unchecked' | 'matched' |
      'mismatched'; groundTruthId: string | null; issues: readonly string[] };
}
```

Time is video-relative milliseconds, finite ≥0, earliest ≤ latest ≤ duration. Unknown move time is null, not zero. Events preserve sequence order even when timing intervals overlap. Overlap is uncertainty, not justification to reorder. SourceId is a local opaque media reference, not an upload URL, recording bytes or a durable video store. A recorded correction retains removed events and links inserted/replaced manual events through supersedes/revisions. Detected model scores are uncalibrated rankings, never promised confidence percentages.

Initial scramble applied to solved in frame must equal supplied initial state. Replay outer/wide/slice/rotation moves with the same notation contract. A gap invalidates complete downstream state inference until corrected; do not guess moves or report a solved final state through it. Legal deterministic transitions do not prove the video sequence is right. `exactSequence: matched` requires an independent groundTruthId and the approved comparison convention. Correct final state and exact sequence remain separate. Consumers recompute validation rather than trusting imported flags. Reject unsupported format/contract versions or illegal initial state without mutation. Corrections trigger replay and new validation. Rotation-aware sequence comparison, error thresholds and phase extraction belong to the R01 experiment, not this architecture.

## Acceptance and handoff

- B02 freezes adapter fixtures for wire geometry, legal/illegal states, center normalization, six colors, four slots, notation round-trip and player agreement. No package behavior is accepted from documentation alone.
- B04 independently verifies cross distances and optimal reveals. B05 verifies bounds, stale settings, termination and failures. B12 measures the two-pair problem separately and requires owner go before integration.
- B07/B10 prove rights, canonical identity, coverage, setups and overrides. OLL tests vary permutation; PLL/ZBLL tests require final AUF; F2L tests preserve isolated context.
- B01 proves the [local/offline contracts](../features/Trainer_Foundation.md). B03 proves timer/statistics boundaries. D01 designs the observable states without replacing these data/goal contracts.

No owner question blocks the current architecture. The provisional color/frame defaults and engineering choices can be tested without changing approved behavior. A different product goal, missing rights that changes delivery scope, unworkable supported cap proposal or weaker alternative trainer requires an owner decision. There is no permission here to begin Build, create worktrees, collect recordings, configure hosting or introduce sync/video stores.
