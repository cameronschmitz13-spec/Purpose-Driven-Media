> Historical investigation recorded before the implementation changes. For the published correction, see [Screening navigation, map and sharing release](SCREENING_NAVIGATION_CORRECTION_2026-10-01.md). Website version 48 was subsequently published from source commit 1095fa31742eb422de513b9e461a1dde18ed1b4b.

# LifePoint reconciliation and smallest implementation plan

Prepared October 1, 2026. Read-only investigation; no website, report, database, or release was changed.

## Finding

The three requested URLs represent different operations, not three interchangeable copies of one report. The saved September 29 report has website, Census, location, and third-party research. Older reports genuinely lack that enrichment. Remaining discrepancies include different renderers, historical versus current map context, incomplete identity matching, contaminated address extraction, absent review retrieval, and different scoring checklists.

Keep the reviewed LifePoint report and all dated snapshots. Correct the shared research pipeline, create a new dated screening, and compare evidence at checkpoint level. Do not make the automated result equal 92 by adjusting weights or copying reviewed answers.

## Evidence register

All GitHub references below were read at commit `a8976b32fbad883376787e2cd7586364b13a0099`, the latest default-branch commit returned on October 1. The public GitHub repository holds architecture, backend, fixtures and release documents; it does not contain the public website's root application/package.json. The current website source was opened separately, without edits.

| ID | Evidence | What it establishes |
|---|---|---|
| E1 | [AGENTS.md](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/AGENTS.md) | Preserve working sections, shared sector architecture, identity gate and historical scores. |
| E2 | [Scoring architecture](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/SCORING_ARCHITECTURE.md) | Canonical visibility-v1 is 70 universal / 30 sector points; demographics are contextual; old rubrics must be preserved. |
| E3 | [Identity rules](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/SCREENING_ACCURACY_AND_IDENTITY.md) and [LifePoint fixture](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/qa/fixtures/lifepoint_chillicothe_mo.json) | Canonical domain, address, phone, four legitimate facilities; stale 455 Locust listing is a consistency issue, not necessarily another entity. |
| E4 | [Persistence workaround](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/SCREENING_PERSISTENCE_WORKAROUND.md) | Authenticated site_save_screening_report; stable UUID across retries; saved only after success; enrichment failure cannot prevent saving. |
| E5 | [Website release status](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/WEBSITE_IMPLEMENTATION_STATUS_2026-09-24.md), [production status](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/PRODUCTION_IMPLEMENTATION_STATUS_2026-09-24.md) | Reviewed 92 is dated August 27; 96 outside estimate needs calculation confirmation; 97 is a planning target. GitHub commits do not deploy Sites. |
| E6 | [Sweeping status](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/SWEEPING_UPDATE_STATUS.md), [integration contract](https://github.com/cameronschmitz13-spec/Purpose-Driven-Media/blob/a8976b32fbad883376787e2cd7586364b13a0099/docs/SITE_SUPABASE_INTEGRATION_CONTRACT.md) | Canonical backend foundation exists; release requires actual UI/pipeline identity and cross-organization tests, not backend-only success. |
| E7 | Sites version/deployment responses | Version 46 source `d1a6447191b6f0be873b5d19f019ab4e979e5c98`; deployment succeeded October 1 at 00:57 UTC. Version 45 source `6dedd73a247d54563a45edf9b18900a595fc8762`; version 44 source `b975e7eec0efb8f15f0f5a56a664c384b5165003`. |
| E8 | Website source `docs/SCREENING_RESEARCH_RELEASE_2026-09-29.md` at version 46 | Added local website/geocode/community/public-evidence handlers and persisted enrichment. Active guided scoring remains provisional legacy-site-v1. Signed-in browser save/reopen and desktop/mobile QA were not verified in that release. |
| E9 | Website source `docs/FACEBOOK_MENTIONS_2026-09-30.md` at version 46 | Bounded public outside-post discovery; blocked/no verified result means unknown coverage. Mentions remain unscored. No real LifePoint outside Facebook mention was verified. |
| E10 | Read-only Supabase query, project `dylgugjawlfbmtqmmzqq`, table `public.site_screening_reports`, exact ID `5213c469-eb68-4d19-ab37-6a3d8bab5ee8` | Persisted 74/100, September 29 at 21:27:19.956 UTC; provisional, client_computed_unverified, legacy-site-v1; six website pages, six matched outside sources, available county ACS and coordinates. |
| E11 | Same-table LifePoint history query ordered created_at DESC, id DESC | Latest returned row is `3cc7ff93-716a-4771-ad13-0280d8ee73d2`, September 29 at 21:35:06.930 UTC, also 74. Earlier 44/46/50/52 records lack website/Census snapshots and have zero matched sources. |
| E12 | Website route/source trace at version 46 | `app/screening/church-ministry/page.tsx`; `modules/organization/app/page.tsx:1862–1975`; `lib/site-reports.ts`; `app/api/account-data/route.ts`; `modules/business/app/admin/AdminDashboard.tsx`. |
| E13 | Website research/render trace at version 46 | `lib/public-evidence-research.ts:17–32`; `lib/evidence-identity.ts`; `lib/website-research.ts`; `modules/organization/app/page.tsx:1156–1167,1292,1524–1597`; `modules/organization/components/SavedOrganizationReport.tsx`; `modules/business/components/ServiceAreaExplorer.tsx`. |
| E14 | This investigation's runnable checks | 26 targeted existing tests passed; an additional direct identity probe accepted a same-city candidate with conflicting domain/phone fields, exposing missing gate inputs. No authenticated browser or production build pass is claimed. |

The public URLs could not be retrieved by the web tool in this session. The comparison is grounded in deployed source provenance and actual saved rows, not a claim of signed-in visual inspection. Source paths E8–E13 refer to the Sites repository at E7, not files falsely assumed to be in public GitHub.

## Exact URL comparison

| Surface | URL | Actual behavior and evidence |
|---|---|---|
| Regular ministry screening | https://purposedrivenmedia.group/screening/church-ministry | Shared ScreeningExperience with forcedOrgType="church". Blank intake; it has no LifePoint score until supplied inputs are scanned. E12. |
| Ministry rerun | https://purposedrivenmedia.group/organization?rerun=5213c469-eb68-4d19-ab37-6a3d8bab5ee8#screening | Authorized loader restores links, timing answers, location, reach and reference links; clears enrichment and report UUID; returns to intake. Running it creates a new dated report. E10/E12. |
| Admin full report for that exact row | https://purposedrivenmedia.group/organization?report=5213c469-eb68-4d19-ab37-6a3d8bab5ee8 | Loads the saved row and renders SavedOrganizationReport, without re-running the scoring scan. Fixed 74/100. E10/E12. |
| Admin current latest row | https://purposedrivenmedia.group/organization?report=3cc7ff93-716a-4771-ad13-0280d8ee73d2 | A different row from the pinned rerun; also 74. The admin's latest link can advance as new reports are added. Compare by exact ID, not just organization name. E11/E12. |
| Reviewed presentation report | https://purposedrivenmedia.group/organization/reports/lifepoint | Separate curated page, dated August 27, 92/100; outside estimate 96 and planning target 97. It is not the saved automated row. E5 and version-46 curated source. |

The rerun must not automatically inherit old source findings as fresh observations. Identical saved inputs can yield changed evidence on a later date; such differences need source timestamps and a comparison record.

## Reconciliation by evidence area

| Area | Confirmed state | Inconsistency or remaining gap | Smallest correction |
|---|---|---|---|
| Map | Exact row has coordinates 39.7948749, -93.5532779 from Nominatim; placeType=administrative, representing Chillicothe. County boundary is stored. | This is a city context center, not a verified church-building pin. Saved renderer launches a different ServiceAreaExplorer, hardcodes reach="local", defaults to a 15-mile radius and retrieves current county geography separately instead of displaying the recorded boundary. | Preserve location type, saved reach and saved county boundary in the existing map component. Label recorded context versus current exploration. Resolve the verified street address for a church pin; keep an explicitly labeled city fallback. |
| Census | Stored Livingston County GEOID 05000US29117; ACS 2024 five-year delivered by Census Reporter; population 14,364, median age 39.8, median household income $63,627. Language-other metric null; margins stored. | Older reports have no demographic snapshot. Interactive county map and stored ACS cards are separate data paths; map loading is not proof ACS is missing. | Render stored metrics, geography, vintage, timestamp and source consistently; null stays Unknown. County totals must not be called radius population, attendance or reach. No demographic score points. |
| Third-party coverage | Six included original sources, 36 sourcesChecked; three ambiguous retrievals excluded. Outside planning benchmark 81. | Seven preset outside links are not seven verified scan matches. City/Main Street/resource/BibleTimes sources are mostly classified "other", making directory count zero. Snapshot stores count/target but not all formula inputs. The current unavailable branch still assigns numeric coverage 0, despite the unavailable grade. | Separate submitted leads, fetched matches and exclusions; classify sources by observed purpose. Persist coverage components and method version; use null plus a retrieval status for unavailable coverage in new snapshots. Keep benchmark separate from score. |
| Reviews | reviewResults=[], reviewCount=0; no stored rating or total review count. | researchPublicEvidence explicitly passes reviewResults:[] and does not parse verified review data. This is an absent retrieval capability, not proof LifePoint has zero reviews. Google input is a Maps search URL. | Add bounded server-side retrieval for a confirmed Google place/listing using existing discovery first; add a provider only if needed. Persist place identity, rating/count, retrieval time, returned sample and limits. If unavailable, show Unknown with reason; never infer sentiment from snippets. |
| Facebook mentions | Version 46 adds outside-author public-post checks; results excluded from scoring. The September 29 row predates that feature and has no Facebook mention snapshot. | Opening an old report cannot retroactively obtain these results. No real LifePoint mention was verified in release E9. | Keep historical field unrecorded; run the bounded collector only on new screenings. Separate limited coverage from verified absence. |
| Identity/address | Six sources match name/location. The accepted city directory's source text contains LifePoint's 455 Locust and exact 660-973-2639 phone. | Whole-page extraction includes other churches and publisher addresses. 22 external strings plus first-party extraction create the saved warning of 23 variants. The city directory's capped address list misses LifePoint's own 455 Locust entry. The current helper does not take a canonical fingerprint or evaluate candidate domain/phone conflicts. | Extract the target's listing/article block before fields. Persist canonical domain/phone/address/facilities and field-level match reasons. Apply strong/supporting signals and hard conflicts from E3; never accept incidental city/name tokens elsewhere on a page. |
| Website analysis | Six saved HTML pages; Events 57 words, Plan Your Visit 59; all title/description checks detected, H1 coverage 33%. | Reviewed report says dress, length and expectations are answered; automated regex flags dress/style/duration false and scores what-to-expect 0/4. HTML/navigation tokens are limited evidence; an unread embed is not proof content is absent. | Store page-level text excerpts for scored claims, scope feature checks to relevant main content, and use rendered verification only where embed/script extraction is insufficient. Distinguish not observed from confirmed absent/broken. |
| Persistence | Row, embedded currentScore and scoringSnapshot.totalScore all equal 74. Exact-row loader uses authoritative DB ID/name/score/date. Retry-safe RPC is preserved. | Multiple historical rows explain latest-link changes. Failed save retries can rebuild a payload from changing React state; automatic community refresh can change displayed context after the original save. Rerun has no stored parent ID. | Freeze exact pending payload plus UUID before save; retry that payload. Record parentReportId and full inputs for new runs. After success, use returned saved snapshot/link as presentation truth; late enrichment becomes clearly separate context or a new report. |

Outside sources saved for the exact row: KCHI church broadcasts; Chillicothe city directory; Main Street Chillicothe listing; Livingston County Health recovery resources; KCHI warming-center article; BibleTimes Main Church listing. Connect Center and two KTTN candidates were excluded as ambiguous/unretrievable. Each stored source has URL, retrieval time and match rationale.

## Score reconciliation

| Category | August 27 curated | September 29 saved | Arithmetic difference |
|---|---:|---:|---:|
| Search findability | 19 | 17 | -2 |
| Website clarity | 19 | 15 | -4 |
| Visitor readiness | 19 | 11 | -8 |
| Listing consistency | 16 | 14 | -2 |
| Freshness/content | 19 | 17 | -2 |
| Total | 92 | 74 | -18 |

This is a descriptive difference, not a measured 18-point decline. The curated 25 checks and automated 25 checks differ in definitions/evidence; neither is the canonical 13-rating 70/30 finalizer. The fixture also contains a separate August 25 legacy reference of 91, expressly marked reference only; do not overwrite either historical snapshot to match it.

The automated listing-address checkpoint is 1/4 because of the contaminated 23-variant warning. Do not simply award three replacement points: isolate LifePoint fields, retain legitimate facilities and the real 455 versus 434 discrepancy, then score a new run under a versioned rule.

Automated outside benchmark reproduction: county target=5; breadth=min(100,6/5×100)=100; credibility=min(100,(2×2+0+0)/5×100)=80; freshness=round(1/ceil(5×0.45)×100)=33; round(100×0.5+80×0.3+33×0.2)=81. This uses legacy-contextual-coverage-v1. The curated 96 has an explicit calculation caveat and cannot be compared as a 15-point measured drop. 97 and the saved 85 potential remain planning estimates.

## Smallest tailored roadmap addition

Reuse the existing exact-report loader and authorization. Proposed saved-report link:

`/organization?report=5213c469-eb68-4d19-ab37-6a3d8bab5ee8&view=roadmap`

This is a proposed URL, not an already working feature. Add one view parameter and one small roadmap component within the existing report shell. No new report service, scoring engine, framework, schema or AI provider is required.

1. In modules/organization/app/page.tsx, handle view=roadmap only after loading the authorized exact report. Carry the ID into the back-to-report link. Never choose latest by name.
2. In SavedOrganizationReport.tsx, add “View your tailored visibility roadmap.” Show a saved-report link from fresh results only after RPC success; on failure retain retry status.
3. Build actions from saved checkpoint IDs, evidence URLs and exclusions, with a roadmap template version. Use deterministic derivation for existing immutable rows; save the roadmap snapshot inside report JSON when creating future rows. Do not try to update a historical row through the idempotent save RPC.
4. For the curated page, use `/organization/reports/lifepoint?view=roadmap`, retaining its reserved reviewed reference `lifepoint-curated-2026`, August 27 basis, and existing four-week plan. Reuse its facilities/actions; do not attach the automated 74 snapshot to the curated 92 report.
5. Every action displays priority, evidence basis, verification still needed, suggested owner role, week and completion check. Roles are suggestions, not commitments. Unverified problems become verification actions.
6. Apply the same report access/entitlement checks to report and roadmap. Current canViewFullReport is admin-only and roadmapPaidAt is null. This addition must not imply payment unlocks content or activate the locked Advisor. A client delivery beyond existing access requires the real authorized access path, not a public UUID bypass.

LifePoint starter actions, subject to their dated evidence:

| Week | Action | Traceable basis | Completion check |
|---|---|---|---|
| 1: Verify | Confirm primary 434 Locust listing, four facility purposes, Google ownership and 455 Locust administrative/stale listing. | E3; curated facility table; original city-directory block. | A source-by-source approved facility matrix; no other church/publisher address included. |
| 2: Strengthen | Verify dress/length/entrance/accessibility content; add crawlable Events and Plan Your Visit summaries where needed. | Saved readiness checkpoints; 57/59-word HTML observations; curated page recommendations. | Current source/rendered evidence and actionable visit details on the intended pages. |
| 3: Reputation | Confirm the exact Google listing; retrieve rating/count where available; establish review monitoring and responses. | Review retrieval missing; curated review-stewardship recommendation is dated. | Verified listing identity and dated rating/count or explicit retrieval limitation; no invented sentiment. |
| 4: Connect | Align radio/recovery/secondary-facility references and visitor response paths. | Six saved outside URLs and curated KCHI/recovery/facility plan. | Relevant source links and facility labels agree; priority contact/visit pathway tested. |

## Minimal implementation sequence and verification

| Change | Existing area to touch | Required verification |
|---|---|---|
| Target-scoped extraction and canonical fingerprint gate | lib/public-evidence-research.ts, lib/evidence-identity.ts, shared address extraction callers | LifePoint city directory accepts exact phone while preserving 455 conflict; KCHI ignores other churches and station address; Main Street ignores publisher address; legitimate four facilities survive; wrong-state and same-city conflicting domain/phone candidates have zero scoring impact. |
| Evidence statuses and review retrieval | Existing shared public-evidence handler + report renderers | Verified Google place yields separately labeled rating/count/sample; blocked retrieval stays Unknown; zero confirmed reviews is distinct; search URL never earns accuracy/ownership points by itself. |
| Saved report/map parity | SavedOrganizationReport.tsx + existing map props | Stored Census source/year/metrics/boundary remain readable offline from research APIs; WebGL failure has useful fallback; city center labeled correctly; current exploration cannot alter saved score/context. |
| Freeze and lineage | Existing save effect and lib/save-screening-report.ts | First save + simulated lost response + same-ID retry gives exactly one row and identical payload; failed save is never labeled saved; rerun gets a new ID and parent ID; old row unchanged; account switch cannot reuse another account's pending report. |
| Roadmap mode and CTA | Shared loader, saved/curated report actions, one component | Exact report → roadmap → report preserves ID/date/score; each action cites saved evidence; rejected sources never prescribe work; client/owner/signed-out/unrelated account checks match existing access; no fake entitlement. |

For the final acceptance run, open the regular ministry intake and the pinned rerun with equivalent confirmed inputs and compare checkpoint evidence, not only totals. Save the new run, reopen it through its exact admin link, refresh, and verify all frozen fields agree. Keep the old 74 row and curated 92 report intact. Check mobile, keyboard and print, plus the other three screening sectors that share research/persistence. Run the normal type/build checks and the targeted regressions once changes exist. Canonical visibility-v1 migration is a separate versioned release; do not bundle a scoring-engine replacement into this roadmap task.

Existing tests run in this investigation: `node --test tests/evidence-identity.test.mjs tests/research-pipeline.test.mjs tests/saved-organization-render.test.mjs tests/unified-report.test.mjs` — 26 passed, 0 failed. Those tests do not establish the missing new regressions above or authenticated production click-through.

Completion gate: corrected LifePoint source ownership, exact report/roadmap identity, immutable persistence, honest missing-data states and authorized browser reopen must all pass before announcing a reconciled production report. No user input is needed to define these changes; actual browser authentication and any required review-provider runtime access remain verification/integration dependencies.
