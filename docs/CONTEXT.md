# CONTEXT.md

## What is this project?

This is a capstone blockchain-based e-voting system.
`evoting-mobile` is its dedicated React Native (Expo) client — the app a
voter installs to authenticate, cast a ballot, audit-or-cast, get a receipt,
and verify their vote was recorded correctly. It is a tamper-**evident**
client, not a tamper-**proof** one — see `docs/ARCHITECTURE.md` for what that
distinction means concretely.

This repo used to be a package inside a larger monorepo (`evoting-simulation`),
which still holds the backend and the source-of-truth versions of the
crypto/API packages. It was split out here so the mobile app can be
developed, tested, and released on its own. `evoting-simulation` remains
authoritative for the backend protocol and security decisions;
`evoting-mobile` is authoritative for its own app configuration, assets, and
branch workflow. See `AGENT.md` for the full boundary statement.

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

`core-api` and `core-crypto` are vendored into this repo under `packages/` so
the app can typecheck and build standalone. As of this doc's last update they
are **actually present** (previous versions of this doc claimed this before
the fetch had happened — see `docs/HANDOFF.md`). See `docs/UPSTREAM_SYNC.md`
for exactly what was pulled, from where, and how to refresh it.

## Current phase

Just completed, same day: a selective upstream fetch (`core-api`,
`core-crypto`, mobile platform adapters, seven reference docs), a full pass to
make this repo's own docs describe reality, and — on request — a fix pass that
wired `App.tsx` in, reconciled `packages/mobile-app`'s dependencies/config,
and resolved `core-crypto`'s test-file blocker (vendored the two backend
crypto files as provenance-tracked test fixtures). All local acceptance gates
are green — see `docs/TEST.md`.

Next: decide whether `App.tsx` stays one file or is split behind the
screen/state seam `docs/ARCHITECTURE.md` targets, then implement the full set
of required voter-journey states (loading/empty/validation/offline/retry/
closed/already-voted/pending-verification/tamper-detected), confirm the
placeholder bundle identifier, and add tests for each changed contract. See
`docs/HANDOFF.md` for the exact next steps and open blockers.

## Team / task order

Work is serial — one owner at a time, each starting from the previous
owner's merged `dev` commit:

1. **Humaira** — mobile UI architecture, screens, accessibility
2. **Shahi** — API/session integration and contract hardening
3. **Urmi** — Detox E2E automation, offline matrix, device security QA
4. **Nabiha** — staging rehearsal, hostile-client evidence, release readiness

## Where to look for what

| Question | Doc |
|---|---|
| What are the rules I must follow as an agent? | `AGENT.md` |
| How is the app structured, and what are the security invariants? | `docs/ARCHITECTURE.md` |
| What does feature X need to do? | `docs/FEATURES.md` |
| Which upstream files does this repo depend on, and how was the last fetch done? | `docs/UPSTREAM_SYNC.md` |
| How do I test this / what must pass / what's actually passing right now? | `docs/TEST.md` |
| What's already been built? | `docs/implemented_features.md` |
| Where did the last session leave off? | `docs/HANDOFF.md` |
| What's the shape of the whole codebase? | `Graphify-out/` (run `graphify` after a feature lands to refresh it — see `AGENT.md`) |
| What did the upstream design/security docs actually say, verbatim? | `docs/upstream/` — read-only references, not this repo's own spec; see the note at the top of `docs/ARCHITECTURE.md` about how to use them |

## Keeping this file honest

Whenever a doc is added, renamed, or a phase changes, update the table above
in the same PR. An out-of-date `CONTEXT.md` is worse than none — the next
agent will trust it. (This is not hypothetical: the previous version of this
file and of `README.md` both claimed vendored packages that did not exist in
the tree — see `docs/HANDOFF.md` for how that was found and corrected.)
