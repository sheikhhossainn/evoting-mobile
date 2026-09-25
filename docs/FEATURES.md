# Features — evoting-mobile

Each feature below maps to one part of the voter journey. "Done" means every listed state is implemented, not just the happy path.

## 1. Election Hub
Landing screen after login — shows active/upcoming elections the voter is eligible for.
- States: loading, empty (no elections), error + retry

## 2. Authenticate
Voter identity verification and session creation.
- States: loading, validation error, API error, election-closed, already-voted (route straight to Watchdog/Receipt when applicable)

## 3. Voter Status
Shows the voter's current standing for the selected election (eligible / already voted / not yet open).
- States: loading, error + retry

## 4. Ballot
Candidate/choice selection screen.
- States: loading, empty (no candidates loaded), validation error (no selection made)

## 5. Cast-or-Audit
The audit-or-cast decision point — a voter can audit their encrypted ballot (verify it encodes their real choice, then get a fresh ballot to actually cast) or cast directly.
- Requirement: after an audit, a **fresh** encryption is generated before casting — the audited ballot is never reused.

## 6. Confirm
Final confirmation before submission.
- States: loading (submitting), API error + retry, election-closed-mid-flow

## 7. Receipt
Shown only after a real, successful server response — never optimistically.
- Must contain the real `vote_id` returned by the server.

## 8. Verify
Lets the voter independently verify their vote was recorded and untampered.
- States: loading, mismatch/tamper-detected (must be clearly voter-visible, never a silent failure)

## 9. Watchdog
Ongoing status/monitoring view for the voter's cast vote.

## 10. Results
Public results view once an election closes.
- States: loading, not-yet-available, error + retry

## 11. Settings
Session management: sign-out (clears secure session), device management.
- Requirement: clearing app data must force a new device ID and require re-authentication.

## Cross-cutting features (apply to every screen above)

- **Session lifecycle** — refresh, revoke, revoke-all, centralized handling of expiry/revocation/device-mismatch.
- **Offline fail-closed** — no mutating action shows success without a real server confirmation.
- **Accessibility** — accessible names/state, announced changes, 44×44 targets, font scaling, non-color-only states.
- **No sensitive logging** — NID, tokens, ciphertext, proofs, and raw payloads are never logged, in any build.
