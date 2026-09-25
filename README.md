# evoting-mobile

React Native (Expo) client for **Secure Vote BD**, a blockchain-based e-voting capstone system.

AI agents: read [AGENT.md](AGENT.md) first, then [docs/CONTEXT.md](docs/CONTEXT.md).

## Structure

```
packages/mobile-app/   Expo app (TypeScript)
packages/core-api/     API client + contracts (vendored, see docs/UPSTREAM_SYNC.md)
packages/core-crypto/  Ballot encryption / proof generation (vendored, see docs/UPSTREAM_SYNC.md)
docs/                  Architecture, features, test strategy, handoff, sync notes
Graphify-out/          Generated codebase graph (tool output, don't hand-edit)
```

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
