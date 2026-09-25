# Architecture — evoting-mobile

This is a working summary, not the full authoritative spec. For exact API contracts, threat-model detail, and the full accessibility spec, read the vendored docs listed in `docs/UPSTREAM_SYNC.md` (`MOBILE_UX_ARCHITECTURE.md`, `DATA_AND_API_MIGRATION.md`, `THREAT_MODEL_AND_SECURITY.md`) before making architectural changes. This file orients you; it doesn't replace them.

## Layers

```
Screens (UI)
   │
State / Controller  ── single seam for all journey transitions
   │
API client (core-api) ── talks to the election backend over HTTPS
   │
Secure session store ── device-bound session, tokens, refresh/revoke
   │
Crypto client (core-crypto) ── ballot encryption, receipt/proof generation
```

Screens never call the API or crypto layers directly — they go through the state/controller seam. This keeps journey logic (what happens after a successful vote, what happens on session expiry, etc.) in one place instead of scattered across components.

## Screens

Election Hub → Authenticate → Voter Status → Ballot → Cast-or-Audit → Confirm → Receipt → Verify → Watchdog → Results → Settings

Every screen must have working: loading, empty, validation-error, API-error + retry, election-closed, already-voted, and verification-pending states. No screen ships with only a happy path.

## Security principles (non-negotiable)

- HTTPS-only in release builds.
- Never log: national ID (NID), tokens, ciphertext, proofs, or raw server payloads.
- Offline or failed requests must never reach a "recorded" screen — fail closed, not open.
- No mock-success path in production bundles; preview/demo data is test-only.
- Sign-out clears the secure session; clearing app data issues a new device ID that requires re-authentication.

## Session handling

Session refresh, revoke, and revoke-all are centralized in one place, not duplicated per screen. Session expiry, revocation, device mismatch, election closure, duplicate-vote, rate-limit, retryable outage, and unknown-server-error each get distinct, centralized handling — not a generic catch-all.

## Accessibility (built in, not bolted on)

- Every interactive control has an accessible name and state.
- Errors and status changes are announced, not just shown visually.
- Minimum 44×44 touch targets.
- Font scaling supported throughout.
- Selected/error states are never color-only.

## Offline & fail-closed behavior

The app must never show a "vote recorded" or receipt screen unless the real successful server response was received. Offline interruptions at any mutating step (auth, ballot submit, audit, cast) must surface as a retry/blocked state — never as a false success.

## Open architectural decisions

- Whether `packages/core-api` and `packages/core-crypto` stay as vendored local packages (npm workspaces, kept in sync manually) or are eventually split into their own versioned packages that both `evoting-simulation` and `evoting-mobile` install as dependencies. Vendoring is the current approach — revisit if drift becomes a maintenance problem.
