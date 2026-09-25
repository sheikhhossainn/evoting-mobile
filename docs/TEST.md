# TEST.md — Testing Strategy

## Levels of testing

1. **Static** — typecheck across the app and vendored packages.
2. **Unit/contract** — `core-api` and `core-crypto` have their own test suites; every mobile-used API method needs a request/response contract test (auth headers, election scoping, error mapping).
3. **Build** — Android export must succeed (`npx expo export --platform android`); this is a hard gate, not optional.
4. **E2E (Detox)** — automated device/emulator flows for the full voter journey and its failure modes.
5. **Staging rehearsal** — full-system dress rehearsal against a dedicated test backend, including a hostile-client attack simulation.

## Required E2E scenarios

- Happy path: election → authenticate → ballot → audit → fresh cast → real receipt → verify → Watchdog/Results.
- Duplicate-vote attempt.
- Revoked-session mid-flow.
- Election-close-window edge case.
- Offline interruption at every mutating step (auth, ballot submit, audit, cast).

Assert explicitly: offline or failed requests never reach a recorded-vote screen.

## Device/session checks

- Sign-out clears the secure session.
- Clearing app data creates a new device ID and forces re-authentication.

## Acceptance commands (must all pass before any PR)

```powershell
npm run typecheck --workspace=@evoting/mobile-app
npm test --workspace=@evoting/core-api
npm test --workspace=@evoting/core-crypto

Push-Location packages/mobile-app
npx expo export --platform android
Pop-Location

git diff --check
```

## Staging rehearsal (pre-release only)

Run `testing/hostile_client.mjs` (vendored per `UPSTREAM_SYNC.md`) against a dedicated test backend. Every forged, omitted, unauthorized, or replayed attempt must be rejected, and the public vote-count delta must be zero. Record raw observed output — not expected output — in `evidence/`.

## Evidence discipline

Every test run that matters gets logged with: exact commands, platform/build versions, pass/fail counts, and named blockers for anything skipped. A skip needs a real external blocker — an integrity-critical failure is never quietly converted into a skip.
