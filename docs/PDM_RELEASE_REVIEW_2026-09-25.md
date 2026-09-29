# Independent release review — September 25 campaign

Reviewed September 26, 2026 using Autonomous Dev Suite's PDM Diagnostic Commander in Repair + Release-Gate mode. Reviewer did not author the material Site or Advisor core changes. No deployment, production mutation, or report deletion was performed by this reviewer.

**Verdict: FAIL — production release remains blocked.** Local repairs and deterministic checks pass, but the requested live report-access/deletion outcomes and production Advisor have not been established.

## Independently verified

Command, from the repository root:

```sh
node --test qa/admin-access.test.mjs qa/advisor/core.test.mjs
```

Result: **35 tests passed, zero failed** (14 admin request/auth/listing tests; 21 Advisor core tests). Admin tests transpile the adjacent canonical `pdm-site` checkout and substitute explicit test dependencies; they do not exercise a live Supabase session or backend. Core tests use deterministic provider callbacks.

| Surface | Evidence and conclusion |
| --- | --- |
| Request transport | Session restoration is awaited; DELETE method/body/headers survive; refreshed tokens replace old sessions; outside origins receive no automatically attached token. Explicit invalid bearer identity never falls back to the ChatGPT owner. |
| Admin authorization | Fresh confirmed Supabase email and valid user UUID are required. Unconfirmed/malformed identities fail before database access. Nonowners receive denial. This verifies the implemented email-based owner boundary, not production organization membership. |
| Report history | Admin endpoint retains 15 fixture reports and empty businesses. Independent source failures preserve available organization/business records. This is query/result logic coverage, not evidence that all live records are reachable. |
| Advisor retrieval | Tenant/run filters and persisted identity status exclude rejected, ambiguous, and wrong-organization sources. Exact score/leak answers bypass providers; decimal calculations and sector policies pass. |
| Advisor citations | Independently added stress tests show ranked findings retain all source dependencies within 8/16/24-item limits. Oversized bundles are omitted intact. A finding citation returns its underlying source URL even if the claim does not cite that source directly. |
| Verification | Unsupported, contradictory, malformed, or uncited claims fail closed. Provider callbacks cannot mutate authoritative context; result projection excludes arbitrary reasoning fields. |

The reviewer identified two local gaps that the implementation owner repaired: accepting an unconfirmed email as an owner identity, and truncating or omitting a finding's supporting source references. Independent regression tests now cover both. The unconfirmed-email finding was a trust-boundary weakness; no live account takeover was demonstrated.

## Release blockers and limits

| Severity | Finding | Required evidence to close |
| --- | --- | --- |
| P1 | Current business and organization backend Sites are inaccessible in this session; connector access reports `Sites project not found`. No conclusion is drawn that stored data was deleted. Canonical listing and DELETE depend on these services and their signing configuration. | Restore authorized access to both report stores; validate deployed routes/configuration, then open all report histories through the actual owner session. |
| P1 | Live owner deletion has not been tested. Code inspection of the available **stale** business backend shows its owner resolver accepts the signed gateway actor, but this does not prove the currently deployed backend does so. | Delete a disposable authorized fixture through the dashboard, confirm persistence and history/count updates; verify unsigned and nonowner denial. Do not delete customer reports for testing. |
| P1 | Browser work available to the campaign used a signed-out managed preview. The reviewer has not independently exercised authenticated browser login, report tabs, deletion, session refresh, or cross-account switching. | Run the complete owner flow with a real authorized test session and a separate nonowner session. |
| P1 | Advisor core is an unreleased foundation. It does not itself authenticate, authorize organization/report access, grant paid entitlement, perform live retrieval, configure providers, or expose production chat. | Complete and independently verify the Supabase adapter, current model routing, server entitlement/payment boundary, request budgets, AI Elements integration, and all required release tests. Keep locked until then. |
| P1 | Legacy Site report ownership remains email-based; the new canonical Supabase organization/member/report integration has not been established by these tests. | Two-user organization isolation and swapped-report tests against the actual runtime, including access to authorized historical reports. |

The LifePoint core fixture verifies exclusion using **already-decided identity statuses**. It does not test the deployed identity resolver or full screening/scoring pipeline. Prompt-injection tests verify data/policy separation and verifier rejection with mocked providers; they do not prove resistance of the selected real models. These broader gates remain **NOT RUN** in this independent review.

## Additional findings

- Report CSS explicitly replaces legacy pale yellow/white text on light cards, including Category Leader Pattern content. The shared sample now exercises the actual report component. This reviewer inspected code, but did not independently measure browser contrast, mobile overflow, keyboard flow, or 3D rendering; campaign browser evidence must be reported separately. No accessibility or performance pass is inferred from CSS alone.
- The stale business backend deletes a screening and recalculates business aggregates in separate operations. Concurrent requests could produce stale counts/ranges. This is a code-review risk, not a reproduced production failure; inspect the deployed backend and add transaction/concurrency coverage when access is restored.
- The core's numeric grounding guard requires quantities to occur in cited evidence. Proposed durations or budget allocations can therefore be rejected even when clearly labeled recommendations. A production adapter should supply explicit user constraints and deterministic scenario calculations; do not relax factual grounding merely to pass a planning example.
- Live Supabase RLS, real entitlement expiration/revocation, AI credentials/model availability, payment webhooks, browser console, mobile accessibility, performance, and end-to-end cross-tenant isolation were not tested by this reviewer. Separate schema tests or the commander's build/browser results should not be represented as part of these 35 checks.

Next highest-impact action: restore authorized access to the two existing report backends and verify the owner open/delete flow before any production release. Preserve the tested local repairs as reviewable unpublished work while those release blockers remain.
