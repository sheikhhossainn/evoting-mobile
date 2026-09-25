# Implemented Features Log

Every agent updates this file before each push. One entry per push — what was built, how, and any trade-offs. Newest entry on top.

---

<!-- Template for each entry:

## YYYY-MM-DD — <owner> — <short title>
- What: <what was implemented>
- How: <approach / key files touched>
- Trade-offs / follow-ups: <anything deferred or worth flagging>

-->

## 2026-09-25 — feature/mobile-ui-humaira — Fix runtime error: Cannot read property 'fontSize' of undefined

- What: Fixed runtime crash on initial app launch in Expo (`TypeError: Cannot read property 'fontSize' of undefined`).
- How: 
  1. `App.tsx`'s static `StyleSheet.create` accessed `typography.h1.fontSize`, `typography.h2.fontSize`, and `typography.bodySm.fontSize`, but `typography.ts` previously defined titles as `title1`, `title2`, and `display`.
  2. Updated `packages/mobile-app/src/theme/typography.ts` with explicit `h1`, `h2`, `h3`, and `bodySm` definitions. Replaced loose `Record<string, TextStyle>` index signature with strict `const` mapping (`TypographyToken = keyof typeof typography`) so that invalid property accesses trigger compile-time errors instead of runtime crashes.
  3. Replaced dynamic property accesses in `App.tsx` static stylesheet with explicit literal dimensions.
- Trade-offs / follow-ups: Confirmed clean module bundling via `npx expo export --platform android` (622 modules bundled) and clean typecheck (`tsc --noEmit`).

## 2026-09-25 — feature/mobile-ui-humaira — Add @expo/ngrok for tunnel mode support

- What: Installed `@expo/ngrok@^4.1.0` in `packages/mobile-app` (and globally) to resolve `CommandError: Install @expo/ngrok@^4.1.0 and try again` when running `npx expo start --tunnel`.
- How: Added `@expo/ngrok` to `packages/mobile-app/package.json` devDependencies and regenerated `package-lock.json`.
- Trade-offs / follow-ups: Allows remote testing and physical phone connectivity via Expo Go over cellular or separate Wi-Fi networks without firewall or router port forwarding issues.

## 2026-09-25 — feature/mobile-ui-humaira — Polished Mobile UI Design System & Core Screen Implementations

- What: Designed and implemented a cohesive, WCAG 2.1 AA compliant mobile visual system and reusable component architecture for the mobile voting client (`packages/mobile-app`), alongside polished implementations for the four core journey screens:
  1. **Election Hub (`HubScreen.tsx`)**: High-contrast card list with real-time status badges (`Open for Voting` vs `Not Accepting Votes`), active election filtering tab, cryptographic assurance trust card, empty state with retry, and secondary navigation to public auditing tools (Watchdog, Results, Settings).
  2. **Voter Authentication (`AuthScreen.tsx`)**: Keyboard-safe 11-digit NID entry using `KeyboardAvoidingView` and numeric keypad, live digit countdown and verification helper text, privacy and secrecy guarantee banner, and disabled/loading state management.
  3. **Voter Status (`StatusScreen.tsx`)**: 3-way status display (Eligible, Already Voted, Ineligible), constituency metadata card, session TTL and secure-store explanation, and guarded ballot entry.
  4. **Official Ballot & Benaloh Cast-or-Audit (`BallotScreen.tsx` & `AuditScreen.tsx`)**: Single-choice candidate radio cards (`ChoiceCard`), candidate party badges, selection summary bar, direct "Review & Cast" flow to `Confirm`, and dedicated "Benaloh Cast-or-Audit" flow revealing ElGamal $(c_1, c_2)$ ciphertexts and randomness $r$ with local secure-store persistence.
  5. **Reusable Component Library (`src/components/`)**: `Button` (5 variants, min 44pt touch target, loading states, accessibility roles), `Card` (surface elevation containers), `Badge` (dual-coded semantic status chips with icon + label + color), `Input` (accessible text input with 48pt height and live region announcements), `Header` (consistent typography and 44x44pt back navigation), `ChoiceCard` (radio card with role and state), and `StatusBanner` (accessible alerts for error, warning, info, and offline).
  6. **Token System (`src/theme/`)**: Deep Pine Green primary (`#00624A`), Slate typography scale with > 4.5:1 contrast, 4pt/8pt spacing grid, and radius tokens.
  7. **Supporting Documentation (`docs/MOBILE_UI_DIRECTION.md`)**: Full visual system specification and interaction guide.
- How: Created modular theme tokens under `src/theme/`, created accessible reusable components under `src/components/`, implemented target screens under `src/screens/`, wired components cleanly into `App.tsx` while strictly preserving all existing cryptographic (ElGamal + ZKP), session storage (`expo-secure-store`), and REST API (`@evoting/core-api`) contracts. Replaced inline screen code in `App.tsx` while retaining reachable UI for `Confirm`, `Receipt`, `Verify`, `Watchdog`, `Results`, and `Settings`.
- Trade-offs / follow-ups: Kept pure Unicode geometric and status symbols (`●`, `✓`, `✕`, `🔒`, `🛡`, `ℹ`, `▲`, `⚠`) instead of adding heavy icon libraries (`@expo/vector-icons` / `react-native-svg`), ensuring zero native bundle inflation and maximum cross-platform reliability. All 13 crypto tests, 7 API tests, and TypeScript compiler checks pass cleanly (exit 0).

## 2026-09-25 — agent session — Wire App.tsx, fix broken gates from the fetch

- What: Fixed the three gates the earlier fetch pass (below) had left broken.
  (1) `packages/mobile-app` typecheck: added `expo-crypto`, `expo-secure-store`,
  `@react-native-community/netinfo` via `expo install` (SDK-57-compatible
  versions) and `@evoting/core-api`/`@evoting/core-crypto` as workspace deps;
  reconciled `app.json` (`scheme`, `newArchEnabled`, `ios.bundleIdentifier`/
  `android.package` — placeholder, unconfirmed —, `extra.apiBaseUrl`,
  `expo-secure-store` plugin) without touching existing icon/asset config or
  downgrading the Expo SDK. (2) Copied upstream's `App.tsx` in verbatim (single
  file, full voter journey, Hub through Settings) — not split behind the
  screen/state seam `docs/ARCHITECTURE.md` targets; that stays an open
  decision. `index.ts` compared and left alone (already equivalent). (3)
  `core-crypto`'s parity test: vendored `backend/src/crypto/{elgamal,zkp}.ts`
  verbatim as provenance-tracked, test-only fixtures under
  `packages/core-crypto/test-fixtures/backend-reference/` and repointed the
  test file's two imports at them — no other test logic changed.
- How: `npx expo install …` from `packages/mobile-app`; manual `package.json`/
  `app.json` edits; a second targeted sparse-checkout fetch (same commit,
  `22fd389c`) for `packages/mobile-app/index.ts` and the two backend crypto
  files; `npm install` at root to relink workspaces and regenerate the
  lockfile.
- Trade-offs / follow-ups: bundle identifier is a placeholder needing a real
  product decision before any store build. `App.tsx` staying one file is a
  deliberate deferral, not an oversight — splitting it is next-session work.
  The vendored crypto fixtures are a frozen snapshot (commit `22fd389c`) that
  will silently go stale if the backend's crypto changes — no automation
  watches for that; see the fixture files' own headers for the refresh
  process. All local acceptance gates are green as of this entry — see
  `docs/TEST.md`.

## 2026-09-25 — agent session — Selective upstream fetch + design-doc correction

- What: Vendored `packages/core-api/` and `packages/core-crypto/` (complete,
  unmodified) from `evoting-simulation` into this repo, plus the two Expo
  platform adapters (`packages/mobile-app/src/expoCrypto.ts`,
  `src/secureSessionStore.ts`) and seven read-only design/security docs into
  `docs/upstream/`. Regenerated this repo's own `package-lock.json`.
  Rewrote `docs/ARCHITECTURE.md`, `docs/UPSTREAM_SYNC.md`, `docs/HANDOFF.md`,
  `docs/TEST.md`, `docs/CONTEXT.md`, `README.md`, and `AGENT.md` to state
  the repo's actual contents and the confirmed backend contract (session
  auth, one-vote enforcement across web/mobile, vote request shape,
  server-vs-UI state, anchoring/verification) instead of aspirational or
  stale claims. No screens, state layer, or tests were written.
- How: `git sparse-checkout` (non-cone mode) against a scratch clone of
  `evoting-simulation` at commit `22fd389c` on `main`; see
  `docs/UPSTREAM_SYNC.md` for the exact command sequence and path list.
  Backend route/service/schema/crypto files were read from the scratch clone
  for contract confirmation and then discarded (never copied into this repo).
- Trade-offs / follow-ups: `packages/mobile-app/App.tsx` was deliberately
  **not** overwritten with upstream's real implementation — that's
  implementation work, not fetch, and is the next session's first task (see
  `docs/HANDOFF.md`). `packages/core-crypto`'s vendored test file
  (`src/elgamal.test.ts`) fails both `npm test` and `npm run typecheck` in
  this repo because it imports the backend verifier by a relative path this
  repo doesn't have (`../../../backend/src/crypto/{elgamal,zkp}`) —
  documented, not fixed, in `docs/UPSTREAM_SYNC.md` and `docs/TEST.md`.
  `packages/mobile-app/package.json`/`app.json` were not reconciled with the
  newly vendored packages' dependencies this session — as a direct
  consequence, `npm run typecheck --workspace=@evoting/mobile-app` now fails
  (missing `expo-crypto`/`expo-secure-store`, both required by the two
  vendored adapter files) where it previously passed against the bare
  scaffold. Recorded, not silently fixed or hidden — see `docs/TEST.md`.
