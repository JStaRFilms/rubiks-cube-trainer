# B01 foundation handoff

Session: `orch-20260930-021158`. Branch: `build/foundation`.

## Delivered scope

B01 is complete. The React/Vite/strict-TypeScript app now has persistent settings, trainer-specific named sessions, local backup with validated preview and confirmed atomic replacement restore, visible storage failures, install assets, offline shell setup/retry and guarded updates. Desktop uses A's dock; mobile uses B's shelf at 900 CSS px and below. Further visual polish is deferred as the owner requested.

This is not a working cube trainer yet. The clock is explicitly unavailable; no attempts, statistics, verified scrambles, player or case data are fabricated. B02 supplies actual cube validation/player integration; B03 supplies timing/statistics; B04 supplies Cross generation. Video, sync, teaching and deployment remain outside this slice.

## Verification

The parent ran these checks against the actual implementation:

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed for browser and service-worker code |
| `npm test` | 28 tests passed in 2 files |
| `npm run build` | Passed; rebuilt after browser fixtures changed generated release assets |
| `npm run test:browser` | 11 installed-Chrome tests passed |
| `git diff --check` and staged equivalent | Passed; existing LF/CRLF conversion warnings only |

Browser tests cover settings/session persistence, backup round-trip and explicit confirmation, rejected import retention, quota errors, replacement transaction rollback, a stale restore preview after another tab writes, cold offline shell navigation, never-opened Settings, cache corruption/eviction/retry, interrupted setup, responsive dock/shelf layout and dialog focus return. Update tests cover open editing tabs, all attempt phases through the real activity/PWA modules, client handshakes and a deferred start after the update lock. Test-only contract fixtures are not a delivered timer or shipped application API.

Installed versions: React/React DOM 19.3.0, TypeScript 5.9.3, Vite 7.3.6, idb 8.0.3, Zustand 5.0.15, vite-plugin-pwa 1.3.0, Vitest 4.1.11, Playwright 1.63.0 and Tailwind 4.3.3. Lockfile records exact dependency resolutions.

## Focused review

Subagent implementation created the files but twice returned no final report. Read-only async review returned a run ID, but its status file and reports could not be recovered. The diagnostic artifact directory was empty. No independent reviewer verdict is claimed. The parent completed the focused review and verification directly rather than repeatedly relaunching agents or changing Pi configuration.

### Standards

No confirmed blocking standard violation remains. The parent reviewed the typed persistence/validation boundaries, activity/update code, app and responsive styles, and build asset generation. One actual compiler failure, TS2774 at App.tsx's storage capability initializer, was corrected with a runtime `typeof ... === 'function'` guard. TypeScript settings and valid tests were not weakened. Nonblocking style/refactor ideas were not implemented.

### Specification

B01 passes within its stated scope. Personal writes await transaction completion. Restore validates before clearing, checks revision again inside the replacement transaction and aborts failed replacements. Solver storage stays separate. Cache verification checks manifest compatibility, byte lengths and SHA-256; connectivity alone is not readiness. Release status is explicitly shell-only. Updates require idle locks and current client membership; future controllers must use the existing activity gate.

Training records cannot be imported or saved without a compatible semantic validator. The foundation app does not have one yet, so it rejects nonempty attempt/algorithm/set/run imports before replacement. The storage tests use a declared fixture validator, not evidence of cube correctness. Preserve that gate in B02 and later dataset slices.

## Limits and next step

Windows desktop Chrome 154 was tested. Physical iPhone/Android, Safari/Firefox, screen readers, touch hardware and an actual OS-installed PWA restart remain unrun. No remote hosting, production data or deployment was touched.

The owner switched the project to pnpm 10.33.2 after B01. Importing the npm lock preserved all 21 direct resolved dependency versions. Frozen-lockfile installation, lint, typecheck, production build, 28 unit tests and 11 Chrome browser tests passed again through pnpm. The npm commands above record the original checks, not current tooling. Run `pnpm install --frozen-lockfile`, then `pnpm dev` for local development. For offline-shell testing use `pnpm build` and `pnpm preview --port 4173`; setup steps are in README.

Next implementation slice is B02 cube/model/notation/player integration and complete player-inclusive offline evidence. Do not call the foundation's ready shell a ready trainer. Further design polish stays deferred.
