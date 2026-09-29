# Advisor schema foundation — 2026-09-25

**Local foundation verified; production release remains blocked.** No live migration, billing integration, entitlement grant, deployment, or customer-data change was made.

## Changes

- `supabase/migrations/20260925202332_advisor_access_and_usage.sql`, created with the Supabase migration CLI.
- `qa/advisor-schema/test.mjs`, pinned PGlite dependency and lockfile; `npm ci && node test.mjs` from that directory.
- Five RLS-enabled tables: `advisor_entitlements`, `advisor_conversations`, `advisor_requests`, `advisor_messages`, `advisor_feedback`.
- Composite run/organization and request/conversation keys prevent accidental cross-scope persistence. Existing scores, findings, evidence, membership policies, and last-owner protection are unchanged.

## Server contract

The application MUST authenticate the actual bearer token with `auth.getUser()` and pass that returned user ID, never a user ID supplied in a request body. RPCs run with `SECURITY INVOKER`, an empty search path, and service-role-only EXECUTE grants. They are not browser RPCs. Supabase's service role must retain read permission on `auth.users`, organization membership, screening runs and reports; the local harness models those existing grants explicitly.

`advisor_begin_request(p_user_id uuid, p_run_id uuid, p_request_id uuid, p_question text, p_tier smallint, p_token_budget integer, p_conversation_id uuid = null)` returns `{request_id, conversation_id, status, replayed}`. Check `replayed`: never regenerate on an existing reservation; return the stored final answer if complete, otherwise return pending/failed status. Use a stable request UUID for retries.

`advisor_finish_request(p_user_id, p_request_id, p_answer, p_citations jsonb, p_verification jsonb, p_input_tokens int, p_output_tokens int, p_cost_usd numeric, p_generator_model text = null, p_verifier_model text = null)` returns the assistant message UUID. Finish retries are idempotent. Every begin (including replay) and finish rechecks user existence/deletion/ban, active membership, complete report, and time-valid active paid entitlement. Revocation during generation blocks persistence/delivery through this RPC. The server must finish successfully before returning generated content.

`advisor_record_feedback(p_user_id, p_message_id, p_helpful)` accepts only the caller's assistant messages and checks entitlement again.

Reserved budget covers combined generator + verifier input/output tokens, including provider reasoning-token usage where billed. Maximum 24,000 tokens per request; tier 0 requires zero. Atomic advisory locks serialize user/run reservations. Caps: six requests/minute/user, 100/rolling-day/user, 250/rolling-day/run, 240,000 tokens/rolling-day/user, 600,000 tokens/rolling-day/run. Failed/abandoned reservations remain charged in that window. Errors do not permit retry-based budget resets. Failed reservations can be marked failed by the trusted server; no client write path exists.

## RLS and privacy

- Customers can read their own conversations/messages/feedback only while currently an active organization member. Other members of the same organization do not gain access to another user's conversations.
- Organization members can read entitlement status, start/expiry and IDs. Payment references, event IDs and payment verification details are not granted to browsers.
- No customer writes, deletes, entitlement grants, or request telemetry access are granted.
- Verification top-level keys are allowlisted: `status`, `verifierVersion`, `claims`, `sourceIds`, `missingData`, `contradictions`, `independent`, `rubricVersion`, `promptVersion`. No reasoning/trace field exists. JSON sizes and message lengths are bounded.
- The server remains responsible for serializing only compact claim/evidence mappings within nested JSON; never pass raw model/provider output or chain-of-thought to persistence. Database allowlisting is defense in depth, not a semantic detector of private reasoning.
- Tiers 2/3 require `independent: true`, a verifier model identifier, and status `verified`, `qualified`, or `insufficient`. This records the pipeline's result; it does not prove verification happened. Independent evaluation must exercise the actual provider integration.
- Citation identity, references, and evidence support must be validated by the retrieval/verification pipeline before persistence. This migration does not certify arbitrary JSON citations or alter canonical screening evidence.

## Payment provenance

No entitlement is seeded. Trusted webhook code must verify provider signature and payment state before insertion. Each grant requires nonempty provider/reference/event IDs and verification timestamp; `(payment_provider, payment_event_id)` is unique. Default status is pending. Active access requires the matching run and organization, valid start/expiry, nonfuture payment verification, and no revocation. No URL flag, local storage, user metadata, or legacy Roadmap payment flag can write these records. Refund/chargeback/subscription expiration handling is a billing release dependency. Database fields attest to trusted server work; they cannot independently verify a provider event.

## Verification

24 local PGlite assertions passed, covering RLS, client/anon RPC denial, forged entitlement denial, cross-organization access, run switching, composite entitlement scope, idempotent request and finish retries, changed-payload replay rejection, expiry/future/revocation, suspended membership, payment-reference privacy, independent verification gate, forbidden top-level reasoning metadata, token cap, rolling rate cap, owner-bound feedback, and unchanged canonical score.

The fixture includes a second active owner before suspending the tested member, preserving the existing last-owner safeguard. PGlite executes the base schema plus relevant existing auth-hardening migrations and the new migration. Only unavailable pgcrypto extension creation is omitted; UUID generation uses PostgreSQL's builtin. Auth users/UID settings are local fixtures. No production user session is simulated or claimed verified.

Supabase changelog and current RLS documentation were checked. The 2026-09-25 Postgres minor-release notice concerns legacy pgcrypto ciphers, ltree/btree_gist indexes and custom estimators; this migration introduces none of those.

## Release blockers and remaining checks

1. Independent review and full PostgreSQL concurrent-session lock/budget tests; PGlite is single-session and cannot prove concurrent behavior.
2. Apply through the controlled release process only after staging tests and Supabase security/performance advisors. No live advisor finding is claimed resolved.
3. Complete server JWT verification, retrieval/citation validation, provider generation/independent verification, and safe response delivery integration.
4. Implement verified production payment webhooks with lifecycle revocation. No payment means locked Advisor.
5. Link eligible reports to canonical Supabase organization/run/report records without guessing legacy ownership or payment status.
6. Live Auth session revocation, four-sector end-to-end flows, browser UX and provider-secret checks remain unverified here.

**Verdict: PASS for the 24 local schema assertions; FAIL for production Advisor release.**
