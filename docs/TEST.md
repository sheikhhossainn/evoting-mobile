# TEST.md — Testing Strategy

## Levels of testing

1. **Static** — typecheck across the app and vendored packages.
2. **Unit/contract** — `core-api` and `core-crypto` have their own test
   suites; every mobile-used API method needs a request/response contract
   test (auth headers, election scoping, error mapping).
3. **Build** — Android export must succeed (`npx expo export --platform android`); this is a hard gate, not optional.
4. **E2E (Detox)** — automated device/emulator flows for the full voter
   journey and its failure modes.
5. **Staging rehearsal** — full-system dress rehearsal against a dedicated
   test backend, including a hostile-client attack simulation.

## Observed results (2026-09-25, after fetch + dependency reconciliation + App.tsx wiring)

These are the actual commands run in this repo and their actual output — not
assumed or copied from upstream's own evidence. Re-run before trusting these
numbers after any dependency or source change. This table replaces an earlier
version of itself from the same day, recorded immediately after the fetch and
before the fixes below — see `docs/HANDOFF.md` for the fix history if you
need it.

| Command | Result |
|---|---|
| `npm install` (root) | lockfile regenerated; workspace links resolve for `@evoting/core-api`, `@evoting/core-crypto`, `@evoting/mobile-app` |
| `npm test --workspace=@evoting/core-api` | **7/7 passed** |
| `npm run typecheck --workspace=@evoting/core-api` | clean, exit 0 |
| `npm test --workspace=@evoting/core-crypto` | **13/13 passed** |
| `npm run typecheck --workspace=@evoting/core-crypto` | clean, exit 0 |
| `npm run typecheck --workspace=@evoting/mobile-app` | clean, exit 0 |
| `npx expo export --platform android` (from `packages/mobile-app`) | **succeeds** — `Android Bundled … (603 modules)`, 1 JS bundle (~1.5MB) + `metadata.json` under `dist/` (gitignored, not committed) |

Everything in this table is currently green. Two fixes made this possible,
both recorded so nobody re-discovers them the hard way:

1. **`core-crypto`'s parity test.** Was failing (`Cannot find module
   '../../../backend/src/crypto/elgamal'`) because that path only resolves in
   the upstream monorepo. Fixed by vendoring
   `backend/src/crypto/{elgamal,zkp}.ts` verbatim as test-only fixtures under
   `packages/core-crypto/test-fixtures/backend-reference/` (each file carries
   a provenance header — source commit, fetch date, refresh process) and
   repointing `src/elgamal.test.ts`'s two imports at them. Neither fixture is
   imported from `src/index.ts` or any app code, so nothing backend-derived
   reaches the mobile bundle. See `docs/UPSTREAM_SYNC.md`'s "Known issue
   (resolved)" section for why vendoring was chosen over a known-answer-vector
   alternative.
2. **`mobile-app`'s typecheck.** Was failing (`Cannot find module
   'expo-crypto'` / `'expo-secure-store'`) because those two Expo modules
   weren't yet in `packages/mobile-app/package.json`. Fixed via `npx expo
   install expo-crypto expo-secure-store @react-native-community/netinfo`
   (SDK-57-compatible versions, auto-added the `expo-secure-store` config
   plugin to `app.json`), plus adding `@evoting/core-api`/`@evoting/core-crypto`
   as workspace dependencies and reconciling `app.json` (added `scheme`,
   `newArchEnabled`, `ios.bundleIdentifier`/`android.package`,
   `extra.apiBaseUrl` — existing icon/asset config and Expo SDK 57 left
   untouched, not downgraded to upstream's SDK 54). See `docs/HANDOFF.md` for
   the full reconciliation record, including the placeholder bundle
   identifier that needs a real product decision before any store build.

## Required E2E scenarios (unchanged target, not yet implemented)

- Happy path: election → authenticate → ballot → audit → fresh cast → real receipt → verify → Watchdog/Results.
- Duplicate-vote attempt.
- Revoked-session mid-flow.
- Election-close-window edge case.
- Offline interruption at every mutating step (auth, ballot submit, audit, cast).

Assert explicitly: offline or failed requests never reach a recorded-vote screen.

## Device/session checks (unchanged target, not yet implemented)

- Sign-out clears the secure session.
- Clearing app data creates a new device ID and forces re-authentication.

## Acceptance commands (must all pass before any PR)

```powershell
npm run typecheck --workspace=@evoting/mobile-app
npm test --workspace=@evoting/core-api
npm test --workspace=@evoting/core-crypto
npm run typecheck --workspace=@evoting/core-api
npm run typecheck --workspace=@evoting/core-crypto

Push-Location packages/mobile-app
npx expo export --platform android
Pop-Location

git diff --check
```

As of this doc's last update, every command in the table above passes in this
repo — see the fix history above for how. Re-run all of it after any
dependency or source change before repeating these numbers; don't let this
table go stale the way the README/CONTEXT claims did before this fetch (see
`docs/HANDOFF.md`).

## Cryptographic parity — what "port-equivalence" means here and what proves it

`core-crypto` claims its ported ElGamal/Chaum–Pedersen prover produces ballots
the **real backend verifier** (vendored verbatim as a test fixture — see
`packages/core-crypto/test-fixtures/backend-reference/`) accepts — for every
candidate position, under multiple keypairs, with negative-parity checks
(tampered proof rejected, wrong candidate-set rejected). That is the property
`src/elgamal.test.ts` proves, and it now passes 13/13 in this repo, matching
upstream's own recorded evidence (`docs/upstream/BUILD_NOTES.md` §6). The
caveat that still applies: the fixture is a **frozen copy** of the backend
verifier as of the commit recorded in its file header — if
`evoting-simulation`'s `backend/src/crypto/{elgamal,zkp}.ts` changes later,
this suite keeps passing against the *old* verifier until someone refreshes
the fixture (process documented in the fixture files' own headers and in
`docs/UPSTREAM_SYNC.md`). A green suite here proves parity with the verifier
*as vendored*, not necessarily with whatever the backend runs today — check
the fixture's commit hash against the backend's current `HEAD` if that
distinction matters for what you're doing.

## Staging rehearsal (pre-release only)

Not available in this workspace. Upstream's runbook
(`docs/upstream/MOBILE_AGENT_HANDOFF.md` §7, referencing
`testing/P7_REHEARSAL_RUNBOOK.md`, not fetched this pass) requires a dedicated
test backend and staging credentials neither of which exist here. When this
work starts, fetch `testing/P7_REHEARSAL_RUNBOOK.md` and
`testing/hostile_client.mjs` per `docs/UPSTREAM_SYNC.md`'s process, run the
harness against a dedicated test backend, and record raw observed output — not
expected output — in `evidence/`.

## Evidence discipline

Every test run that matters gets logged with: exact commands,
platform/build versions, pass/fail counts, and named blockers for anything
skipped. A skip needs a real external blocker — an integrity-critical failure
is never quietly converted into a skip. This file's "Observed results" table
is the model to follow: real commands, real output, named blocker.
