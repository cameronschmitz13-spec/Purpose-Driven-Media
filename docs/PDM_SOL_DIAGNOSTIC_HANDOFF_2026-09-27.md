# PDM diagnostic and executable Sol handoff — September 27, 2026

**Release verdict: FAIL.** Diagnostic performed using Autonomous Dev Suite diagnostic commander and Ponytail. This pass changed documentation only. No application deployment, schema migration, customer deletion, payment, or email send occurred. The user requested an implementation handoff, not a new production release.

## Evidence ledger

| Surface | Observed state | Practical consequence |
| --- | --- | --- |
| Canonical Site | Live v34, source `485e6bd2552c672b94921bb6e34d6a75cd7beb9f`; saved, unpublished v35 source `010187143e57f990838274328a42519dd23c86b8` | Local improvements are not proof of a live fix. Do not publish v35 unchanged: new blockers below remain. |
| Site project | `appgprj_6a91991aec5881919b5beffad5e7b81f` | Reuse this project; do not create another public PDM site. |
| GitHub | `cameronschmitz13-spec/Purpose-Driven-Media`, draft PR #3, branch `codex/pdm-advisor-admin-release-gate-2026-09-25`; pre-diagnostic head `d4166fa4039a6fa6080f292a96b59222d876f4ec` | Advisor foundation and previous handoff are on this branch, not main. Website source lives in the separate Site checkout. |
| Legacy report stores | Business `appgprj_6a8c7116d96c81919a17545a68d61ebf` and organization `appgprj_6a89eca0ad508191b624bf6afb750745` returned project-not-found through the current Sites connection | Access/recovery is unresolved. This is not proof that customer records were deleted. Locate correct authorized workspace or backups. |
| Production errors already captured | Sep25 18:39 UTC: business admin businesses and CRM GET returned 502 with a masked Authorization header present | Moving login controls cannot repair an unavailable upstream. Request IDs: `7834e37a82861c4b32025612996eac27`, `f694213df93c4a92544cc89674007d67`. A 502 does not identify the precise backend fault. |
| Runtime configuration | Canonical Site environment revision 1 lists both portal signing secrets; values withheld | Secret presence is established, agreement with backend configuration is not. Do not rotate blindly or print secrets. |
| Supabase | Project `dylgugjawlfbmtqmmzqq`: 0 organizations, 0 runs, 0 reports, 0 Titan accounts, 0 Titan messages | It is not currently the recovered legacy report store or a connected mailbox. A new empty database is not a recovery. |
| Supabase schema | 12 public tables with RLS; 14 deployed migrations through `add_titan_reply_to`; no Advisor tables | Advisor migration in PR remains undeployed. Reconcile migration history before applying anything; do not replay all old migrations. |
| Supabase advisors | Leaked-password protection disabled; Titan tables have RLS without browser policies | Review password protection. Titan deny-by-default may be intentional service-only storage: do not grant browser access merely to remove a lint notice. |
| Edge functions | Four active screening functions; no Advisor endpoint. Finalizer has `verify_jwt=false`, but inspected source requires secret authentication | Do not label the flag alone an authentication bypass. Verify the actual secret-auth boundary in staging. |

The local legacy business checkout is stale at `c28b4f3a85f149e791fdb531a83cc7b8246fc35a`. Later status documents describe backend v49. Security reproductions against the old checkout are review targets, not demonstrated live exploits. Newest worker log sample was dominated by unrelated 404 probes; it does not supersede the captured 502 evidence or establish continuous downtime.

## Priority implementation sequence

Read `AGENTS.md`, the eight required Advisor/brand/scoring/auth/status documents, `prompts/11_PDM_360_ADVISOR_IMPLEMENTATION.md`, and the two detailed audits accompanying this handoff:

- [Admin, access, deletion and storage audit](DIAGNOSTIC_AUTH_2026-09-27.md)
- [Product, scoring, CRM and Titan audit](DIAGNOSTIC_PRODUCT_2026-09-27.md)

### 1. Recover the report stores before replacing their infrastructure — P1

Locate current authorized backend projects/source/bindings. Export records and verify counts/checksums before edits. Restore from a verified backup if replacement is necessary. Preserve IDs, timestamps, original JSON, rubric version, ownership, and a legacy-ID redirect map. Quarantine ambiguous ownership for controlled review. Never invent historical reports or relabel legacy five-by-20 results as canonical 70/30 results.

Prefer the existing Supabase architecture for deliberate consolidation. Ordinary access uses verified user UUID plus organization membership/RLS. Platform-wide owner access needs an explicit server-managed platform-admin grant, separate from an organization-admin role. Never authorize via editable metadata or a URL flag.

**Gate:** export/import counts and IDs reconcile; actual owner can list and reopen every retained fixture across business, nonprofit and ministry histories. An unavailable store shows a retryable outage, not zero reports.

### 2. Repair authentication and report identity — P1

Keep v35's fresh-token transport and shared server actor resolver. Fix `components/SupabaseLogin.tsx:18–19,56–58`: its server render defaults returnTo to `/account`, while the browser reads `/business/admin`. The browser reproduced a React hydration failure: `SECURE SCREENING ACCOUNT` versus `PDM ADMIN ACCESS`. Supply a validated route value consistently from the page/router to both renders; do not hide the warning with `suppressHydrationWarning`. Preserve safe return URLs and prevent open redirects.

Clear protected report/admin state immediately when the verified principal changes. Cancel stale requests so account A's delayed response cannot populate account B's screen. Add the missing password recovery flow through existing Supabase Auth.

**Gate:** hard-load, client navigation and back/forward through admin login produce no hydration errors; sign-in returns to the requested authorized report; signout/account switching clears all old report content even if the next request fails. Test owner, ordinary member, another organization and signed-out identities.

### 3. Render immutable saved reports and delete exactly the selected report — P1

`modules/organization/app/page.tsx` reopens a record by calling `runAnalysis`; replace that path with stored-snapshot rendering. Missing legacy fields remain explicitly unavailable. Only an explicit rerun researches again and creates a separate report. Show the selected run's score/categories/evidence consistently; never mix the highest historical score with current findings.

Replace business-ID-plus-`latest` deletion with stable report-ID deletion, server ownership/admin checks, and an atomic delete/aggregate update. Confirm the selected report name/date. Whole-business deletion stays a separate action. Normalize 401/403/404/503 JSON responses and private cache headers.

Retire the arbitrary-SQL bridge in favor of a few authorized actions and fixed prepared queries. On the current backend, verify request signatures against method, full path/query, body, audience and expiry. The stale checkout allowed a comma-join table-policy bypass and accepted a signed envelope on a different method/path in local synthetic reproductions; do not deploy those patterns.

**Gate:** saved reports reopen unchanged with research services offline; selected older report alone is deleted; concurrent rerun/delete preserves summaries; unauthorized requests change zero rows; arbitrary SQL and modified signed requests are rejected before database execution.

### 4. Finish shared screening UX and scoring — P1/P2

Preserve v35 contrast fixes, Category Leader Pattern, real sample renderer and 3-D map. Use the existing nonprofit interaction reference and shared report components. New canonical reports must use the Supabase 70/30 rubric; historical reports keep their legacy score and explicit rubric label. Add the missing General Organization intake/configuration rather than silently treating it as a church. Keep Critical Visibility Leaks separate from total-score arithmetic.

Condense admin into a searchable/filterable report list and selected detail view if a realistic 200-client/20-report fixture still requires excessive scrolling. Keep CRM secondary/collapsible. Fix outage-versus-empty states and business intake loss across login.

Preserve the approved free baseline → report-specific scope/quote journey and existing paid agreements. Align landing/report pricing copy; do not invent a growth-potential pricing equation.

**Gate:** all four sectors save/reopen accurately; category maxima come from rubric data; wrong-state LifePoint sources and ambiguous/rejected sources have zero scoring influence. Test desktop and 320/390/768px layouts, contrast, focus, keyboard operation and overflow. Exercise the map's center/radius/3-D controls plus WebGL/provider failure fallback.

### 5. Connect existing GAP and Titan implementations — P1 for requested integrations

Recover current business backend source before diagnosing GAP's redirect handling; the local stale checkout predates a documented fix. Verify existing approved-contact transfer, GAP readback and idempotency using disposable fixtures. Do not introduce another CRM or mark a contact transferred on a failed response.

Titan's direct IMAP/SMTP gateway exists in GitHub, but the Site still displays an obsolete MCP approval notice and has no Titan route. Deploy the existing gateway to a suitable persistent Node host, keep credentials server-side, and connect owner-authorized health/verify/sync/read/search routes. Preserve existing Gmail history. This diagnostic does not authorize a test email send.

**Gate:** GAP fixture appears once with correct fields and repeat push deduplicates; nonowner/restricted contacts denied. Titan verifies mailbox access, performs bounded read-only sync and repeat sync creates no duplicate messages. Secrets never reach browser output.

### 6. Complete paid Advisor integration after data/access gates — P1

Keep `advisor/core.ts` and the proposed entitlement/usage schema as foundations. They are not a deployed chatbot. Implement server authentication → membership → completed report access → active paid entitlement → budget reservation → bounded retrieval → deterministic/model answer → independent verification → fresh entitlement check/persistence → response.

Use OpenAI through Vercel AI Gateway, AI SDK and only needed AI Elements components. Inspect current provider/model availability at implementation time; do not hard-code a model from this report. Tier 0 uses exact data without a provider; tiers 1–3 use the smallest sufficient context/model and appropriately independent verification. No specialist framework is needed merely to answer a simple question.

Keep evidence types/provenance distinct. Return only verified claims with resolvable citations; no hidden reasoning traces. Bind history to authorized organization/run IDs. Add provider-adapter evaluations, strict metadata sanitization, cost telemetry and concurrent budget tests. Validate the proposed migration against actual deployed schema in staging before applying it.

Stripe verified webhook → server entitlement is still a release dependency. Square navigation, local flags and admin visibility are not paid Advisor entitlements. Until real billing/entitlements are ready, retain the truthful locked state and do not claim payment unlocks chat.

## Checks performed and what they prove

| Check | Result | Limit |
| --- | --- | --- |
| Site production build | PASS | Chunk-size warning above 500kB remains; not a measured performance regression. |
| Site tests | 15/15 PASS | Includes nine source-string report tests; no end-to-end guarantee. |
| Admin module tests | 14/14 PASS | Controlled dependencies; no live owner deletion or account-switch browser test. |
| Advisor core | 21/21 PASS | Synthetic callbacks; includes exact scores, four sector policies, wrong-state LifePoint, provenance, calculations and injected-source handling. No actual model tested. |
| Advisor schema | 24 assertions PASS | Local single-session PGlite; includes cross-tenant, forged/expired/revoked entitlement and budget denials. No live/concurrent PostgreSQL test. |
| Browser homepage → sample | PASS in v35 preview | Three screening choices visible; General Organization absent. |
| Business sample anchors | PASS | All hash targets exist; Category Leader click settles at its section. |
| Category Leader readability | Targeted PASS | Rendered 16px navy `rgb(23,51,84)` on white; does not certify every text element. |
| Desktop width | No horizontal page overflow observed | At 1363px viewport; mobile not tested. |
| Browser admin login | FAIL | Actual hydration mismatch reproduced and traced to returnTo initialization. |
| Advisor UI | Locked preview observed | No working paid chat, provider call or payment verification. |

Total: **74 local checks/assertions passed**, but required production behavior still fails or is unverified. Browser-extension console noise was excluded; the React login error belongs to the application. A broader automated contrast scan could not complete in this browser runtime; do not claim an axe or sitewide accessibility pass.

Reproduce existing checks in the appropriate checkouts:

```bash
# canonical Site checkout
npm run build
node --test tests/*.test.mjs
# Purpose-Driven-Media GitHub checkout
node --test qa/admin-access.test.mjs
node --test qa/advisor/core.test.mjs
node qa/advisor-schema/test.mjs
```

Not run: authenticated live owner/member journeys, real report deletion, live cross-tenant checks, current backend security reproductions, all-sector end-to-end screening, actual-model prompt-injection/verification evaluations, live LifePoint full pipeline regression, Stripe webhook/payment tests, GAP transfer readback, Titan credential/sync verification, mobile/GPU map interaction, full accessibility or performance/security scans. Report these honestly rather than treating mock or source-string tests as substitutes.

## Ponytail: what to replace, preserve, and avoid

- **Replace:** arbitrary SQL gateway with fixed authorized operations; implicit re-analysis on report viewing with a snapshot adapter; duplicated scoring for new canonical runs only after parity tests.
- **Preserve:** customer snapshots, stable URLs/IDs, original score versions, existing Supabase Auth, v35 fresh-token transport, useful report/intake components, 3-D map and working CRM contracts.
- **Consolidate only when measured:** dashboard list/detail navigation and shared report shell. Do not rebuild the whole website to conceal a storage outage.
- **Avoid:** a second auth stack, guessed admin bypasses, invented billing, multiple orchestration frameworks, fabricated historical data, disabled failing tests, or deleting records to make counts match.

No code/dependency reduction is claimed in this diagnostic. No wholesale deletion is justified by current evidence. Replace unsafe or duplicated mechanisms only after backup, consumer migration and independent verification.

## Sol execution instruction

Work through the six batches above in dependency order. Reproduce each failure, implement the smallest root-cause fix, add behavioral regression tests, and have a verifier other than the author review material security/data changes. Reconcile runtime/source versions before claiming a fix is live. Maintain a changed-files/schema/RLS ledger and a PASS/FAIL/NOT RUN evidence matrix. Keep main and production unchanged while a P0/P1 blocker remains. If report-store access or backups remain unavailable, finish independent local repairs but report recovery as blocked; do not start an empty replacement and call it complete.

Final acceptance requires actual owner access to all retained reports and exact deletion, all four sectors, LifePoint identity isolation, tenant/entitlement denials, actual-model grounding/injection tests, accurate citations/calculations, usable mobile/desktop chat, and no critical application console errors. Final verdict remains **FAIL** until those gates are evidenced.
