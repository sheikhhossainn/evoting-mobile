# evoting-mobile

React Native (Expo) client for **Secure Vote BD**, a blockchain-based e-voting capstone system.

AI agents: read [AGENT.md](AGENT.md) first, then [docs/CONTEXT.md](docs/CONTEXT.md).

## Structure

```
packages/mobile-app/   Expo app (TypeScript). App.tsx is upstream's real
                        implementation (vendored verbatim) — one file, the
                        full voter journey as a state machine, not yet split
                        behind the screen/state seam docs/ARCHITECTURE.md
                        targets. See docs/HANDOFF.md.
packages/core-api/     API client + contracts (vendored from evoting-simulation,
                        see docs/UPSTREAM_SYNC.md). 7/7 tests pass standalone.
packages/core-crypto/  Ballot encryption / proof generation (vendored, see
                        docs/UPSTREAM_SYNC.md). 13/13 tests pass, incl. parity
                        against a vendored, frozen copy of the backend
                        verifier under test-fixtures/ — see docs/TEST.md.
docs/                  Architecture, features, test strategy, handoff, sync notes
docs/upstream/         Read-only design/security docs pulled from evoting-simulation
                        (not this repo's own spec — see the note in docs/ARCHITECTURE.md)
Graphify-out/          Generated codebase graph (tool output, don't hand-edit)
```

All local acceptance gates are currently green (typecheck × 3 packages,
`core-api`/`core-crypto` test suites, `expo export --platform android`) — see
`docs/TEST.md` for the exact commands and caveats.

This is a tamper-**evident**, independently verifiable voter client — not a
tamper-proof one. See `docs/ARCHITECTURE.md` for what the app itself verifies
versus what it only displays from the server.

## Getting started

```bash
npm install
npm start --workspace=@evoting/mobile-app
```

Or, from `packages/mobile-app`:

```bash
npm run android   # Android
npm run ios       # iOS (macOS only)
npm run web       # Web
```

## Docs

| Doc | Purpose |
|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | Project overview + doc map |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | App architecture |
| [docs/FEATURES.md](docs/FEATURES.md) | Every feature, screen by screen |
| [docs/TEST.md](docs/TEST.md) | Test strategy and acceptance commands |
| [docs/UPSTREAM_SYNC.md](docs/UPSTREAM_SYNC.md) | What to pull from `evoting-simulation` |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Current session state |
| [docs/implemented_features.md](docs/implemented_features.md) | Build log |

## License

See [LICENSE](LICENSE).
