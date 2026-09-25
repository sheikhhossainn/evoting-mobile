# UPSTREAM_SYNC.md — pulling specific paths from evoting-simulation

`evoting-mobile` is standalone, but it still depends on code and docs that live in the original monorepo, `evoting-simulation`. Never clone that whole repo into this one — pull only the paths below.

## Paths to pull

**App source (the actual mobile app being migrated):**
- `packages/mobile-app/` — entire folder (`App.tsx`, `src/screens`, `src/components`, `src/state` or `src/theme`, `package.json`, `app.json`)

**Vendored shared packages (mobile depends on these directly):**
- `packages/core-api/` — API client + contracts
- `packages/core-crypto/` — client-side encryption/proof generation

**Docs (read-only references — keep under `docs/upstream/`):**
- `MOBILE_AGENT_HANDOFF.md`
- `MOBILE_UX_ARCHITECTURE.md`
- `DATA_AND_API_MIGRATION.md`
- `THREAT_MODEL_AND_SECURITY.md`
- `VERIFICATION_AND_TESTING.md`
- `ROADMAP_RISKS_DOD.md`
- `AUDIT.md`
- `METHODOLOGY_CLASSIFICATION.md`

**Testing assets:**
- `testing/P7_REHEARSAL_RUNBOOK.md`
- `testing/hostile_client.mjs`
- `testing/offline_matrix_output.json`
- `docs/evidence/` (mobile verifier/rehearsal artifacts only)

**Do not pull:**
- `backend/` — stays in `evoting-simulation`; mobile only talks to it over HTTPS
- Any package not listed above
- `FUTURE_IMPLEMENTATION.md` items (biometrics, WebAuthn, push notifications, etc.) — explicitly out of scope for now

## How to pull just these paths

From a scratch clone, using sparse-checkout so you never download the whole tree:

```bash
git clone --no-checkout --filter=blob:none https://github.com/sheikhhossainn/evoting-simulation.git upstream-sync
cd upstream-sync
git sparse-checkout init --cone
git sparse-checkout set \
  packages/mobile-app \
  packages/core-api \
  packages/core-crypto \
  testing \
  docs/evidence \
  MOBILE_AGENT_HANDOFF.md \
  MOBILE_UX_ARCHITECTURE.md \
  DATA_AND_API_MIGRATION.md \
  THREAT_MODEL_AND_SECURITY.md \
  VERIFICATION_AND_TESTING.md \
  ROADMAP_RISKS_DOD.md \
  AUDIT.md \
  METHODOLOGY_CLASSIFICATION.md
git checkout dev
cd ..
```

Then copy what you need into this repo:

```bash
# run from the evoting-mobile repo root
cp -r upstream-sync/packages/mobile-app/.      .                    # app source into this repo's layout
mkdir -p packages
cp -r upstream-sync/packages/core-api          packages/core-api
cp -r upstream-sync/packages/core-crypto       packages/core-crypto

mkdir -p docs/upstream
cp upstream-sync/MOBILE_AGENT_HANDOFF.md       docs/upstream/
cp upstream-sync/MOBILE_UX_ARCHITECTURE.md     docs/upstream/
cp upstream-sync/DATA_AND_API_MIGRATION.md     docs/upstream/
cp upstream-sync/THREAT_MODEL_AND_SECURITY.md  docs/upstream/
cp upstream-sync/VERIFICATION_AND_TESTING.md   docs/upstream/
cp upstream-sync/ROADMAP_RISKS_DOD.md          docs/upstream/
cp upstream-sync/AUDIT.md                      docs/upstream/
cp upstream-sync/METHODOLOGY_CLASSIFICATION.md docs/upstream/

cp -r upstream-sync/testing                    testing
mkdir -p docs/evidence
cp -r upstream-sync/docs/evidence/.            docs/evidence/

rm -rf upstream-sync
```

Decide up front whether the app source lives flat at this repo's root (`src/`, `App.tsx` at top level) or stays nested as `packages/mobile-app/` inside this repo too — pick one and keep it consistent, since `AGENT.md` and `TEST.md` acceptance commands assume workspace paths like `@evoting/mobile-app` and `@evoting/core-api`. Update those two files if you change the layout.

## Re-syncing later

If `evoting-simulation` changes something in these paths after this split, repeat the sparse-checkout pull and diff before overwriting — don't blindly `cp -r` over local changes made in this repo.
