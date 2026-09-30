# Genesis and Design handoff

Session: `orch-20260930-021158`. The owner subsequently chose A desktop plus B mobile as an interim baseline and asked to proceed. B01 foundation is now authorized under the session's Build foundation handoff. Visual polish is deferred; research remains unauthorized.

## Current handoff: revised visual proposals

**D01 is closed for an interim implementation baseline, not final aesthetic approval.** The owner chose A desktop plus B mobile, still dislikes the visuals, and wants to defer that work. The first form-heavy proposal remains rejected. Its contract PASS must not be treated as visual quality evidence.

The rework is on local exploration branch `design/solver-workspace-v2`. G01/G02 remain valid. The authoritative product plan and architecture were not changed.

- [Design system](../design/Design_System.md): workspace proportions, numeric hierarchy, semantic tokens, component anatomy and interaction boundaries. It replaces the old form layout and 48/64 px clock caps.
- [A: session dock](../mockups/Training_Review.html?variant=dock): [desktop](../mockups/Training_Review-desktop.png), [phone](../mockups/Training_Review-phone.png).
- [B: focus shelf](../mockups/Training_Review.html?variant=focus): [desktop](../mockups/Training_Review-focus-desktop.png), [phone](../mockups/Training_Review-focus-phone.png).
- [Rework brief](../design/D01_Visual_Rework.md), [interaction specification](../design/Training_Experience.md), [all-trainer screen contracts](../mockups/Training_Screens.md).

Designer `designer-d01` used GPT-6.1 Sol high and the dedicated frontend-ui design/prototype subskills. AGY supplied read-only structural exploration, not a replacement for contract judgment. The search helper's webinar-pattern false match was rejected. Reviewer `reviewer-design-handoff` used GPT-6.1 Sol high and inspected the actual references and rendered desktop/phone images, rather than accepting a token table.

The focused review confirmed the improved timer/scramble hierarchy and genuine dock/shelf distinction, but found execution statistics mislabeled as preparation and absent focus-shelf comparison scope. GPT-6 Luna medium repaired those labels in the same designer conversation. Parent made the history examples explicit: a saved illustrative cap/pool/frame, not a pending current challenge. The temporary checker's stale `L pending` expectation was corrected to verify a concrete history cap while preserving the pending current-challenge label. Final parent checks passed after that correction.

### Current verification

- Parent reran local Chrome `154.0.8037.59` rendering: 20 ready/long layouts across 320×640, 390×844, 768×1024, 1440×900 and 1920×1080, plus 24 narrow-phone Cross+1/OLL state layouts. No page overflow, clipped toolbar controls, clock-text overflow or undersized tested toolbar/switcher targets.
- Checked history-scope fit at 320/390, separate preparation-only metrics in seconds, recognition secrecy, arrow-key isolation inside Settings, focus return, and inert background under the representative OLL review drawer.
- Calculated 42 semantic token/surface combinations. Normal/state text minimum 6.45:1; interactive border/focus minimum 3.77:1. These are token checks, not an assistive-technology certification.
- Strict UTF-8 decoding of ten changed text artifacts, 64 local Markdown links, inline JavaScript syntax and `git diff --check` passed. No remote HTML resources were found.
- Parent visually inspected desktop/phone compositions; persisted PNGs come from the final rendered source. HTML remains self-contained and presentation-only. Times, history scopes, counts, notation and schematic cubes are illustrative, not feasibility evidence or verified challenges.

At this Design checkpoint no application existed. Real iPhone/Android Safari/Chrome, assistive technology, timer/solver/storage/offline behavior and app build/tests remain unrun. A phone Space badge is a disclosed refinement choice, not a claim of touch-device testing.

Next: implement one responsive workspace using A above 900 CSS px and B at 900 px and below, as part of B01 foundation. No more style interviews in this run. Later visual work remains deferred. No push or history rewrite.

## Historical initial handoff (`e5adfae`)

The following records the first proposal's evidence, not current visual acceptance. Its 308-state check does not describe the revised two-direction prototype. Paths reused below now open current artifacts; original contents are preserved in commit `e5adfae`.

### Completed work

- G01, worker on GPT-6 Luna medium: all sixteen FR issue packets, requirements index, coding guidance and builder guidance.
- G02, architect on GPT-6.1 Sol medium: reusable-tool comparison, cube/frame/case/worker/local-data contracts and the foundation feature blueprint.
- D01, designer on GPT-6.1 Sol medium: interaction specification, all-trainer screen/state layouts and a self-contained visual review.
- Read-only reviewer on GPT-6.1 Sol medium: PASS for owner Design inspection, not approval to Build or launch research.

## Review artifacts

- [Browser-viewable mockup](../mockups/Training_Review.html)
- [Desktop preview](../mockups/Training_Review-desktop.png)
- [Phone preview](../mockups/Training_Review-phone.png)
- [Interaction specification](../design/Training_Experience.md)
- [Screen/state layouts](../mockups/Training_Screens.md)
- [Core architecture](../architecture/Core_Architecture.md)
- [Cube tools evaluation](../architecture/Cube_Tools_Decision.md)
- [Foundation blueprint](../features/Trainer_Foundation.md)

The HTML selectors change presentation only. They let the owner inspect trainer/state examples, not run timers, save results or solve cubes. Times, counts, notation and cube images are illustrative.

## Evidence

Parent checks verified all sixteen issue IDs, required sections and local links. Architecture local links and working/staged whitespace checks passed. The reviewer checked the approved plan and contracts, executed 308 trainer/state combinations in a minimal DOM harness, and found no missing values, duplicate specimen IDs or active-practice identity/witness leaks. The reviewer also checked nineteen relative Markdown links and rechecked source/license evidence.

The parent rendered the static HTML in local headless Chrome through the browser debugging protocol. Desktop used a 1440 CSS-pixel viewport; phone used 390. The phone document's client and scroll widths were both 390 pixels. Both screenshots were inspected. This verifies the reviewed compositions, not real phone hardware, all browser interactions or assistive technology.

A single invalid UTF-8 byte in the foundation validation note was replaced with an explicit ASCII FR range. Strict UTF-8 decoding then passed.

No application timing, engine, persistence, offline, unit, typecheck or build checks ran. There is no application package/toolchain yet. Actual iPhone/Android and screen-reader checks remain unrun. Git reported its existing session-summary LF/CRLF warning.

## Boundaries confirmed

Cross uses a maximum optimal depth. Cross+1/+2 caps describe verified witnesses, not global optimality. F2L preserves the isolated context. OLL's successful base can retain LL permutation; PLL/ZBLL require solved/aligned reset and final AUF. Inspection uses a distinct first action before hold/release execution and exact 15/17-second thresholds. Preparation includes scrambling, stays hidden while running, and is never mathematically relabeled as pure planning. Recognition labels remain hidden until the intended reveal. Save failure, confirmed atomic restore, complete offline player setup and timer/player input isolation are explicit.

`cubing` reuse remains provisional. Package behavior, mobile measurements, dataset rights and solver ranges have named later gates. No dataset was copied or benchmark result fabricated during this handoff.

## Owner feedback gate

Review the proposed hierarchy, touch controls, amount of guidance text, desktop history placement, and the clarity of OLL versus PLL/ZBLL reset confirmations. Visual preferences are deliberately proposals, not new locked decisions.

B01 and all other Build/research tasks remain pending. The parent will resume only after owner feedback resolves the Design direction or explicitly authorizes the next step.

## Commit discipline

The owner requested stage-sized local commits. Commit reviewed planning/session work, Genesis contracts, and proposed Design artifacts as scoped changes. Preserve unrelated staged work. Parent owns integration and commits unless explicitly delegated. No automatic push, amend, rebase or history rewrite is authorized.
