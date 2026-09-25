# UPSTREAM_SYNC.md — pulling specific paths from evoting-simulation

`evoting-mobile` is standalone, but it still depends on code and docs that live
in the original monorepo, `evoting-simulation` (`https://github.com/sheikhhossainn/evoting-simulation`).
Never clone that whole repo into this one — pull only the paths below, and
only from a scratch clone that gets deleted afterward.

This file describes the **actual** process last run and its **actual**
result. If you re-sync, update this file in the same change — an
out-of-date sync record is worse than none.

## Last sync performed

- **Date:** 2026-09-25
- **Upstream repo:** `https://github.com/sheikhhossainn/evoting-simulation.git`
- **Branch used:** `main`
- **Commit fetched:** `22fd389c877ca5d16fd1d923bb1a5f92c6cd5717` ("merge dev documentation cleanup into main")
- **Why `main` and not `dev`:** at fetch time `dev` was one commit ahead of `main`
  (`981a9e5`, adding `TEAM_MOBILE_TASK_ASSIGNMENTS.md` at the upstream repo root —
  not a path this repo pulls), but `main` carried a commit dev did not have
  (`c725232`, "docs: retain P4 migration record in main history") that corrected
  `BUILD_NOTES.md` and `MOBILE_AGENT_HANDOFF.md` — exactly the two docs this sync
  depends on most. `main` was the more current source for the paths actually
  fetched.

## Paths actually fetched (and retained in this repo)

**Runtime client packages (vendored under `packages/`):**
- `packages/core-api/` — entire folder, retained verbatim at `packages/core-api/`
- `packages/core-crypto/` — entire folder, retained verbatim at `packages/core-crypto/` (one file, `src/elgamal.test.ts`, has its backend import repointed — see "Known issue (resolved)" below; the change is a two-line import path, not new logic)
- `packages/mobile-app/src/expoCrypto.ts` — retained at `packages/mobile-app/src/expoCrypto.ts`
- `packages/mobile-app/src/secureSessionStore.ts` — retained at `packages/mobile-app/src/secureSessionStore.ts`
- `packages/mobile-app/App.tsx` — retained verbatim at `packages/mobile-app/App.tsx` (fetched in a follow-up pass — see "`App.tsx`" section below)
- `packages/mobile-app/index.ts` — read and compared, **not** copied (local was already equivalent — see below)

**Backend crypto, vendored test-only (not runtime code) under `packages/core-crypto/test-fixtures/backend-reference/`:**
- `backend/src/crypto/elgamal.ts`, `backend/src/crypto/zkp.ts` — see "Known
  issue (resolved)" below. Never imported from `src/index.ts` or any app code.

**Design/security reference docs (read-only, retained under `docs/upstream/`):**
- `MOBILE_AGENT_HANDOFF.md`
- `MOBILE_UX_ARCHITECTURE.md`
- `DATA_AND_API_MIGRATION.md`
- `THREAT_MODEL_AND_SECURITY.md`
- `VERIFICATION_AND_TESTING.md`
- `ROADMAP_RISKS_DOD.md`
- `BUILD_NOTES.md` — **later decisions here override older plans in the other
  six docs**; read it first when a claim needs re-checking.

**Backend files — read for contract study only, NOT copied into this repo (with one deliberate exception):**
`backend/src/schema.sql`, `backend/src/routes/{voter,vote,candidates,elections,public,anchor}.ts`,
`backend/src/middleware/{sessionAuth,errorEnvelope}.ts`, and
`backend/src/services/{castIdentity,sessionStore,electionContext,electionLifecycle}.ts`
were read from the scratch clone to confirm the current API/session/vote
contract, then the clone was deleted. None of them exist anywhere in this
repository's tree. **`backend/src/crypto/elgamal.ts` and `backend/src/crypto/zkp.ts`
are the one exception**: read the same way at first, then — once
`core-crypto`'s parity test needed them to actually run — fetched a second
time and vendored verbatim as test-only fixtures. See "Known issue (resolved):
core-crypto's test file" below.

**Not fetched this pass (present in an earlier, broader version of this file,
removed as out of scope for the current task):** `AUDIT.md`,
`METHODOLOGY_CLASSIFICATION.md`, `testing/` (including `hostile_client.mjs`),
`docs/evidence/`. These are upstream artifacts for later phases (P6/P7 device
and staging evidence) — pull them explicitly when that work starts, following
the same process below.

**Explicitly excluded, same as before:**
- `backend/` (any file not listed above) — stays in `evoting-simulation`; this
  app only talks to it over HTTPS.
- Any package not listed above.
- `FUTURE_IMPLEMENTATION.md` / `FUTURE_WORK.md` items (biometrics, WebAuthn,
  push notifications, etc.) — explicitly out of scope.

## `App.tsx` — fetched and wired in a later pass the same day

Upstream's `packages/mobile-app/App.tsx` was initially read but not copied
over this repo's Expo-scaffolded placeholder (kept as one implementation
step). It was brought in during a follow-up pass the same day, once asked to:
copied in **verbatim** (single ~260-line file, the full Hub-through-Settings
voter journey as one state machine with inline screen components — not split
behind the screen/state seam `docs/ARCHITECTURE.md` describes as the target;
that split is still undone, tracked as an open decision there).
`packages/mobile-app/index.ts` was compared and left alone — it was already
functionally identical to upstream's version (same `registerRootComponent`
pattern, cosmetic quote-style difference only).

Making `App.tsx` typecheck and bundle required reconciling
`packages/mobile-app/package.json` and `app.json` with the vendored packages'
needs — done via `npx expo install expo-crypto expo-secure-store
@react-native-community/netinfo` (resolves SDK-57-compatible versions
automatically, since this repo's Expo SDK was kept at `~57.0.25` rather than
downgraded to upstream's `^54.0.0`) plus adding `@evoting/core-api` and
`@evoting/core-crypto` as workspace dependencies. `app.json` gained `scheme`,
`newArchEnabled`, `ios.bundleIdentifier`/`android.package` (set to a
placeholder, `org.evoting.mobileapp`, parallel to upstream's
`org.evoting.securevote` but matching this repo's own `mobile-app` naming
rather than upstream's `secure-vote` branding — needs a real product decision
before any store build), the `expo-secure-store` config plugin (added
automatically by `expo install`), and `extra.apiBaseUrl` (upstream's own
placeholder value, `https://api.example.invalid`) — the existing icon/asset
config was left untouched. `npx expo export --platform android` succeeds
against the result — see `docs/TEST.md` for the full observed-results table.

## How the pull was actually done (sparse-checkout, non-cone mode)

Non-cone mode was used instead of the previous cone-mode instructions because
several targets are individual files (`BUILD_NOTES.md`,
`backend/src/schema.sql`, etc.), not whole directories.

```bash
git clone --no-checkout --filter=blob:none https://github.com/sheikhhossainn/evoting-simulation.git upstream-sync
cd upstream-sync
git sparse-checkout init --no-cone
cat > .git/info/sparse-checkout <<'EOF'
/packages/mobile-app/
/packages/core-api/
/packages/core-crypto/
/MOBILE_AGENT_HANDOFF.md
/MOBILE_UX_ARCHITECTURE.md
/DATA_AND_API_MIGRATION.md
/THREAT_MODEL_AND_SECURITY.md
/VERIFICATION_AND_TESTING.md
/ROADMAP_RISKS_DOD.md
/BUILD_NOTES.md
/backend/src/schema.sql
/backend/src/routes/voter.ts
/backend/src/routes/vote.ts
/backend/src/routes/candidates.ts
/backend/src/routes/elections.ts
/backend/src/routes/public.ts
/backend/src/routes/anchor.ts
/backend/src/middleware/sessionAuth.ts
/backend/src/middleware/errorEnvelope.ts
/backend/src/services/castIdentity.ts
/backend/src/services/sessionStore.ts
/backend/src/services/electionContext.ts
/backend/src/services/electionLifecycle.ts
/backend/src/crypto/elgamal.ts
/backend/src/crypto/zkp.ts
EOF
git checkout main
git rev-parse HEAD   # verify against the commit recorded above before trusting anything in the tree
```

Then, from this repo's root:

```bash
mkdir -p packages/core-api packages/core-crypto
cp -r upstream-sync/packages/core-api/.    packages/core-api/
cp -r upstream-sync/packages/core-crypto/. packages/core-crypto/
cp upstream-sync/packages/mobile-app/src/expoCrypto.ts        packages/mobile-app/src/expoCrypto.ts
cp upstream-sync/packages/mobile-app/src/secureSessionStore.ts packages/mobile-app/src/secureSessionStore.ts

mkdir -p docs/upstream
cp upstream-sync/MOBILE_AGENT_HANDOFF.md      docs/upstream/
cp upstream-sync/MOBILE_UX_ARCHITECTURE.md    docs/upstream/
cp upstream-sync/DATA_AND_API_MIGRATION.md    docs/upstream/
cp upstream-sync/THREAT_MODEL_AND_SECURITY.md docs/upstream/
cp upstream-sync/VERIFICATION_AND_TESTING.md  docs/upstream/
cp upstream-sync/ROADMAP_RISKS_DOD.md         docs/upstream/
cp upstream-sync/BUILD_NOTES.md               docs/upstream/

rm -rf upstream-sync   # delete the scratch clone; nothing else from it is kept

npm install            # regenerates this repo's own package-lock.json; never copy the source monorepo's lockfile
```

## Known issue (resolved): `core-crypto`'s vendored test file

`packages/core-crypto/src/elgamal.test.ts` originally imported the backend
verifier by relative path (`../../../backend/src/crypto/{elgamal,zkp}`),
which resolves in the upstream monorepo but not in this repo, which
deliberately does not vendor the backend. `npm test`/`npm run typecheck
--workspace=@evoting/core-crypto` both failed on module resolution for this
file until the fix below — see `docs/TEST.md` for the before/after observed
output.

**Resolution applied:** option 1 of the two considered (vendor, not
known-answer vectors). `backend/src/crypto/elgamal.ts` and
`backend/src/crypto/zkp.ts` were re-fetched from the same commit
(`22fd389c`) and copied verbatim into
`packages/core-crypto/test-fixtures/backend-reference/`, each prefixed with a
provenance header (source repo, commit, path, fetch date) and a refresh
process (re-run the sparse-checkout for these two paths, diff, replace the
body below the header, bump the date/commit, re-run the suite). The test
file's two imports were repointed at the fixtures — no other line in the test
file changed. Neither fixture is imported from `src/index.ts` or anything
that ships in the app bundle.

**Why vendoring over known-answer vectors:** the source brief's stated
preference was to avoid vendoring backend code if a non-vendoring approach
could carry the same assurance. A known-answer-vector suite (frozen
ciphertext+proof pairs, generated once) would prove "matches a snapshot,"
which is a materially weaker claim than "verified by the real backend
verifier's logic" — the latter is what "port-equivalence" is supposed to mean
per `docs/ARCHITECTURE.md` §4 and `docs/TEST.md`. Vendoring was chosen because
it preserves the stronger claim; the trade-off (a frozen copy that goes stale
if the backend verifier changes) is accepted and made explicit via the
provenance headers and the refresh process above, rather than left implicit.

If this ever needs revisiting (e.g. the refresh burden proves too high in
practice), re-open this section and `docs/TEST.md`'s "Cryptographic parity"
section together — don't let one describe vendoring and the other describe
vectors.

## Re-syncing later

If `evoting-simulation` changes something in these paths after this sync,
repeat the sparse-checkout pull and diff before overwriting — don't blindly
`cp -r` over local changes made in this repo. Re-verify which of `main`/`dev`
is more current for the paths you're pulling (see "Why `main` and not `dev`"
above) rather than assuming the same answer holds.
