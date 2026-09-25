# Implemented Features Log

Every agent updates this file before each push. One entry per push — what was built, how, and any trade-offs. Newest entry on top.

---

<!-- Template for each entry:

## YYYY-MM-DD — <owner> — <short title>
- What: <what was implemented>
- How: <approach / key files touched>
- Trade-offs / follow-ups: <anything deferred or worth flagging>

-->

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
