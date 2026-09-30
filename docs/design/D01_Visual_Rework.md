# D01 visual rework

Status: owner rejected the first visual proposal. Build remains paused. Work on local exploration branch `design/solver-workspace-v2`; the rejected checkpoint remains in Git history.

## What failed

The first draft was a settings form with a small timer, a token table, and excessive explanations/borders. Its review checked behavioral consistency, not whether it was a good speedcubing interface. That acceptance is superseded for visual design.

The owner supplied two csTimer screenshots, one customized and one default. Both establish the same useful hierarchy: scramble across the top, a dominant central timer, compact tool controls, and a session/history dock. Their colors, polygon background, old icons, and seven-segment styling are not instructions to clone them.

## Reference attachments

Read the owner's actual images, not only this description:

- Customized csTimer: `C:/Users/johno/.takomi-code/userdata/attachments/3f1bece5-b956-4b5c-b826-bbfc5f48cba1-c3262304-737c-4249-8054-9ab72f8cb28d.png`
- Default csTimer: `C:/Users/johno/.takomi-code/userdata/attachments/3f1bece5-b956-4b5c-b826-bbfc5f48cba1-2d9efff6-00f7-4dd4-9176-772f9377fb9a.png`

These are read-only conversation inputs outside the checkout. Do not modify or republish the attachments.

## Skills and judgment

Use `frontend-ui`, specifically its `frontend-design`, `ui-ux-pro-max`, and UI branch of `prototyping-variants`, plus `unslop`. The suite's generated search output is in `.pi/takomi/design-rework/ui-search.md`. Its Webinar Registration pattern is a false match for the timer query and must be rejected. A skill recommendation is input, not authority over the actual brief.

An Anti-Gravity visual exploration proposed Rail & Canvas and Monolith & Shelf. Use the structural distinction, not its unsafe interaction/contrast suggestions. Do not turn a document-wide click into timer input, hide the scramble during inspection, use low-contrast metadata, or make long-press/right-click the only route to penalties. Keep established timing and accessibility contracts.

## Design system deliverable

Create `docs/design/Design_System.md` before writing the revised mockup. It must define:

- Workspace anatomy and proportions for desktop and portrait phone, showing how the timer dominates without burying scramble or controls.
- Type roles and numeric treatment with tabular digits, stable decimal alignment, realistic long-time widths, and offline-safe fonts/fallbacks. Functional timer size is not limited to the rejected 48/64 px treatment.
- Named semantic colors, contrast, spacing, chrome dimensions, divider/panel hierarchy, and restrained state feedback.
- Concrete component contracts: trainer toolbar, scramble rail, timer canvas, session selector/log rows, compact statistics, settings/help drawers, result/algorithm-review drawer, and prototype-only direction switcher.
- Visible/hidden content by preparation, inspection, running and review states; recognition and witness secrecy; touch/Space and player isolation.
- Two clearly marked candidate page profiles, not an unchosen visual direction presented as approved.

## Two structural directions

A, session dock: a narrow desktop left dock with dense recent solves/statistics; a top scramble rail; the remaining viewport is the clock canvas. On phones, the dock becomes an explicitly accessible drawer, not a stack of forms above the clock.

B, focus shelf: a full-width centered solving canvas with a compact bottom session/statistics shelf that can expand. Settings and review are drawers. It must differ in composition and type treatment from A, not only colors. A light counterpart is acceptable if it is genuinely designed and contrast-safe; dark remains the planned default unless the owner changes that.

Both should feel like a precision practice tool. Spend the visual emphasis on the clock and scramble, not branding or decorative effects. Use realistic illustrative solve data. No hero section, nested cards, giant documentation notice, configuration essay, emojis, or decorative gradient.

## Prototype and documentation

Replace `docs/mockups/Training_Review.html` with the full-viewport visual prototype. Put the proposal in the actual viewport, not inside a phone-plus-desktop documentation page. Support shareable `?variant=dock` and `?variant=focus`, with a small prototype-only bottom switcher; preserve state in the URL, not storage. Arrow shortcuts must ignore inputs/editable controls. Keep its sample-data/prototype notice short and separate from the solving hierarchy.

Prototype main Cross/Cross+1 workspace and a representative case-drill mode using the same component rules. Do not spend the first pass expanding another 308-state generator. Keep all six trainers specified in markdown; this iteration proves the visual system before broad rollout.

Update `Training_Experience.md` and `Training_Screens.md` to reference the new design-system authority and retire incompatible old layout/type choices. Preserve valid goal, timer, reset, persistence and offline behavior. Update no architecture, backend, source code, package, dataset or production configuration.

## Verification and acceptance

Self-critique the system and rendered screenshots against the csTimer references before handoff. Check that the timer and scramble dominate, settings/help are secondary, and phone practice fits without page scrolling to reach the clock. Check 320/390/768/1440/1920 CSS-pixel layouts, text clipping, focus and contrast, at least one long time, and both directions. Report actual checks and missing platform coverage.

The parent will render and inspect both directions and perform one focused visual/interaction review. Internal checks do not substitute for owner preference. Stop with two convincing directions for owner choice, or pause earlier for a genuinely blocking question. Do not start Build.
