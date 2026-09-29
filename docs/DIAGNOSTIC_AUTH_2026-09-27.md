# PDM admin, report access, and data-boundary diagnostic — 2026-09-27

**Verdict: FAIL for production release. Audit only; no application, database, entitlement, or customer-data mutation was performed.** This is an implementation handoff for Sol. Autonomous Dev Suite diagnostic commander and Ponytail were applied: fix the shared data boundary, preserve records, and avoid rebuilding the website to conceal an unavailable backend.

## Evidence and limits

- Canonical source inspected: adjacent `pdm-site`, saved version 35. Working tree was clean at inspection.
- Legacy business source inspected: adjacent `pdm-business-backend`, commit `c28b4f3a85f149e791fdb531a83cc7b8246fc35a`. **This checkout is stale; findings in it are not proof of currently deployed backend behavior.**
- Read `AGENTS.md`, `SUPABASE_AUTH_AND_DATA.md`, `SITE_SUPABASE_INTEGRATION_CONTRACT.md`, `SWEEPING_UPDATE_STATUS.md`, and the Advisor schema server contract.
- Ran `node --test qa/admin-access.test.mjs` from `pdm-repo`: **14 passed, 0 failed**. These execute actual Site modules against controlled dependencies; they do not delete a real report or establish live backend availability.
- Locally executed two targeted security reproductions using actual stale backend modules and synthetic secrets/actors. No live endpoint, credential, or customer row was used.
- Earlier production evidence in this task: report-store projects inaccessible to the Sites connector and authenticated reports request returning 502. Those observations explain why production proof is absent. They do **not** establish deleted data, mismatched secrets, broken Supabase permissions, or any other specific root cause. Fresh live status belongs in the commander's current evidence ledger.

## Findings Sol should implement in order

| ID | Severity / certainty | Evidence | Smallest coherent fix and acceptance |
| --- | --- | --- | --- |
| AUTH-01 | P1, production dependency unresolved | `pdm-site/lib/portal-service.ts:6–9,35–41` still requires two old Sites origins and two signing secrets. `lib/portal-db.ts:6–8` sends every read to their `/api/pdm-read`. The new admin endpoint also uses this bridge. Replacing dashboard UI cannot make inaccessible stores respond. | Restore authorized access to the existing stores and confirm binding/schema/secret **presence without printing values**. If a host must be replaced, restore a verified export into the replacement first. See recovery sequence below. Gate on real owner listing/opening/deleting a disposable fixture across both stores. |
| AUTH-02 | P1, current code proven | `modules/organization/app/page.tsx:1838–1909` fetches a saved record, restores intake, then calls `runAnalysis`. `1565–1614` and `1621–1691` perform fresh website/geography/social/public-evidence work. `1599–1602` marks the old ID already saved, so the automatic save effect does not overwrite it; nevertheless the displayed result can differ from the stored report and depend on external services. `1575–1577` returns early when saved channel timings are incomplete, after the caller has set the analyzing view. | Implement an explicit stored-report render path using `currentScore`, `categoryScoresJson`, `publicEvidenceJson`, stored inputs, and original timestamp. Missing legacy fields must display “not recorded.” Only an explicit rerun may call analysis and create a new report ID. Gate: reopen original with every research endpoint deliberately failing; original stored score/evidence remains visible, no analysis POST occurs, no writes occur, and incomplete old records never stay stuck loading. |
| AUTH-03 | P1, current code proven; runtime account-switch regression not run | `components/SupabaseAccountHub.tsx:22–40` changes `user` without clearing `reports` or `reportError`. Previously loaded A reports remain while B loads and indefinitely if B's request fails. `SupabaseBusinessReport.tsx:14–30` only depends on report ID. `SupabaseOwnerGate.tsx:14–25` checks once and never responds to auth changes. Dashboard `AdminDashboard.tsx:35–40` preserves prior reports after failed refresh. | Key protected report/admin state to the verified principal. Clear sensitive state immediately on signout/principal change, cancel obsolete requests, then check `/api/session` again. Retain stale records only for a retry by the **same** actor. The server must continue validating every read/delete. Gate: load owner data, switch to ordinary account in another tab, fail/delay new fetch; no owner report content survives under new identity and old async results cannot repopulate it. This is stale client data disclosure, not a demonstrated server access-control bypass. |
| AUTH-04 | P1, stale code locally reproduced; production reachability unknown | Stale `app/chatgpt-auth.ts:23–27` calls header-only `verifyGateway`, not `verifyGatewayRequest`; `lib/admin-auth.ts` feeds this into deletion and other admin handlers. A synthetic valid GET `/api/admin/crm` envelope remained accepted by header-only verification when attached to DELETE `/api/admin/businesses/5?mode=all`; request-bound verification rejected it. | Any backend API accepting gateway identities must verify method, full path/query, body digest, audience, expiry, and signature **against that Request** before owner checks. Pass an authenticated actor from one request-bound guard. Keep native Sites identity trusted only through its documented server integration. Test changed method/path/query/body, expired signature, wrong audience, unsigned owner-email headers, ordinary actor, and a legitimate owner deletion. Do not infer that callers currently possess signed envelopes; no browser exploit was demonstrated. |
| AUTH-05 | P1, stale code locally reproduced; public exploitability not established | Stale `app/api/pdm-read/route.ts:8,12–16` permits every signed actor, then uses regex as a SQL/table policy. Synthetic signed nonowner query `select s.id, private.encrypted_refresh_token from screenings s, crm_gmail_connections private` passed validation and reached a stub DB with status 200. Regex collects only `from/join` tables, missing the comma table. Canonical `lib/portal-routes.json` does **not** expose `/api/pdm-read` to the browser. | Replace arbitrary SQL with a small action contract (`listReports`, `getReport`, and admin-only listing), fixed prepared queries, and authorization within the storage service. Do not write a SQL parser. Select only required columns and apply record ownership/membership in the query. Until replaced, never expose this endpoint or treat its regex as a security boundary. Gate on rejection of arbitrary SQL/actions, nonowner list-all, cross-owner IDs, plus preserved owner full history. |
| AUTH-06 | P1 for reliable deletion, stale transaction defect / current UI limitation | Stale `app/api/admin/businesses/[id]/route.ts:10–17` resolves “latest” at deletion time and separately reads survivors, deletes report, and updates aggregates without a transaction. Current `AdminDashboard.tsx:54,83` submits business ID + latest/all; older business history entries have no exact-report delete. A concurrent rerun can change which report is “latest,” or cause stale aggregates; no concurrency test has been run. | Add deletion by the stable selected report ID, validate it belongs to the selected business, and delete/update aggregates atomically using the storage platform's transaction/batch semantics. Confirm exact report name/date in UI. Keep whole-business deletion an explicit separate action. Audit actor, report ID, and result without report secrets. Gate: delete selected older fixture, other history remains; repeat is deterministic; concurrent rerun/deletion preserves accurate count/current/min/max; unauthenticated/member DELETE changes zero rows. |
| AUTH-07 | P2, current code proven | `app/api/account-data/route.ts:20–29` has no controlled catch around single-report storage reads; a backend failure can return framework HTML/500. `SupabaseBusinessReport.tsx:21` unconditionally parses JSON. Organization reopen `page.tsx:1840` maps every non-403 response, including 503, to “not found.” | Normalize unavailable/auth/absent responses (503/401/403/404) with safe JSON and private no-store headers. Show a retry for service outages, sign-in for 401, and an actual absent-record state for 404. Gate on each response class without leaking backend errors. |
| AUTH-08 | P1 for production account recovery, current code absence | `SupabaseLogin.tsx` implements sign-in/sign-up only. Search across Site components/lib found no `resetPasswordForEmail`, recovery-event handler, or password-update UI. Required reset path is in the integration contract. | Use the existing Supabase client to add a reset request and a guarded recovery callback/password-update form. Configure allowed origin/redirect and production mail delivery. Gate with a real disposable email account: reset email reaches inbox, token expires/replay rejected as provided by Auth, new password works, old password fails. Never reset the owner's credentials for testing. |

## What version 35 already improves

Keep these tested fixes; they do not need a rewrite:

- `pdm-fetch.ts` restores current Supabase bearer per same-origin API request and preserves DELETE headers/body. No implicit token is added to external origins.
- `portal-service.ts:10–32` validates the bearer against Supabase, requires a UUID and confirmed email, normalizes email, and does not fall back to another identity when an explicit bearer is invalid.
- `/api/session` and `/api/admin/reports` use the same actor resolver. Owner/member/unsigned cases pass controlled tests.
- `/api/admin/reports` uses left-joined full business history and independent organization/meeting availability; one source's outage does not erase another source's rows.
- The admin view lists business history and distinguishes unavailable records from an empty database.

These 14 checks do **not** cover real backend DELETE, transaction consistency, mounted React account switching, organization snapshot reopening, or live cross-tenant isolation.

## Recovery and replacement sequence

1. Establish the current owner/workspace and locate the existing two backend projects through supported project access. Record their active source SHA, D1 database bindings, and schema migration state. Compare configured upstream origin and secret names with each backend's expected audience/key. Check status and sanitized error classes only. A 502 can represent an upstream HTML error; it does not identify the cause.
2. If the projects are recoverable, create an authorized export/backup and verify record counts before changing runtime code. Recover access and patch the boundary in place. Preserve original IDs and links.
3. If a host is permanently unavailable, locate an existing export/backup before provisioning a replacement. A new empty store will not recover reports. If no export is available, mark report recovery blocked; never seed made-up copies, assign guessed owners, or declare zero reports a successful migration.
4. Prefer the already-provisioned Supabase architecture for a deliberate data consolidation. Import legacy snapshots into a separate compatibility table or explicitly versioned records with original IDs, source, timestamps, original JSON, and checksum. Preserve a legacy-ID mapping. Do **not** call the old five-category/legacy total a canonical `visibility-v1` 70/30 screening or synthesize its required 13 findings.
5. Map legacy owner emails to verified Supabase user IDs through a controlled administrative reconciliation. Null/ambiguous ownership stays quarantined for owner review; it must not become public. Use organization membership/RLS for ordinary customers. Add a server-managed platform-admin role keyed to the verified owner's immutable UUID if all-organization admin access is needed; organization-admin membership is not equivalent to platform administration. Never use user metadata, localStorage, or URL flags as the role source.
6. Reconcile source/export/target counts and ID checksums, then test historical links and independent read/delete behavior. Only switch production reads after restore and rollback have been verified. Retain original backup until the agreed retention window; do not delete customer storage as “cleanup.”

## Advisor dependency contract for Sol

The local migration `20260925202332_advisor_access_and_usage.sql` and `docs/ADVISOR_SCHEMA_STATUS.md` provide a useful foundation; they are not live Advisor integration.

Implement the server route in this order:

1. Validate the actual Supabase bearer and obtain its user UUID. `getRequestActor` may return a Sites email-only identity; that fallback cannot be passed as a Supabase Advisor member. Require a verified Supabase principal for paid Advisor use.
2. Resolve the requested report ID to exactly one organization/run. Check active membership, completed immutable report, and the paid run-bound entitlement. No legacy `roadmapPaidAt`, owner email, report access flag, or owner UI privilege should silently create an Advisor entitlement.
3. Classify tier and reserve the request with service-only `advisor_begin_request`. Request IDs are stable across retries; replay must not trigger a second model invocation or charge.
4. Retrieve bounded structured context under the resolved run/organization: exact canonical scores, confirmed included evidence, sources with usable URLs, relevant findings, and explicitly authorized history. Keep legacy data marked as legacy and ineligible until evidence/score requirements are satisfied.
5. Run deterministic tier 0 or the configured model/verification pipeline. Serialize only approved compact claim/evidence metadata, never raw provider traces.
6. Call `advisor_finish_request` and await successful fresh membership/entitlement checks before returning the answer. Handle mid-generation revocation without response disclosure. Keep the elevated key server-side.

Do not implement a generic chatbot connected directly to old serialized reports simply to make the button appear. Do not create a second auth/role system or a replacement billing flag. The existing core and schema must meet the actual server/UI/provider boundary tests before unlocking.

## Runnable acceptance gate

Existing deterministic checks:

```bash
cd /workspace/scratch/bb7d03b0390c/pdm-repo
node --test qa/admin-access.test.mjs
node --test qa/advisor/core.test.mjs
cd qa/advisor-schema
npm ci
node test.mjs
```

Sol must add targeted executable cases, not static string checks, for the failing behaviors above. Use the existing Node module-injection harness for server/transport paths and browser/React tests for state transitions. Use a disposable staging DB for transactions and genuine authenticated owner/A/B accounts for the final access matrix.

| Flow | Required expected outcome |
| --- | --- |
| Owner lists histories | Every exported fixture visible, including older reports in both stores; counts reconcile. |
| Owner opens reports in new tab | Existing website session restores once; authorized records open without repeated login. |
| Member swaps report ID | 404/403, no other organization's body, no membership creation. |
| Signed-out opens private report | Sign-in return path preserved; no private report body. |
| Owner deletes one disposable old/new report | Exact ID removed after committed operation; unrelated reports and aggregate counts preserved. |
| Member/unsigned deletes | Denied; DB before/after identical. |
| Backend unavailable | Explicit retryable unavailable state; never “zero records,” fake deletion success, or “report not found.” |
| Account A → B / owner signout | Old sensitive component state cleared; pending A responses cannot reappear. |
| Open old organization snapshot | No live analysis, same stored score/evidence/date, missing old fields disclosed. |
| Raw read / signed replay | Unknown query/action, actor, method/path/body changes rejected before DB execution. |
| Advisor access | Forged/revoked/expired/wrong-run entitlement denied; generation revoked midflight yields no answer. |

Independent verifier must rerun these against the implementation and the actual deployed preview/staging artifact. Production release remains blocked until the restored stores and real owner read/delete flows pass. “Start from scratch” is appropriate for the unsafe raw SQL bridge, not for erasing inaccessible customer reports.
