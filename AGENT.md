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

## Inherited security baseline

This app still carries the security rules from the original migration plan (`MOBILE_AGENT_HANDOFF.md`, vendored under `docs/upstream/` per `docs/UPSTREAM_SYNC.md`): HTTPS-only, no NID/token/ciphertext/proof logging, fail-closed offline behavior, and no mock-success path in production builds. Treat these as non-negotiable regardless of which feature you're implementing.
