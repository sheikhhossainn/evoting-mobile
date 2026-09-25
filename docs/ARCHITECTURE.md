# Architecture — evoting-mobile

This is a working summary, not the full authoritative spec. For exact API
contracts, threat-model detail, and the full accessibility spec, read
`docs/upstream/MOBILE_UX_ARCHITECTURE.md`, `docs/upstream/DATA_AND_API_MIGRATION.md`,
and `docs/upstream/THREAT_MODEL_AND_SECURITY.md` before making architectural
changes — and check `docs/upstream/BUILD_NOTES.md` first, since it records
decisions that override the other three where they conflict. This file orients
you and states the trust boundaries; it does not replace them. See
`docs/UPSTREAM_SYNC.md` for exactly what was pulled from where.

**Tamper-evidence, not tamper-proofing.** Nothing in this system, this app
included, is described as tamper-proof. The design goal is *tamper-evidence*:
a modified ballot, a manipulated result, or a deleted vote is meant to be
*detectable* by an independent verifier, not made impossible. Where a claim
below is about detection rather than prevention, it says so.

## Current implementation state (read this before trusting the layer diagram)

As of this doc's last update, the layer diagram below describes the
**target** shape. The screen list is already real — every screen in it exists
in the running app — but the layering is not:

- `packages/core-api/` and `packages/core-crypto/` are vendored from upstream,
  standalone and platform-neutral. Both pass their tests and typecheck in
  isolation (`core-api` 7/7, `core-crypto` 13/13 — see `docs/TEST.md`).
  `core-crypto`'s parity test proves its output is accepted by a **vendored,
  frozen copy** of the real backend verifier (test-only fixture under
  `packages/core-crypto/test-fixtures/backend-reference/`, provenance and
  refresh process documented there and in `docs/UPSTREAM_SYNC.md`) — not by
  whatever the backend runs today, unless that fixture has been refreshed.
- `packages/mobile-app/src/expoCrypto.ts` and `src/secureSessionStore.ts`
  (the Expo platform adapters) are vendored and present.
- `packages/mobile-app/App.tsx` is upstream's real implementation, copied in
  verbatim — **one ~260-line file** implementing the entire journey (Hub
  through Settings) as a single state machine with inline screen components.
  It is not split behind the screen/state/API/crypto/storage seam the layer
  diagram below describes; that split is an open decision (see below), not a
  gap in what's implemented. `npx expo export --platform android` succeeds
  against it.
- There is no `src/screens`, `src/state`, or comparable directory split.
  Don't assume `App.tsx` is organized the way this doc's layer diagram
  suggests — it's one file today; check it directly before editing.

## Layers (target shape)

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

Screens never call the API or crypto layers directly — they go through the
state/controller seam. This keeps journey logic (what happens after a
successful vote, what happens on session expiry, etc.) in one place instead of
scattered across components. `core-api` and `core-crypto` are platform-neutral
TypeScript with no Expo imports; Expo-specific APIs (`expo-secure-store`,
`expo-crypto`, `@react-native-community/netinfo`) live only in the mobile
adapters (`packages/mobile-app/src/`), never inside the two vendored packages.

## Screens

Election Hub → Authenticate → Voter Status → Ballot → Cast-or-Audit → Confirm → Receipt → Verify → Watchdog → Results → Settings

Every screen must have working: loading, empty, validation-error, API-error +
retry, election-closed, already-voted, and verification-pending states. No
screen ships with only a happy path. See `docs/FEATURES.md` for the per-screen
state requirements.

## Security invariants — what this app must get right

These are drawn from `docs/upstream/THREAT_MODEL_AND_SECURITY.md` and
`docs/upstream/DATA_AND_API_MIGRATION.md`, confirmed directly against the
backend route/service/schema files listed in `docs/UPSTREAM_SYNC.md` at fetch
time. Preserve them unless a source inspection proves a defect — a defect
finding is reported, not silently worked around.

### 1. Voter eligibility and authentication
- The app authenticates a voter with `POST /voter/session {nid, election_id, device_id, captcha_token?}`, which internally re-uses `/voter/register`'s eligibility semantics and returns an opaque, server-issued, 256-bit token plus a non-sensitive voter descriptor (`is_eligible`, `has_voted`, `constituency_code`) — never the nullifier, never the raw NID.
- The raw NID is used **transiently** at this one call. It is never persisted to device storage, never logged, and never sent again for the rest of the session — every later voter-scoped call (`GET /voter/me`, `GET /candidates`, `POST /vote`) authenticates with `Authorization: Bearer <token>` + `x-device-id`.
- Sessions are device-bound (`x-device-id`, a UUID generated once and stored in secure storage) and short-lived (20-minute sliding TTL server-side), with distinguishable failure codes (`SESSION_INVALID` / `SESSION_EXPIRED` / `SESSION_REVOKED` / `DEVICE_MISMATCH` / `DEVICE_ID_REQUIRED`) so the app can choose silent refresh vs. forcing re-authentication.
- Eligibility itself is **not** an identity-verified roll in the current system — `POST /voter/register`/`/voter/session` marks any well-formed 11-digit NID eligible (rate-limited + optionally CAPTCHA-gated, but not identity-proofed). This is a documented, out-of-scope-for-the-simulation product limitation (`docs/upstream/THREAT_MODEL_AND_SECURITY.md` §3.T10, §6.1), not something this app's UI can fix — don't imply stronger identity assurance than the server provides.

### 2. Ballot secrecy — identity is separated from the encrypted ballot
- The `votes` table has no identity column. A vote is keyed by `nullifier_hash = SHA-256(nid ‖ election_id ‖ NULLIFIER_SECRET)`, a value the server alone can compute — `NULLIFIER_SECRET` never leaves the server and the app never sees or derives it.
- For a session-authenticated cast, the nullifier is **captured once, at session issuance** (`POST /voter/session`), while the server still transiently holds the raw NID, and stored as `sessions.nullifier_hash`. `POST /vote` then reads it from the session — it cannot be recomputed later, because a hash cannot be un-hashed and the raw NID is gone by cast time. This is "decision A" (§4 below).
- **Accepted trade-off, stated plainly in the upstream docs and repeated here:** storing `nullifier_hash` beside `voter_nid_hash` in `sessions` means a database-only reader (no `NULLIFIER_SECRET` needed) can now join voter → session → vote. That is a narrowing of the previous unlinkability property, taken deliberately so the session path and the legacy raw-NID path cast the *same* pseudonym (see §3). It is not a defect to "fix" in this app — it is a recorded, upstream-owned security decision. If you believe it needs revisiting, that is a backend/protocol change out of this mobile task's scope (see `AGENT.md`).
- The app must never send the raw NID inside `POST /vote`'s body, never persist it beyond the authentication step, and never log it, the session token, ciphertext, or proof.

### 3. One-vote enforcement across web and mobile ("decision A")
- `fn_cast_vote` enforces one-vote-per-voter atomically in the database (`has_voted` flip + a `SELECT … FOR UPDATE` row lock + a unique constraint on `(election_id, nullifier_hash)`), independent of which client cast the vote.
- The web client still sends `nid` in the body (optional field, `POST /vote`'s `nid` is `z.string().regex(/^\d{11}$/).optional()`); the mobile client authenticates via session and omits it. `backend/src/services/castIdentity.ts` (`resolveCastIdentity`) derives `(nid_hash, nullifier_hash, constituency_code)` identically from either credential — session-first, legacy NID only as a fallback for the web client — so a web vote and a mobile vote for the same person collide on the same nullifier and the second one gets `409 VOTE_ALREADY_CAST`.
- This identity equivalence is exactly why `sessions.nullifier_hash` must be captured at session issuance rather than left for `/vote` to derive some other way (§2's trade-off is the cost of preserving this). Do not "simplify" the session/vote contract in a way that gives the session path a different pseudonym than the legacy path — that would silently break cross-client double-vote prevention.

### 4. Ballot validity and cryptographic proof verification
- The vote request body is exactly `{election_id, encrypted_vote: {c1, c2}, zkp_proof: {challenges[], responses[]}}` plus session authorization (`nid` is present only for the never-implemented web-compat path; the mobile client never sends it). There is no plaintext candidate field anywhere in the request — the Chaum–Pedersen disjunctive OR-proof (Fiat–Shamir, `packages/core-crypto/src/elgamal.ts`) is the *sole* mechanism establishing that the ciphertext encrypts one of the real candidates, and the backend verifies it (`backend/src/crypto/zkp.ts`, `verifyBallotValidity`) against a **server-derived** candidate set for the voter's constituency — the candidate set is never taken from the request.
- `core-crypto` is a byte-for-byte TypeScript port of the web client's prover, with only the CSPRNG and SHA-256 primitives injected per platform (Node for tests, `expo-crypto` for the app). The transcript order and hex serialization (`fiatShamirPreimage`) must stay byte-identical to what the backend recomputes — this is what the port-equivalence test in `core-crypto` exists to prove (see `docs/TEST.md` for its current, currently-broken, status in this repo).
- A ballot the app builds is **only** valid if the real backend verifier accepts it. The app cannot itself certify a ballot as valid — it can only build the proof and observe whether the server's response was 201 or `400 INVALID_BALLOT`.

### 5. Server acceptance versus local UI state
- The app must render a "vote recorded" / receipt state **only** from a real, successful `POST /vote` response (HTTP 201, `{status:"queued", vote_id}`). No screen may fabricate a `vote_id`, a receipt, an anchor status, or a verification result — ever, in any build, including demo/preview builds.
- A `queued` vote is not yet `confirmed`/anchored. The Receipt/Verify screens must render the real anchor state from `GET /anchor/verify/:voteId` and `GET /anchor/latest`, with an honest "pending anchoring" state when the batch hasn't landed yet — never a fabricated `tx_hash`.
- Corollary: **no offline vote queueing.** Ballot validity (ZKP), duplicate-vote prevention (a DB transaction), and the nullifier (server-derived with a server secret) are all authorities the app cannot replicate offline. A ballot "cast" without a live round-trip has not been validated by anyone. If connectivity drops at any mutating step (auth, ballot submit, audit, cast), the app fails closed with a visible retry/blocked state — it never queues the action for later and never shows success. This is a protocol decision from the upstream design (`docs/upstream/MOBILE_UX_ARCHITECTURE.md` §4), not a mobile-app preference, and changing it needs an explicit user decision plus a threat-model update, not a local UX call.
- Retries are safe because casting is idempotent: re-firing `POST /vote` after a timeout yields either the original 201 (never re-shown as a *second* success) or a `409 VOTE_ALREADY_CAST` if it already landed — never a duplicate ballot.

### 6. Anchoring, receipt, and voter-visible verification
- Anchoring (committing a batch root on-chain) is entirely server/chain-side. The app's job is to *display* the real anchor state, not to compute or assert it.
- `GET /anchor/verify/:voteId` reports `included_locally` / `included_on_chain` and returns `409` with a "possible data tampering" body if the locally rebuilt root doesn't match; `GET /anchor/verify-smt/:voteId` reports SMT membership/non-membership (used to detect a deleted vote). The Verify screen must render these three outcomes distinctly (verified / tamper suspected / chain unreachable or pending) — collapsing them into a single "problem" state would hide the difference between "not anchored yet" and "tampering detected", which is exactly the distinction a voter needs.
- **What the app itself verifies vs. what it merely displays — do not conflate these:** everything under "Anchoring, receipt, and voter-visible verification" is a *server-reported* result the app displays; nothing described here is independently recomputed on-device. If the app is later given the ability to verify a Merkle/SMT proof locally, that requires (a) the exact proof format and (b) the exact source implementation and test vectors from `evoting-simulation`, identified and reviewed *before* any such code is written — no new proof-verification scheme may be added by assumption, and until that groundwork lands, any UI copy claiming "independently verified" or "verified on-device" is not accurate. The current Verify screen's factual claim is only ever "the server reports X."

### 7. Auditability and limitations of the trust model
- The system's own stated adversary model (`docs/upstream/THREAT_MODEL_AND_SECURITY.md` §1, §5) assumes an honest server and an honest independent verifier; a compromised server or a DB admin with dropped triggers can still act outside the app's or even the backend route layer's control. This app cannot close that gap — it is a documented trust-model boundary, not a bug.
- Things this app's design explicitly does **not** claim to defend against (stated so nobody re-promises them later): a rooted/jailbroken device (token/audit data readable in-process); a person who genuinely knows another voter's NID and has access to their device (coercion/identity theft — out of scope by the source repo's own adversary model); a state-level CA compromise (no certificate pinning, a deliberate cost/benefit decision, not an oversight).
- Auditability that *is* real: every admin-privileged action (anchor, tally, election-status transition) writes an `admin_actions` row (currently attributed to a static `"shared-admin"` actor — per-admin identity is explicitly out of scope for this pass); election status transitions write `election_status_events`; a genuinely deleted vote still fails SMT membership and the verification-bundle rebuild, which is how deletion is *detected* rather than prevented.

## Session handling

Session refresh, revoke, and revoke-all are centralized in one place, not
duplicated per screen. Session expiry, revocation, device mismatch, election
closure, duplicate-vote, rate-limit, retryable outage, and unknown-server-error
each get distinct, centralized handling — not a generic catch-all. The stable
error envelope (`{error, code, retryable}` — see `packages/core-api/src/index.ts`'s
`ApiErrorCode`) is what drives this; UI copy and retry decisions key off `code`
and `retryable`, never off the free-text `error` message.

## Accessibility (built in, not bolted on)

- Every interactive control has an accessible name and state.
- Errors and status changes are announced, not just shown visually.
- Minimum 44×44 touch targets.
- Font scaling supported throughout.
- Selected/error states are never color-only.

## Offline & fail-closed behavior

The app must never show a "vote recorded" or receipt screen unless the real
successful server response was received. Offline interruptions at any mutating
step (auth, ballot submit, audit, cast) must surface as a retry/blocked state
— never as a false success. See §5 above for why this is a protocol
requirement, not a UX preference.

## Cryptographic honesty — what is and isn't proven here

- `core-crypto` ports the web client's ElGamal + Chaum–Pedersen OR-proof +
  Benaloh cast-or-audit logic verbatim; the parameters are described upstream
  as **simulation-grade**, not production-grade, and this app must not market
  them otherwise. No new bespoke cryptography is to be added anywhere in this
  client.
- What's proven by test today: `core-api`'s 7 contract tests pass standalone
  (serialization, HTTPS-only config validation, error-envelope parsing).
  `core-crypto`'s 13-test suite passes, including port-equivalence — the
  ported prover's output is accepted by a vendored, frozen copy of the real
  backend verifier (see "Current implementation state" above for the caveat
  on that fixture going stale). See `docs/TEST.md` for the full table.
- What depends on assumptions not re-verified here: everything upstream's
  `BUILD_NOTES.md` marks "not yet evidenced" against a live database (session
  lifecycle under real Postgres, N=50 concurrency, election-window race
  behavior) — this app's design assumes those hold as documented, but nobody
  in this repo has re-run them.
- What would need independent cryptographic review before any real election
  use: the ElGamal parameter choice and Fiat–Shamir domain (both inherited,
  simulation-grade per upstream's own description), the single-process
  rate-limiter's scaling assumption, and the entire trust-model boundary in
  §7 above. This app does not attempt that review — it is out of scope for a
  client rebuild.

## Open architectural decisions

- Whether `packages/core-api` and `packages/core-crypto` stay as vendored
  local packages (npm workspaces, kept in sync manually via
  `docs/UPSTREAM_SYNC.md`) or are eventually split into their own versioned
  packages that both `evoting-simulation` and `evoting-mobile` install as
  dependencies. Vendoring is the current approach — revisit if drift becomes a
  maintenance problem.
- Whether `App.tsx` stays a single-file state machine (as fetched, and how it
  now sits in this repo) or is split behind the screen/state seam this doc
  describes. Not yet decided — tracked in `docs/HANDOFF.md`.
- The real bundle identifier for release builds. `app.json` currently carries
  a placeholder (`org.evoting.mobileapp`) so the config is structurally
  complete, not because it's been confirmed as the product's actual identity
  — resolve before any real build.
