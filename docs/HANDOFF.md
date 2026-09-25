# HANDOFF.md

Primary session-state file. Whoever's context budget is running low creates
the next numbered version (`HANDOFF-2.md`, etc.) using the template at the
bottom — don't just append notes here.

## Current task status

Fetch, docs, and gate-fixing pass complete, same day, two parts:

1. Selective upstream fetch + docs correction (README/CONTEXT/ARCHITECTURE/etc.
   made to describe the real repo tree instead of an aspirational one).
2. On request, fixed the three gates the fetch itself had left broken:
   `mobile-app` typecheck, `core-crypto`'s parity test, and wiring `App.tsx`
   in. All local acceptance gates are green as of this update — see
   `docs/TEST.md`'s observed-results table.

**What was explicitly not done:** no screens were split out of `App.tsx`, no
new tests were written (the parity-test fix repointed two import lines in an
already-existing vendored test, it did not add test logic), no device/staging
evidence was produced, and the placeholder bundle identifier
(`org.evoting.mobileapp`) has not been confirmed as the real product choice.

## What was just completed

**Part 1 — fetch + docs (see prior entries in `docs/implemented_features.md`
for the full list):** vendored `packages/core-api/`, `packages/core-crypto/`,
two mobile adapter files, and seven `docs/upstream/` reference docs from
`evoting-simulation` @ `22fd389c` on `main`; corrected README/CONTEXT's false
"already vendored" claim; rewrote `docs/ARCHITECTURE.md` with the confirmed
security invariants; rewrote `docs/UPSTREAM_SYNC.md` with the real process.

**Part 2 — fixes (this update):**

1. **`mobile-app` typecheck.** Ran `npx expo install expo-crypto
   expo-secure-store @react-native-community/netinfo` from
   `packages/mobile-app` — resolved SDK-57-compatible versions automatically
   and added the `expo-secure-store` config plugin to `app.json`. Added
   `@evoting/core-api`/`@evoting/core-crypto` as workspace dependencies by
   hand. Reconciled `app.json` field-by-field: added `scheme`,
   `newArchEnabled`, `ios.bundleIdentifier`/`android.package` (placeholder —
   see below), `extra.apiBaseUrl`; left the existing icon/adaptive-icon/
   favicon config and Expo SDK version (`~57.0.25`, not downgraded to
   upstream's `^54.0.0`) untouched. Result: clean typecheck.
2. **`App.tsx` wired in.** Copied upstream's `App.tsx` verbatim over the
   placeholder (single-file voter-journey state machine, Hub through
   Settings — not split behind the screen/state seam `docs/ARCHITECTURE.md`
   describes as the target; that split is still an open decision, not done).
   Compared `index.ts` — already equivalent, left alone. Result:
   `npx expo export --platform android` succeeds (603 modules, ~1.5MB bundle).
3. **`core-crypto`'s parity test.** Re-fetched `backend/src/crypto/elgamal.ts`
   and `backend/src/crypto/zkp.ts` from the same commit, vendored them
   verbatim as test-only fixtures under
   `packages/core-crypto/test-fixtures/backend-reference/` with provenance
   headers and a documented refresh process, and repointed
   `src/elgamal.test.ts`'s two imports at them (no other change to that
   file). Chose vendoring over a known-answer-vector rewrite because it keeps
   the stronger claim ("verified by the real backend verifier," not "matches
   a frozen snapshot") — see `docs/UPSTREAM_SYNC.md`'s "Known issue
   (resolved)" section for the full reasoning. Result: 13/13 passing, matching
   upstream's own recorded count.
4. Updated `docs/TEST.md`, `docs/UPSTREAM_SYNC.md`, and this file to record
   the fixes and the new observed-results table.

## Active blockers

- **Bundle identifier is a placeholder, not a decision.** `app.json`'s
  `ios.bundleIdentifier`/`android.package` were set to `org.evoting.mobileapp`
  (parallel construction to upstream's `org.evoting.securevote`, matching this
  repo's own `mobile-app` naming) so the config is structurally complete —
  this was **not** confirmed with a product owner and must be before any real
  build/store submission.
- **`App.tsx` is one file, not the layered architecture `docs/ARCHITECTURE.md`
  targets.** It works and typechecks, but screens/state/API/crypto/storage
  are not yet behind separate seams. Splitting it is still open (see that
  doc's "Open architectural decisions").
- **`core-crypto`'s backend-reference fixtures are a frozen snapshot.** They
  will silently go stale if `evoting-simulation`'s backend crypto changes —
  nothing here watches for that. Re-verify the fixture's recorded commit
  against the backend's current `HEAD` periodically, especially before
  treating a green `core-crypto` suite as proof against *today's* backend.
- **No dedicated Supabase test project / `backend/.env.test`** exists in this
  workspace (inherited context, not fixable from this repo) — blocks live
  session-lifecycle, concurrency, and election-window evidence upstream's own
  `BUILD_NOTES.md`/`ROADMAP_RISKS_DOD.md` mark as Open Question #11.
- No emulator/device or staging environment available in this workspace —
  Detox E2E, secure-storage device evidence, and the P7 staging rehearsal are
  out of reach until one is available.

## Immediate next steps for the next agent session

1. **Confirm or replace the placeholder bundle identifier** before any real
   build.
2. **Decide whether `App.tsx` stays one file or gets split** behind the
   screen/state seam, then do it — organizing screens, journey state, API
   access, crypto, secure storage, and error handling behind explicit
   boundaries (the first implementation item in `AGENT.md`'s order).
3. Implement the complete voter flow's required states (loading, empty,
   validation, offline, retry, closed-election, already-voted,
   pending-verification, tamper-detected) — `App.tsx` as fetched has the
   happy-path shape but not every state `docs/FEATURES.md` requires; verify
   which are already present before assuming a gap.
4. Add tests for each changed contract or security behavior, per
   `docs/TEST.md`.
5. Update `docs/implemented_features.md` and this file with observed results.

---

## Template for the next `HANDOFF-N.md`

```markdown
## Current task status
## What was just completed
## Active blockers
## Immediate next steps for the next agent session
```
