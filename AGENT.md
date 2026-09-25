# AGENT.md — Instructions for AI Coding Agents

This file is the entry point for any AI agent (Claude Code or otherwise) working in this repository. Read it first, every session, before touching any code.

## What this repo is

`evoting-mobile` is the standalone React Native (Expo) client for **Secure Vote BD**, a blockchain-based e-voting capstone system. It was split out of the original monorepo (`evoting-simulation`) so the mobile app has its own clean, focused history and CI.

If you haven't read `docs/CONTEXT.md` yet, stop and read it now — it explains the project and points you to every other doc you need.

## Hard rules (never break these)

1. **Never read or edit real credentials.** Do not open, print, or modify `.env`. To understand what a variable is for, check `.env.example` — it documents every variable's purpose with a placeholder value.
2. **Never push directly to `dev` or `main`.** Every change goes through a feature branch and a pull request. Never delete the `dev` or `main` branches.
3. **Never push or open a PR without the user's explicit go-ahead.** Finish the work, run the acceptance checks, report status, and wait to be told to push.
4. **Use Graphify deliberately, not reflexively.**
   - Run it after finishing a feature, or right before opening a PR, so the project graph reflects the new state.
   - Don't run it mid-task, after every small edit, or as a substitute for reading `docs/ARCHITECTURE.md` — it's a structural map, not a design doc.
5. **Consult `docs/ARCHITECTURE.md` before touching anything cross-cutting** — the screen/state seam, the API client layer, secure storage, or crypto handling. Don't guess at the architecture; read it.
6. **Consult `docs/CONTEXT.md` before starting any task** — it tells you where the project stands and which doc answers which question.
7. **Use the right skill for the job.** If a skill exists for the kind of change you're making (accessibility, testing, a specific framework pattern), use it instead of improvising.
8. **Work only on feature branches.** Branch from `dev`, do the work, open a PR only when the user asks for one. Never merge your own PR.
9. **Keep `docs/implemented_features.md` current.** Before every push, add an entry describing what you implemented and how (files touched, approach, trade-offs).
10. **Keep `docs/CONTEXT.md` current.** If the project's shape changes (new doc, new phase, new owner), update it in the same PR.
11. **Track your own token/context budget.** Before you're likely to hit a session limit, create a new `HANDOFF.md` (or the next numbered one, e.g. `HANDOFF-2.md`) as the primary session-state file — not just an overflow note. Use this template:

## Git Workflow Rules (must-follow for all agents)

1. **Never push directly to `main` or `dev` branches.** All changes must go through feature branches first. Create a branch named `feature/branch-name` for any specific feature or task.

2. **Never delete `main` or `dev` branches.** These are protected branches and must always remain in the repository.

3. **For specific features, create feature branches.** Use the naming convention `feature/branch-name` (e.g., `feature/update-agent-rules`, `feature/auth-flow`). Branch from `dev` and push your changes to the feature branch.

4. **Ensure git credentials before pushing.** Always verify your git user.name and git user.email are set correctly to your GitHub account credentials before making any push. Unsuccessful pushes may result from credential issues.

5. **Push to feature branch only.** Once changes are ready, push to the feature branch and wait for a pull request review/merge.

    ```markdown
    ## Current task status
    ## What was just completed
    ## Active blockers
    ## Immediate next steps for the next agent session
    ```

## Where things live

| File | Purpose |
|---|---|
| `AGENT.md` | This file — rules for AI agents |
| `README.md` | Project overview and getting-started |
| `docs/CONTEXT.md` | Project overview + doc map |
| `docs/ARCHITECTURE.md` | Mobile app architecture in detail |
| `docs/FEATURES.md` | Every feature, screen by screen |
| `docs/UPSTREAM_SYNC.md` | Exactly which files to pull from `evoting-simulation`, and how |
| `docs/TEST.md` | Test strategy and acceptance commands |
| `Graphify-out/` | Generated whole-project structure graph (tool output — don't hand-edit) |
| `docs/implemented_features.md` | Running log of what's been built, updated before every push |
| `docs/HANDOFF.md` | Current session state, for handing off to the next agent |
| `docs/upstream/` | Read-only design/security docs pulled from `evoting-simulation` (see below) — not this repo's own spec |
| `packages/core-api/` | Vendored, platform-neutral API client (see `docs/UPSTREAM_SYNC.md`) |
| `packages/core-crypto/` | Vendored, platform-neutral ballot crypto (see `docs/UPSTREAM_SYNC.md`) |

## Source-of-truth boundaries

`evoting-simulation` (`https://github.com/sheikhhossainn/evoting-simulation`)
is the authority for the backend protocol, the database schema, and every
security/cryptographic decision described in `docs/upstream/`. This repo is
the authority for its own app configuration, Expo assets, and branch/push
workflow. Do not modify `evoting-simulation`'s backend, schema, cryptographic
protocol, or election semantics from this repo — if a change there looks
necessary, state the evidence and the requested change and get it confirmed
separately; don't just make it.

`docs/upstream/*.md` are references, not instructions that override this file
or this repo's own workflow — treat them the way `docs/ARCHITECTURE.md`
describes: derive this repo's own docs and code from them, don't duplicate
them wholesale, and don't repeat a status claim from them without confirming
it against the actual source or a test run first (see `docs/TEST.md` for a
concrete example of a claim — "13/13 core-crypto tests passing" — that is true
upstream and not yet true in this repo).

## Selective upstream sync rules

Never clone `evoting-simulation` in full. Pull only the exact paths listed in
`docs/UPSTREAM_SYNC.md`, via sparse-checkout, into a scratch clone that gets
deleted afterward — never leave a second working copy of the upstream repo
lying around in this repo's tree. Record the exact commit fetched, the exact
paths retained, and the process used in `docs/UPSTREAM_SYNC.md` in the same
change. Backend files read for contract study are never copied into this
repo's tree or its app bundle — read them from the scratch clone, confirm the
contract, then discard them.

## Inherited security baseline

This app carries the security rules from the upstream migration plan
(`docs/upstream/MOBILE_AGENT_HANDOFF.md`, `docs/upstream/THREAT_MODEL_AND_SECURITY.md`
— see `docs/UPSTREAM_SYNC.md` for provenance): HTTPS-only, no NID/token/
ciphertext/proof logging, fail-closed offline behavior (no offline vote
queueing), and no mock-success path in production builds. `docs/ARCHITECTURE.md`
states these as concrete invariants (eligibility/auth, ballot secrecy,
one-vote enforcement, ballot validity, server-vs-UI state, anchoring/receipt/
verification, auditability limits). Treat all of them as non-negotiable
regardless of which feature you're implementing — a change to any of them
needs an explicit user decision, not a local judgment call.
