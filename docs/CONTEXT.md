# CONTEXT.md

## What is this project?

**Secure Vote BD** is a capstone blockchain-based e-voting system. `evoting-mobile` is its dedicated React Native (Expo) client — the app a voter installs to authenticate, cast a ballot, audit-or-cast, get a receipt, and verify their vote was recorded correctly.

This repo used to be a package inside a larger monorepo (`evoting-simulation`), which still holds the backend and shared crypto/API packages. It was split out here so the mobile app can be developed, tested, and released on its own.

## Where this fits in the bigger system

```
evoting-simulation (backend, core-api, core-crypto)
        │
        ├── backend/               → election server, tallying, verification
        ├── packages/core-api/     → shared API client + contracts (vendored here)
        └── packages/core-crypto/  → client-side encryption/proof generation (vendored here)

evoting-mobile (this repo)
        └── the Expo app that consumes core-api + core-crypto to talk to the backend
```

`core-api` and `core-crypto` are vendored into this repo under `packages/` so the app can typecheck and build standalone. See `docs/UPSTREAM_SYNC.md` for exactly what to pull from the original repo and how to refresh it later.

## Current phase

Mobile migration: turning the original single-file Expo shell into a properly structured app with separated screens, a real state/controller layer, full state coverage (loading/error/offline/etc.), and accessibility built in — while preserving the real API calls, real cryptographic receipts, and fail-closed offline behavior that already existed.

## Team / task order

Work is serial — one owner at a time, each starting from the previous owner's merged `dev` commit:

1. **Humaira** — mobile UI architecture, screens, accessibility
2. **Shahi** — API/session integration and contract hardening
3. **Urmi** — Detox E2E automation, offline matrix, device security QA
4. **Nabiha** — staging rehearsal, hostile-client evidence, release readiness

## Where to look for what

| Question | Doc |
|---|---|
| What are the rules I must follow as an agent? | `AGENT.md` |
| How is the app structured? | `docs/ARCHITECTURE.md` |
| What does feature X need to do? | `docs/FEATURES.md` |
| Which upstream files does this repo depend on? | `docs/UPSTREAM_SYNC.md` |
| How do I test this / what must pass? | `docs/TEST.md` |
| What's already been built? | `docs/implemented_features.md` |
| Where did the last session leave off? | `docs/HANDOFF.md` |
| What's the shape of the whole codebase? | `Graphify-out/` |

## Keeping this file honest

Whenever a doc is added, renamed, or a phase changes, update the table above in the same PR. An out-of-date `CONTEXT.md` is worse than none — the next agent will trust it.
