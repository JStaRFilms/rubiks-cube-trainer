# Training screens

D01 layout specification, session `orch-20260930-021158`. Read [Training experience](../design/Training_Experience.md) for exact interaction, secrecy and state rules. Open [Training review HTML](Training_Review.html) in a browser. All sample durations, cases, set counts and notation are illustrative. Cube diagrams are schematic, not verified states or solve evidence.

## Review navigation

The HTML has a clearly separate design-review toolbar. Its trainer and state selectors replace presentation only. It has no timer, generation, storage, solver or real player. It renders the selected composition twice, one narrow phone layout and one desktop layout. Select each trainer, then shared states to inspect the contract. OLL and PLL are separate entries within Time Attack; Cross+2 includes both the unavailable gate and an explicitly conditional future layout.

## Shared composition

Phone target is 390 CSS px, with fluid support down to 320 px. Desktop target is 1000 CSS px inside a 1180 px maximum app width. The review viewport can scroll to show its desktop specimen on smaller browser windows; the application design itself must reflow, not require horizontal scrolling.

```text
Phone                              Desktop
Cube Trainer | Offline status      Cube Trainer                  Offline status
Practice | History | Local data    Practice | History | Local data
Trainer selector                   Trainer selector
Goal / base / holding frame        Goal / base / holding frame
Options, wrapped two per row       Main column              Secondary column
Scramble, token-wrapped             Options + scramble       Result / review
Timing instruction                 Timer + instructions     or recent history
Dedicated timer                    Explicit next/base       Local save status
Result + explicit next             confirmation
Review or recent history
```

Use divider lines rather than a card for every datum. Options use native labeled controls, never a row of unlabeled icons. Section headings are short. Goal/help can use a disclosure but the required physical base and mode instruction must stay visible. Timer region is visually distinct; navigation and player are never inside its hit area.

## Trainer compositions

| Composition | Phone above timer | Desktop secondary / after attempt |
| --- | --- | --- |
| Cross | Cross color, maximum depth K, inspection; goal; holding frame; scramble. Help says at most K. | Actual depth and ceiling, optimal text reveal and local player after reveal; compatible recent Cross times before attempt. |
| Cross+1 | K, measured combined cap L, color, Any pair/target slot, inspection. No witness hint in any-pair. | Found witness/cap/slot only after reveal; optional self-reported executed slot in result, separate from proof. Unsupported caps are disabled/explained, not fake easy/medium/hard tiers. |
| F2L | Case pool, FR only/random slot, mode, rotation hint, inspection; isolated context/base; setup. Current identity appears only in execution mode. | Revealed case, slot, preserved-context text, validated personal/default algorithm and player. Case pool/editor open separate panels. |
| Time Attack, OLL | Set type OLL, full/custom set, selection count, shuffle, AUF/angle, mode and inspection; rep progress without recognition identity. Base requires F2L solved and oriented LL. | Result includes orientation-only reset confirmation and representative-case review. Successful OLL does not require PLL. Whole-run summary is separate from per-rep metrics. |
| Time Attack, PLL | Set type PLL with separate full/custom list; same run controls; solved/aligned physical base. | Final AUF and solved/aligned confirmation, full reset if unsure/failed; never OLL's orientation-only reset. |
| ZBLL | Family/subset selector, coverage status, single/shuffled pool, AUF/angle, mode, inspection; solved/aligned setup base. | Identity/family/note after reveal, final AUF and solved/aligned confirmation; full inventory claim waits for frozen sourced manifest. |
| Cross+2, gated | "Not available · feasibility gate pending"; goal and dependency explanation, disabled Start. | No sequential alternative or usable generated sample. |
| Cross+2, conditional | K, measured L, color and inspection; "Cross + any two distinct pairs". No targeting slots. | Complete-goal witness with two solved slots, cap and upper-bound label. This preview is conditional, not delivered. |

Long option sets move into an Options disclosure after the basic mode/goal controls. On desktop the same options stay in the main column rather than consuming a third column. Small phones can scroll before practice; they must not accidentally start timing while scrolling. During execution nonessential options/review are inactive and no identity-bearing review column is rendered.

## Shared state frames

The review selector supplies these frames for every trainer. Cross+2 remains unavailable unless its conditional preview is explicitly selected.

| Frame | Timer/content | Action/footer |
| --- | --- | --- |
| Setup readiness | Task checklist with player/worker/library/storage/cache checks, downloading/init/verifying and failure/resume variants | Resume missing work or Enter practice only when verified ready |
| Preparing challenge | Phase/progress, blank non-actionable scramble, timer unavailable | Cancel; failure variants Retry / Change settings |
| Untimed | Scramble, hidden prep clock, "Hold to arm" and mode description | No reveal or automatic advance |
| Ready for inspection | Scramble, hidden prep clock, "Tap to inspect" | First action starts inspection only |
| Inspection | Countdown, elapsed-warning text at 8/12, start action explanation | Subsequent hold; +2/DNF overtime frames use exact release boundaries |
| Arming | "Keep holding", then "Armed · release to start" | Early/cancelled release returns without start; inspection keeps running |
| Running | Illustrative execution display; no ticking prep, case identity or review | Tap/Space to stop, isolated timer area |
| Saving | Frozen result and "Saving attempt…" | No Next |
| Stopped/saved | Effective/raw, prep includes scrambling, inspection if used, saved status | Next attempt or base confirmation; Review |
| Interrupted | Available raw duration or "Execution not started"; phase/reason; excluded | Fresh attempt; reset/base confirmation for runs |
| Save failure | Unsaved result and keep-tab-open warning | Retry / Export unsaved record; no advance |
| Review | Text sequence, schematic player, selected frame, representative label where needed | Play/pause, step back/forward, speed, replay; all static in artifact |
| History/preparation | Compatible filter summary, separate execution/preparation views, counts/failures | Edit/delete/Undo, attempt detail, new/labeled session |
| Set results | Per-case rows, success/skip/DNF/interrupted counts and no invalid PB | Same-membership/settings comparison; reset before next run |
| Case/set selection | Case checkboxes, family filter, selected count, coverage warning | Apply only nonempty selection; no mixed OLL/PLL |
| Algorithm editing | Identity, frame, canonical/slot, pre-AUF, default/personal, validation status | Validate, Save valid override, Use default; errors retain old data |
| Confirmed restore | Validated file counts, current-data replacement scope, backup offer | Cancel / Replace local data; busy/success/rollback variants |
| Offline/update/error | Missing assets vs local storage vs worker failure; waiting update | Reconnect/retry missing work, explicit idle update; history remains accessible |

## Review and control detail

Result groups timing into a compact definition list. Effective time is large; raw and penalty are separate. Preparation uses its full label, not "Planning". On desktop review has a 240 px minimum player area; phone uses full width and about 200 px. At all widths the text sequence remains available if animation fails. Player loading says "Loading local player"; failure says "Player unavailable. Text review still available". Reduce motion disables autoplay. Orbit does not change training slot/frame. OLL review says "Representative case. Your unobserved LL permutation may differ".

In recognition frames the HTML deliberately shows no selected-case identity or algorithm before result/review. Builder must also audit hidden accessibility metadata, not just the visible pixels. The editor and selection frames intentionally identify cases outside an active rep. Do not carry these labels into practice.

Base confirmation appears after a saved rep and before any new setup. For OLL the main button says "LL oriented, F2L solved". For PLL/ZBLL it says "Solved and aligned, final AUF done". The secondary action says "Failed / unsure: reset base". F2L says "Cross and all four pairs solved" before applying canonical setup. The resulting challenge has the cross and other pairs solved, with only the target isolated. Confirmation is user assertion, not engine verification of the physical cube. On failed/unsure reps the reset explanation replaces Next until confirmed.

History rows have separate time, penalty, preparation and configuration columns on desktop. On phone stack the configuration line under time; actions open a detail sheet rather than tiny row icons. When there are not enough comparable records say "ao5 unavailable · need 5 comparable attempts". Do not invent graph trends from sparse samples. A preparation table/text summary is the accessible fallback to any later chart. Full-run and rep results stay separate.

Restore preview shows current versus incoming counts of settings, sessions, attempts, algorithms, sets and runs. A backup download is offered before destructive confirmation but does not silently create a server copy. Validation is not replacement. Error variants name invalid/newer format, unavailable compatible dataset, another-tab lock and transaction failure with retained current data. Destructive action cannot run under an active timer or save-pending.

## Responsive, focus and acceptance walkthrough

- At 320/390 px, labels wrap, buttons remain at least 44 px, scramble tokens wrap and no fixed footer covers content.
- At desktop width, practice and review share a clear divider. Tab reaches all controls in reading order. Space in selects/editor/player/dialog does not time a rep.
- Focus ring is visible against panel and background. Dialog focus returns to opener. Phase announcements do not read every frame.
- Untimed walkthrough: present scramble, physically scramble/plan with no ticking prep display, hold 300 ms, release, stop once, see saving then saved, explicitly reveal/next.
- Inspection walkthrough: scramble, first tap/release starts countdown only, subsequent hold arms, release at 14,999 ms no penalty, 15,000 ms +2, 16,999 ms +2, 17,000 ms DNF. Arming time counts.
- Reset walkthrough: OLL succeeds with LL permutation unsolved and continues after orientation confirmation; PLL/ZBLL must finish AUF/solve alignment; failed/unsure always restores correct base. F2L starts setup from solved F2L and produces an isolated target with cross/other pairs solved.
- Recovery walkthrough: cancelled hold disarms; visibility loss interrupts even before execution; failed save blocks advance; restart cannot resume a timer; restore validation error retains data.
- Offline walkthrough: never-opened player included in setup, partial setup resumes, evicted assets downgrade readiness, history storage failure is distinct, updates wait for all tabs to be idle.

These are design acceptance scenarios, not executed application tests. See the D01 handoff for actual static checks. Owner visual feedback is the next gate; Build remains unauthorized.

## D01 static verification record

- Node v24.16.0 parsed/executed the inline presentation script in a minimal DOM harness. All 308 trainer/state combinations rendered both specimens without missing values; generated IDs were unique per specimen. Recognition practice frames contained no revealed identity. This is a render-string check, not a real browser/assistive-technology check.
- Python 3.14.5 checked all 10 relative links across the three artifacts, Markdown fence balance, direct whitespace and HTML tag nesting. All passed. HTML uses no external assets or network requests; script contains no timing, solver, persistence or player runtime.
- WCAG sRGB calculation checked dark tokens against both backgrounds. Minimum contrast was 15.02:1 for text, 9.05:1 secondary, 11.57:1 warning, 9.77:1 error, 10.67:1 focus; primary text/background was 14.38:1. Interactive border contrast was 3.43:1. These calculations do not replace rendered focus/touch checks.
- `git diff --check` passed. Git emitted only the pre-existing CRLF warning for the unrelated session summary. New untracked artifacts were checked directly. No staged files, Git index, source plan, session state or app paths were modified.
- Walked the written states against G02/PLAN for the distinct inspection first action, 300 ms hold/release, 15/17 exact release boundaries, hidden preparation clock, interruption and failed-save advance blocking. Reviewed recognition labels, isolated F2L setup base, orientation-only OLL reset, solved/aligned PLL/ZBLL reset, witness-bound language, offline player readiness and Space/player isolation. No Design blocker found.

Not run: browser rendering/screenshots, iOS/Android/desktop interaction tests, screen-reader testing, real timing, physical-cube fixtures, player playback, storage/restore/offline/update tests, app unit tests/typecheck/build or benchmarks. No application/toolchain exists in this checkout. Owner inspection of the HTML is still required. Next permitted action is parent consistency review, then owner feedback or pause. Build needs separate authorization.
