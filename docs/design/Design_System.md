# Cube Trainer workspace system

D01 rework proposal on `design/solver-workspace-v2`. Neither profile is owner-approved. This replaces the rejected form-first visual system, including its lime palette and 48/64 px clock caps. [Training experience](Training_Experience.md) owns behavior; [PLAN](../imports/PLAN.md) and [G02](../architecture/Core_Architecture.md) take precedence. [Live prototype](../mockups/Training_Review.html?variant=dock) is static presentation, not an app.

## Reference judgment

Read both owner-supplied PNGs in the rework brief. The customized csTimer image spends most of the viewport on a central clock, keeps a full scramble immediately above it, and uses a dense left session log. The default image makes that same anatomy even clearer. Those are the useful decisions. Reject their polygon background, bright yellow/pink/green surfaces, old icon blocks, branding banner and seven-segment type. The clock is a functional readout, not a hero headline.

The frontend-ui search's Webinar Registration result is a false match. No registration form, marketing sections, conversion CTA, animated pattern, Google Font or 48 px landing-page gaps belong here. Keep its contrast/focus advice, discard its anatomy. AGY's Rail & Canvas and Monolith & Shelf distinction is useful; document-wide timing clicks, hidden inspection scrambles, dim metadata and gesture-only penalty edits are not.

## Page profiles, both candidates

### A · session dock

A slate instrument workspace with a fixed-width left session dock and a large, open readout to its right. The signature is the alignment of decimal clock digits with the log's decimal columns, not decorative artwork.

Desktop above 900 px:

```text
┌──────────── toolbar, 56 px ──────────────────────────┐
│ session dock │ scramble rail, 116 px                 │
│ 248 px       ├──────────────────────────────────────┤
│ session      │                                      │
│ statistics   │           TIMER CANVAS               │
│ decimal log  │        large mono readout             │
│              │        one state instruction         │
│              │        result tools after stop       │
└──────────────┴──────────────────────────────────────┘
```

At 1440×900 the dock uses 17% width. The remaining canvas gets about 70% of usable height below the scramble. No maximum-width wrapper turns the viewport into a centered document. At 1920 the dock stays 248 px and the readout caps at 224 px type. Metadata stays 13–14 px, readable but not a competitor to the clock. On portrait phones, the dock is a labeled Session button opening a drawer. Nothing stacks a solve log above the clock.

### B · focus shelf

A centered workspace with no permanent lateral dock. A full-width scramble rail and a wide, light-weight proportional numeric readout occupy the upper workspace. A 126 px bottom shelf holds session selection, its attempt/failure counts, a compact explicit history-scope line, three compact statistics and a horizontal strip of recent solves. The scope describes eligible past attempts, not current challenge settings, and never reveals a hidden case or witness. This is a spatial difference, not a theme switch.

```text
┌──────────── compact toolbar, 56 px ──────────────────┐
│                 scramble rail                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│               CENTERED TIMER CANVAS                 │
│               wide sans-serif digits                │
│                                                     │
├──────────── session / scope / stats / recent ────────┤
└─────────────────────────────────────────────────────┘
```

At 1440×900 the clock is centered on the full viewport, not the dock's remaining column. The shelf occupies 14% height and expands into a drawer when needed. On phones it becomes an 86 px two-row shelf. The first row keeps session name, attempt/failure counts and one statistic; the second shows a compact selected history scope. The full history scope and remaining metrics are in the Session drawer. On phones the log and extra statistics move to that drawer. Dark remains default in both proposals. Focus uses warmer graphite and a quieter warm-white clock, not a cream marketing page.

## Portrait anatomy

At 390×844: two-row compact toolbar 96 px, scramble rail about 134 px, bottom prototype controls reserved 56 px, and at least 450 px for the timer canvas in dock. Focus trades 86 px of that for its shelf. At 320×640: rail wraps whole notation tokens, toolbar remains 96 px, canvas stays at least 250 px, and the main workspace fits without page scrolling to reach the timer. Drawers scroll internally. At 768 the mobile Session drawer stays in use; desktop dock begins at 901 px. Safe-area padding protects bottom controls. Browser zoom can reflow into the portrait layout.

## Numeric type, not branding type

| Role | Dock | Focus | Rules |
| --- | --- | --- | --- |
| Main timer | Consolas, Menlo, ui-monospace, monospace; weight 400 | Segoe UI, system-ui, sans-serif; weight 300 | Tabular lining numerals, one unbroken string, no scaled transform. |
| Regular timer | 112 px at 390; 208 px at 1440; cap 224 | 120 px at 390; 232 px at 1440; cap 260 | Reserve width for 00.00 before timing. Stable decimal, not a bouncing center. |
| Long timer | About 62 px at 320; 82 px at 390; 160 px desktop | About 72 px at 320; 90 px at 390; 180 px desktop | Test `12:34.567`. A dedicated long-time size is allowed; do not clip minutes or decimals. |
| Scramble | Consolas / system monospace, 23 px desktop, 18 px phone | Same, 25 px desktop, 18 px phone | 1.6 line-height, whole tokens, no muted low-contrast notation. |
| Clock state | 14 px medium | 14 px medium | Uppercase only for short phase labels; no paragraph below running clock. |
| Chrome / data | Segoe UI / system sans, 14 px | Same | Data digits tabular; log uses mono 14 px, desktop row 40 px. |
| Drawer heading / body | 22 / 16 px | Same | Case identity appears here only after reveal. Supporting labels 13 px minimum. |

Clock decimal uses the same baseline and size as whole digits. No fake seven-segment face. Short and long timing specimens deliberately test different formats. All fonts are installed-system fallbacks; no font files or network requests.

## Semantic tokens

| Role | Dock | Focus |
| --- | --- | --- |
| Canvas | `#202936` | `#292b30` |
| Chrome / dock / shelf | `#18212d` | `#202227` |
| Raised drawer | `#263344` | `#35383f` |
| Primary text | `#edf3fa` | `#f6f3eb` |
| Secondary text | `#aebed0` | `#c2c0b9` |
| Interactive border | `#7a8fa8` | `#8e929c` |
| Quiet structural divider | `#405166` | `#51545c` |
| Action / armed | `#a6c9ff` | `#b6c9e6` |
| Warning | `#ffce93` | `#ffce93` |
| Error | `#ffb5bd` | `#ffb5bd` |
| Focus ring | `#b4d8ff` | `#b4d8ff` |

Verify normal text at least 4.5:1 against every used surface and focus/control boundaries at least 3:1. Quiet dividers are not interactive boundaries. Armed changes phase text and a slim ring, not the entire screen. Inspection warnings add +2/DNF words. Running is primary text, not red. No gradients, texture, polygons, shadowed cards or status color without text.

Spacing steps: 4, 8, 12, 16, 24, 32. Toolbar gap 8 px, phone side inset 12 px, desktop canvas inset 32 px. Buttons are 44 px high, rounded 5 px. Dense desktop log rows may be 40 px if their explicit row-open button is still 44 px; prototype uses 44 px rows throughout. Drawer inset 24 px desktop/16 px phone, width 420 px maximum, edge anchored, one backdrop. Only drawers have raised treatment. Hover changes border/surface, not geometry. Motion is optional 120 ms color feedback only; reduced motion removes it.

## Component contracts

| Component | Concrete anatomy | Interaction / states |
| --- | --- | --- |
| Trainer toolbar | Small Cube Trainer wordmark, trainer select, compact configuration summary, Settings, Help, Session on phone | Summary exposes K/color/mode and L/pair goal where relevant. Detailed controls live in Settings, not permanent form stacks. Selection regenerates only after explicit discard when a challenge is presented. Running locks changes. |
| Scramble rail | Goal/frame caption, one centered token-wrapped scramble, unobtrusive alternate/setup label | Visible throughout preparation, inspection and running. Search replaces it with progress and non-actionable state. No witness/algorithm/identity hint before reveal. |
| Timer canvas | Dedicated focusable timing region, huge readout, short phase label/action, small Space hint | Not the whole document. Settings, shelf/dock, navigation, help, editor and player are outside timing input. Static prototype never times even on Space. |
| Session selector | Session name, count, New/name-edit through drawer | Sessions per trainer. No mixed trainer average. Drawer filters can label intentional mixed configurations without equivalent-task PB. |
| Log row | Attempt index, effective time, prep duration, written penalty; explicit detail button | +2/DNF/Delete/Undo are visible in detail, not long-press/right-click only. Saved rows only; save-failed record never joins log. |
| Compact statistics | Best, successful mean with count/failures, ao5/ao12 when enough; Details expands median/SD | Comparability summary always visible. Preparation is a separate tab labeled includes scrambling; no chart of presumed pure planning. |
| Settings drawer | Named native fields in compact rows: color, maximum K, inspection; measured L and permitted slots for Cross+1; mode/case pool for case drills | No guessed tiers. Cancel retains options. Apply invalidates challenge snapshot explicitly, never changes active timing. |
| Help drawer | Goal, holding frame, timer sequence, maximum/cap explanation | Scroll within drawer. No essay on canvas. No player nested in timer hit area. |
| Result / review drawer | Effective/raw/penalty/save status, preparation includes scrambling, inspection if used, text sequence, schematic player, step/play/speed/replay, reset confirmation for cases | Post-attempt only. Cross labels verified optimal depth; combined trainers label found witness, upper bound, slot metadata. OLL is representative and orientation-only reset. Player loading/error leaves text available. |
| Algorithm editor | Revealed/selected identity outside active recognition rep, default/personal, explicit pre-AUF/slot, Validate/Save/Use default | Wrong case vs unsupported notation vs missing dataset. Failed validation/save retains prior guidance. Never changes setup or identity. |
| Prototype switcher | Short sample-data cue, previous/next direction, direction name and state select; direction-specific URL | URL `?variant=dock` / `?variant=focus`, plus trainer/state. Arrow shortcuts ignore any control, editable, player, dialog and modified key event. Never handles Space. Prototype only, remove before Build. |

## Visibility and isolation

Preparation has scramble/frame/goal and unticked 0.00/Ready; no prep clock. Inspection retains scramble and shows countdown, warnings at elapsed 8/12 s. First tap/release starts inspection only; a subsequent about 300 ms hold arms, release begins execution. At release elapsed 15,000 ms is +2, 17,000 ms DNF. Early release/cancel disarms, inspection continues. Running shows execution and one stop instruction; review/identity absent. Stopped freezes execution, saves immediately, about 250 ms input guard. Save-pending/failure blocks Next. Review appears through an explicit action after the attempt, never auto-advances.

Recognition hides case identity, algorithm, identifying family, thumbnail captions and accessibility/player metadata before reveal. Case selection outside a rep may show eligible identities, with no current-case highlighting. Any-pair witness is hidden before review; optional executed slot remains self-report. For OLL preserve variable oriented LL permutation, label representative review; PLL/ZBLL require solved/aligned base and final AUF. F2L setup starts with solved F2L and isolates target, keeping cross/other pairs solved. Offline readiness includes all never-opened player dependencies. Interrupted attempts cannot resume or become successful via penalty edits.

Native controls keep their keyboard behavior. Timer-focused Space only; ignore repeats and stop-release. Drawer/dialog focus is contained and returns to opener. Announce phase changes once, never each frame. Timer/context visible name states current action. Touch targets at least 44 px. No low-contrast secret labels, no sound-only warning. Platform behavior still needs Build/browser tests.

## Acceptance and owner choice

This pass asks which workspace feels better during real-cube practice: A's always-visible compatible log, or B's unobstructed center with compact shelf. It also asks whether mono or light sans digits are easier to read at distance. No optional preference blocks this proposal. Functional behavior does not change between profiles. Parent reviews, owner chooses or mixes parts, Build remains paused. Rendered checks and self-critique are recorded in [Training screens](../mockups/Training_Screens.md).
