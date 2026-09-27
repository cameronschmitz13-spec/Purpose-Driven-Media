# Product diagnostic for Sol — 2026-09-27

**Verdict: FAIL for full requested product release.** Audit only; no application changes, deployments, payments, email sends, or data deletion performed. Applied Autonomous Dev Suite diagnostic commander and Ponytail. This inspection covers the local canonical Site version-35 source and GitHub contracts; the parent diagnostic owns current deployment/browser/backend verification.

## Evidence and limits

Read `AGENTS.md`, `SWEEPING_UPDATE_STATUS.md`, `SCORING_ARCHITECTURE.md`, `UNIFIED_SCREENING_UX.md`, `PDM_360_BRAND_ARCHITECTURE.md`, and `TITAN_MAIL_GATEWAY.md`. Ran `node --test tests/unified-report.test.mjs` in `pdm-site`: **9/9 passed**. Those nine tests inspect source strings; they do not prove four-sector support, saved-report stability, GPU rendering, authorization, or deletion. Their first test explicitly covers **three** sectors. Browser/accessibility/mobile checks were NOT RUN by this specialist.

Paths below are relative to `pdm-site/` unless prefixed `pdm-repo/` or `pdm-business-backend/`. Line references describe this inspected source and may move after implementation.

## P1 — saved organization report viewing reruns research and changes the displayed result

**Evidence:** `modules/organization/app/page.tsx:1838–1910` fetches a saved screening, restores input links, then calls `runAnalysis({ existingScreeningId: screening.id, ... })`. `runAnalysis` at `1599–1602` marks the old ID saved (preventing a write), but at `1610–1728` clears research state and fetches fresh website/geography/community/social/public evidence before recalculating the report. Category totals are recomputed at `1279–1288` and `1325`. The saved `currentScore`/`categoryScoresJson` do not drive this displayed report.

**Impact:** “Open report” is a new research operation. A historical report can show a different score/evidence without a new report date, or appear degraded when a provider is unavailable. This also amplifies the user's impression that report access is unreliable. Existing saved data is not necessarily overwritten; the proven bug is displayed snapshot instability.

**Minimum Sol change:** add a read-only saved snapshot rendering path, using the stored score/category/evidence/date. If legacy snapshots lack full evidence, display what was retained and mark unavailable details honestly. Keep the explicit rescore action as the only path to fresh research and a new immutable run. Reuse the renderer rather than another report application.

**Acceptance:** fixture saved at 68/100 still displays 68 after upstream data changes and while all research providers fail; opening it produces only authorized report retrieval, no `/analyze`, `/social`, `/public-evidence` research calls or POST save. Explicit rescore produces a separate ID and leaves the old snapshot unchanged.

## P1 — highest historical score is mixed with current findings and Advisor context

**Evidence:** `modules/organization/app/page.tsx:2020–2031` builds `ReportAssistantContext` with `totalScore: highestVerifiedScore`, while categories and findings come from current `breakdown`. `2138–2139` and `2168` emphasize the highest result in print/gauge. The code discloses a lower latest result, but the primary context is still not one coherent run.

**Minimum Sol change:** report title, main score, category sum, findings, and eventual Advisor retrieval must all refer to the selected immutable run. Keep “best historical” as a separate history comparison with date/rubric. Do not overwrite a canonical score with a historical maximum. Do not use this client context as the production Advisor retrieval source.

**Acceptance:** latest 48 / previous 72 fixture shows selected report 48 and matching category sum; history separately shows 72. Advisor exact-score query returns the selected authorized run's score, and switching history changes all context IDs together.

## P1 — General Organization is missing; score/UX implementation remains legacy

**Evidence:** only three dedicated routes exist: `app/screening/business/page.tsx`, `church-ministry/page.tsx`, and `nonprofit/page.tsx`. `app/organization/page.tsx:1` reexports an experience whose `OrgType` at `modules/organization/app/page.tsx:12` is only `church | nonprofit`, defaulting to church at `853`. A generic organization is coerced to church when loading at `1876/1902`. `components/AudienceLanding.tsx:7–12` also has only three configurations.

Business renders `modules/business/components/ReportView.tsx`; ministry/nonprofit render their own large `modules/organization/app/page.tsx`. Shared CSS is not a shared report shell. The business report hardcodes five dimensions with `/20` and describes this rubric at `ReportView.tsx:469–498`; organization computes its own five × 20 at `1279–1288`. These surfaces do not implement the GitHub canonical seven × 10 universal plus six × 5 sector `visibility-v1` model. No explicit legacy rubric version is rendered in either examined report. No exact “Critical Visibility Leak” label exists in those report components.

**Minimum Sol change:** preserve historical scores as an explicitly named legacy rubric. Wire new completed runs to the existing Supabase canonical finalizer and 70/30 rubric, using one report data adapter/shell with sector configuration; add General Organization intake/route/copy. Render category maxima from rubric data, not constant 20. Critical leaks need an independent evidence-backed section, not a changed mathematical total. Reuse working question controls/map/report subcomponents; do not rewrite the website wholesale.

**Acceptance:** each of four sectors completes/save/reopens under the intended organization/run; 13 canonical criteria normalize to 100 with universal=70/sector=30; independent critical leak remains visible with a high score; legacy reports retain original numbers and rubric label; rejected/ambiguous sources never affect scoring; same-name LifePoint fixture runs through the actual new request path.

## P1 — Titan implementation and dashboard are disconnected

**Evidence:** `modules/business/app/admin/shepherds-list/TitanConnection.tsx:4–13` still instructs the owner to seek Titan MCP redirect approval. GitHub `docs/TITAN_MAIL_GATEWAY.md` instead selects direct IMAP/SMTP via `services/titan-mail-gateway`. `CrmDashboard.tsx:117–118,151,194–218` calls/labels only Gmail; Site `lib/portal-routes.json:2–29` has no Titan gateway route. The static notice is not a connection implementation.

**Minimum Sol change:** deploy/verify the existing gateway on a suitable persistent Node host; configure secrets only there/server-side; implement an owner-authorized Site route for health/verify/sync/read/search and show actual provider state. Replace the obsolete MCP-only instruction once the gateway route is usable. Associate imported correspondence to CRM records without replacing Gmail history or fabricating synchronization. Sending requires an explicit operator action.

**Acceptance:** real IMAP+SMTP credential verification; bounded read-only sync creates deduplicated indexed messages; repeat sync adds zero duplicates; browser never receives gateway/mailbox secrets; nonowner denied; gateway failure leaves an accurate disconnected/error state. Actual test email send is not authorized by this diagnostic and is not needed for mailbox-read verification.

## P1 release gate — GAP House transfer must be verified on current source

**Evidence:** Site `ChurchDirectoryPanel.tsx:170–190` invokes `push_to_gap` and `check_gap` through the business portal; `250–252` correctly distinguishes configured from verified. This remains dependent on the old business backend and GAP runtime configuration. Local `pdm-business-backend/app/api/admin/church-directory/route.ts:218` contains unsupported `redirect: "error"`, but that checkout is older: GitHub `docs/PRODUCTION_IMPLEMENTATION_STATUS_2026-09-24.md:70–83` records newer backend v49 fixing this to `manual` and passing tests. **Do not report the stale file as proof that production still has that defect.**

**Minimum Sol change:** recover current v49 source/access, inspect deployment/config and both endpoint contracts. Keep the existing approved-contact transfer rather than adding a second CRM synchronization system. Only change what a current request/log reproduces.

**Acceptance:** owner readiness check succeeds; a disposable approved fixture appears in GAP Director's Desk; repeat push updates/deduplicates; denied/restricted contacts never become contactable; nonowner and redirected endpoints denied; count/identity readback on the GAP side matches response. Never delete real contacts to force a passing test.

## P2 — v35 fixes exist; finish verification and small interaction gaps

- **Business readability / Category Leader Pattern:** corrected local rules exist in `app/unified-report.css:166–229`; list text at `176–184` is dark. `ReportView.tsx:451–460` renders the category-leader section unconditionally from `business-context.ts:87–94`. `SampleReport.tsx` now renders actual `ReportView sample`. Preserve these changes. The pattern is explicitly a sector-informed standard, not measured competitor superiority. Verify rendered contrast, section visibility, focus, wrapping, and 320/390/768/1440px layouts after all stylesheet imports in `app/layout.tsx:4–14`; avoid another blanket color override. Minimum normal text contrast 4.5:1, large text 3:1.
- **Dashboard density:** local v35 already collapses operational summary/evidence/meetings and bounds client lists in `unified-report.css:477–507`; `AdminDashboard.tsx:80–88` now exposes full histories. “All reports” still renders two separate large portfolios at `72–73`. Test with 200 clients and 20 reports per client before a rewrite. If excessive scrolling remains, one searchable result list with a sector filter and selected-detail pane is a justified consolidation. All-report history must remain reachable.
- **Per-report business deletion:** history rows at `AdminDashboard.tsx:83` offer Open only; deletion is still “latest” or “business and all.” Add selected-report deletion only if the user is to delete any specific historical report, with report-ID validation and recomputed business summary. Do not use the destructive all-record action to remove one old report. Existing auth fixes alone do not provide this capability.
- **Misleading account empty state:** `components/SupabaseAccountHub.tsx:51–59` renders an unavailable alert and then “No saved reports yet” when data is unavailable. Give `ReportList` an error/unavailable state and reserve empty state for a successful empty response. Test an outage and a genuine empty account separately.
- **Business intake resume:** `BusinessScreening.tsx:28` sends unauthenticated users to `/login?...resume=1`, but only in-memory form state exists; `BusinessEntry.tsx:2` ignores returnTo and there is no resume consumer. Authenticate before entering save-required flow or preserve only the necessary draft with a bounded, cleared storage mechanism. Test fill → sign in → return with entries intact.

## Pricing / Advisor copy: preserve honest state; no invented billing

Homepage `app/page.tsx:451–488` already removes fixed package prices and leads to sector results/scoped help. `BusinessPricing.tsx:64–119` offers existing $160 annual Roadmap plus tailored implementation quote and explicitly says payment does not unlock Advisor. `PricingOptions.tsx:8–10` preserves ministry/nonprofit Square services; don't silently change prices or grandfathered agreements. `ReportAssistant.tsx:28–42` is a locked marketing preview, not functional chat. This is truthful pending implementation; passing its source-string test is not an Advisor release test.

Small consistency issue: home says Roadmap pricing appears in reports, while `AudienceLanding.tsx:18,21` also displays pricing before screening. Choose one consistent customer journey per the user's approved direction (free baseline → needs → quote) and retain existing paid contracts. Never add a guessed growth-potential pricing equation. Stripe entitlement implementation remains a separate blocked release feature; a Square redirect alone cannot establish entitlement.

## 3-D map: retain and verify

`ReportView.tsx:394` retains `ServiceAreaExplorer`; `ServiceAreaExplorer.tsx:35–55` dynamically loads the map and provides WebGL failure/data-control fallback. Source-string assertions only prove code remains. Test a GPU-capable browser: address selection, radius, county data, 3-D toggle, terrain, street detail, rotate, keyboard coordinate alternative, and reduced motion. Test unavailable tile/county services independently. Coordinates/radius saved in localStorage at `31–34,61` are browser preferences, not canonical score evidence. They must not become authoritative Advisor facts without explicit provenance. No map replacement is justified by the inspected code.

## Deletion/rebuild recommendation

No whole-site or database deletion is justified. The high-value replacement is narrow: remove implicit research from **saved report viewing**, retire duplicated scoring for **new canonical runs** after parity/security tests, and consolidate report rendering incrementally. Preserve raw legacy records/snapshots and working map/intake controls. Archive obsolete code only after every consumer moves and an independent verifier passes all four sectors. A green source-string suite must never substitute for these acceptance tests.
