# Screening navigation, integrated map and direct sharing — October 1, 2026

This corrects the condensed saved-report presentation and detached-map choice documented in SCREENING_ROADMAP_RELEASE_2026-10-01.md. The original results UI is now reused; working scoring, research and storage sections are retained.

## Traceable report destinations

| Entry | Result |
| --- | --- |
| Admin Open Latest Report / original screening | `/organization?report=<saved-id>&view=full` hydrates ScreeningExperience results, including original links, update timing, website, Census, evidence, scores and map. It no longer renders SavedOrganizationReport's condensed text UI. |
| Regular LifePoint screening | `/organization?report=5213c469-eb68-4d19-ab37-6a3d8bab5ee8&view=full` remains the dated September 29 provisional 74, separate from reviewed 92. |
| Latest LifePoint rerun | The row selected by admin latest/history retains its exact ID, timestamp and score. Rescore prepares a new screening with parentReportId; opening never rescans or overwrites history. |
| Reviewed LifePoint | `/organization/reports/lifepoint` retains reviewed August 27 score 92 and the separate outside-footprint 96 caveat. Advisor preview moves to bottom with light blue #c4eaff text. |
| Organization roadmap | `/organization/roadmap/<saved-id>` uses that exact persisted screening. |
| Business roadmap | `/business/report/<saved-id>/roadmap`; fictional sample `/business/sample/roadmap`. |
| Reviewed roadmap | `/organization/reports/lifepoint/roadmap`. |
| Shared report / roadmap | `/shared/report/<token>` and `/shared/report/<token>/roadmap`; read-only, no login or questions, exact persisted report. |

## Small implementation

The saved organization loader restores existing results state and reads recorded category/checkpoint values rather than rerunning the legacy score. Automatic save and Census refresh skip reopened records. Missing historical snapshots remain unknown. Newly saved records also include landmarks and channel footprint, so future reopenings preserve them exactly. Existing reports without those fields still display their original saved evidence and identify modeled channel comparisons.

The live map remains inside community-scene together with channel influence nodes, core, ranking dock and source links. A reserved control strip above a 430px map body (440px phone body) prevents overlays covering map buttons. The ranking dock is raised above attribution/source links; scrolling and keyboard navigation retain access to every submitted link. No new map stack or unrelated rebuild.

Dedicated roadmap routes reuse the stored report and existing deterministic evidence-based plan. Business priorities exclude unknown/ambiguous research gaps. Plans preserve the score and date; they do not activate the proposed paid Advisor or make outcome guarantees.

## Direct sharing and persistence

Share report creates a random 256-bit capability. Only its SHA-256 hash is stored in the new private pdm_report_sharing.links table. Authenticated owner/admin access to the original report is required to create a link. Links expire after 30 days and can be stopped by their creator. Existing report RLS is unchanged: anonymous users cannot list reports or create links. The narrow token reader returns only the selected report snapshot and metadata, excluding created_by and input_snapshot. Deleted reports cannot be shared. Shared routes and APIs are dynamic, no-store, noindex and no-referrer; shared UI hides rerun/edit/share management. Public reviewed/sample reports copy their already-public direct URL.

The SQL migration is additive. No historical scores, inputs or snapshots are rewritten. The prior evidence reconciliation remains in LIFEPOINT_RECONCILIATION_2026-10-01.md: city center versus facility pin, ACS unknown values, address extraction contamination, independently verified third-party coverage versus retrieval limits, reviewed versus automated scores, and website analysis limitations.

## Verification

- TypeScript and production build; all 45 tests (UTC) including restored full results for church/nonprofit/organization, exact evidence and 74, separate routes, unknown evidence exclusion, and denied sharing requests.
- Transactional database checks, all rolled back: owner creation succeeds; valid token can read anonymously; wrong, revoked and expired tokens return null; anon table read and creation RPC privileges are false.
- Anonymous PostgREST request with invalid token returns 200/null, confirming token reader connectivity without a session.
- Browser: fictional business sample roadmap navigates to a distinct page; integrated map layout inspected using a disposable SSR fixture; reviewed LifePoint footer inspected for bottom placement and light blue text.
- No authenticated admin browser session was available; admin click-through is covered by existing exact-row API/RLS, route inspection and full-results render tests rather than claimed live account testing. Mobile sizing is CSS verified, not a device-emulation claim.
- Security advisor found no new sharing-schema warnings. Existing project notices remain: intentional admin/deletion definer RPCs, private/mail tables without policies, and disabled leaked-password protection. These are outside this UI release. Supabase remediation references: https://supabase.com/docs/guides/database/database-linter and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## GitHub/source boundary

Purpose-Driven-Media contains architecture/backend/release evidence. The Sites repository owns this frontend. The accompanying patch records all frontend changes against source commit 5048ee864049f10e80f6f0f6a833e744e5e0a6fa; apply it only to that matching frontend checkout. The SQL migration is also included separately in GitHub. Do not replace the backend tree with the frontend checkout.
