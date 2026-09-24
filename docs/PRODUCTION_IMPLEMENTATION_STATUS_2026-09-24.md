# Production implementation status — 2026-09-24

This records the completed Sol handoff for the live Purpose Driven Media, PDM business backend, ministry/nonprofit screening service, and GAP House CRM sites.

## Published source versions

- Public PDM Site source commit: `0769dc980b610253c301cac99c125aecd1e749ca` (Sites version 30)
- PDM business backend source commit: `c28b4f3a85f149e791fdb531a83cc7b8246fc35a` (Sites version 48)
- Ministry/nonprofit backend source commit: `239922dfb94f8db64423a54e30a5ff7788bbe13d` (Sites version 56)
- GAP House source commit: `2b3234498527b5ac25a65281ee527155d1c661c4` (Sites version 11)

All four referenced production deployments completed successfully.

## Delivered

- Business results retain the interactive 3-D market map while removing its continuous animation loop and smoothing radius updates.
- Category Leader Pattern now has its own visible heading and report navigation target.
- Business pricing is reduced to two clear choices: the $160 Visibility Roadmap or a report-based scoped quote.
- The homepage no longer presents a dense cross-sector pricing wall; visitors choose a screening first and see sector-relevant next steps in their results.
- Quote requests carry the organization, report reference, and report priority into the review request.
- The central admin exposes all business, ministry, and nonprofit screening history.
- The PDM owner can open the admin through either the current ChatGPT owner session or the PDM owner account; non-owner accounts remain blocked.
- Owner report access includes reports created under other customer accounts without weakening public report privacy.
- Per-screening and per-client delete controls now wait for the authenticated session, validate the response, and surface the real error if deletion fails.
- Legacy business and ministry ChatGPT-site page links permanently redirect to their canonical `purposedrivenmedia.group` routes while preserving query strings and report IDs.
- The standalone backend API routes remain available to the canonical site and are excluded from legacy page redirects.
- Prospect research and CRM tools are collapsed into clearer admin drawers to reduce dashboard density.
- The Shepherd's List places the GAP House directory sync before prospect discovery.
- PDM → GAP House directory sync reconciles every status and do-not-contact restriction. Pending, rejected, archived, and suppressed records cannot be newly imported for outreach, and GAP House restrictions cannot be reactivated by a later PDM sync.
- Lead discovery excludes disused/abandoned listings, deduplicates by organization while retaining the most complete record, and prioritizes records with public contact evidence.

- Public LifePoint and business sample maps can now use signed portal requests to resolve addresses and load Census county geography without forcing a visitor sign-in. Direct or tampered backend requests remain blocked.

## Lead-finding implementation note

The lead-research pipeline was informed by [Dukotah/leadgen](https://github.com/Dukotah/leadgen), an MIT-licensed project with a useful collect → deduplicate → enrich → suppress → score pattern. PDM adapts that pattern to the existing TypeScript/OpenStreetMap workflow rather than copying its Python stack or adding an unreviewed dependency. Leads remain research candidates and require operator review before CRM insertion; no outreach is sent automatically.

## Verification

- Public PDM: 14/14 tests passed; production build passed.
- PDM business backend: production build and 32/32 tests passed; live address lookup and county geography returned 200.
- Ministry/nonprofit backend: production build passed.
- Live admin route shows the owner-priority access gate.
- Live legacy business admin URL redirects to `https://purposedrivenmedia.group/business/admin`.
- Live legacy LifePoint report URL redirects to `https://purposedrivenmedia.group/organization/reports/lifepoint`.
- `git diff --check` passed in all three changed source repositories.

## Remaining controlled limitation

PDM 360° Advisor is visible and accurately described as pending access. A production AI provider and a verified entitlement/payment path are not configured, so the site does not pretend that live Advisor chat is available. This remains the next integration task.

## Admin and business results refinement — later 2026-09-24

- Public PDM Site source commit: `85f651bd967527e575229893e7bdd1329853f649` (Sites version 31, production deployment succeeded).
- The admin opens on business reports, with business, ministry/nonprofit, and all-reports selectors and search immediately below the heading. CRM summary cards are compact; duplicate statistics and large shortcut cards are removed. Meeting requests, public footprint, and meeting notes expand on demand. The pipeline shortcut opens Shepherd’s List, and client details offer full report, rescore, and existing deletion controls.
- Business results show a shorter primary route through overview, 3-D market map, Category Leader Pattern, action plan, and Advisor; secondary report sections remain available under More sections. Reading size, focus treatment, and mobile layout were refined. The 3-D map and evidence remain in the report.
- PDM 360° Advisor copy now labels the proposed screening-grounded experience as planned for the Visibility Roadmap. The example questions are a preview, not live chat. Production AI provider and verified entitlement/payment integration are still pending; do not claim Advisor is unlocked by payment.
- Production build and 14/14 public Site checks passed; owner-authenticated dashboard behavior was not re-tested with an owner session in this pass.

## Admin website sign-in follow-up — later 2026-09-24

- Public PDM Site source commit `3d52ea0b0cad5ba846471527a4d9e60b44e44fe8` (Sites version 33) deployed successfully.
- The shared website header exposes Admin sign in, leading to the PDM owner website account login. The login describes owner access to saved business, ministry and nonprofit screenings. The owner gate now lets someone signed in under another PDM account sign out and switch accounts, avoiding a redirect loop. The business report error state directs an admin to that owner login. The admin sidebar signs out of the Supabase website session when present.
- Canonical `/business/report/[id]` already uses `SupabaseBusinessReport` and the server-validated `/api/account-data` endpoint; the older `modules/business/app/report/[id]` route is not the canonical page. Do not use the legacy route as evidence of the live flow.
- Production build and 15/15 site checks passed. Public admin login was observed on `purposedrivenmedia.group`. A successful private report open/delete still requires an authenticated owner session to verify end to end.
- Advisor remains a labeled preview. Production Sites environment exposes only the business and organization portal secrets; no AI provider credential is configured, and no verified paid Advisor entitlement lifecycle is deployed. Do not announce or unlock live Advisor chat until both prerequisites are implemented and tested.

## GAP House connection and Titan investigation — 2026-09-24 22:24 UTC

Production deployments succeeded:
- Public PDM version 34, source `485e6bd2552c672b94921bb6e34d6a75cd7beb9f`.
- PDM business backend version 49, source `73d1c421660919ebd4163e45f7e4214c4c0a807e`.
- GAP House version 12, source `ac362f171a7302442f876008aecd6ec660fa5b52`.

### Confirmed CRM failure and repair

Production logs showed successful PDM directory transfers reaching GAP House, while the `check_gap` action failed in 5 ms without a GAP invocation. An isolated Miniflare/Workers check reproduced the runtime error: `redirect: "error"` is unsupported; only `follow` and `manual` are accepted.

Both PDM's connection check and GAP House's PDM directory pull used the unsupported option. They now use `manual` and reject non-OK responses. PDM push also uses manual redirects to prevent forwarding its bearer credential to a redirected destination. The check trims its URL/token consistently with the transfer.

GAP House can now reconcile restrictions when zero contacts are approved; previously the button was disabled by the approved count. Existing do-not-contact choices remain protected. The directory heading no longer claims a connection before a successful check.

Verification: 6/6 PDM directory tests and 5/5 GAP prospect tests passed, including unauthenticated/read-only denial, restriction forwarding, readiness validation, and rejection of 302 responses. All three production builds passed. An independent read-only reviewer found no blocking issues. The authenticated owner click-through has NOT been verified in the available browser session, which is signed out. Deployment success and these tests must not be described as full authenticated end-to-end proof.

### Titan is blocked; not connected

The existing email connector implements Gmail only. Titan OAuth discovery advertises dynamic registration and PKCE, with `mail:read` and `contacts:read` scopes available.

A registration request for client `Purpose Driven Media CRM` using the proposed callback `https://purposedrivenmedia.group/business/admin/shepherds-list/titan/callback` was rejected with `UnapprovedRedirectUri`: `Redirect URI host is not on the registration allow-list`. No OAuth client/token or mailbox access was obtained.

Titan must approve the PDM host/client and confirm account region and eligible plan. The callback is proposed, not an implemented route. After approval, the owner-only OAuth flow, encrypted token persistence, live tool/schema discovery, bounded import/deduplication and mailbox verification remain to be implemented. Do not reuse Titan's ChatGPT/Claude client IDs or redirect through an unrelated allow-listed domain.

The owner-only Shepherd's List contains a collapsed Titan setup notice with the exact support request. It explicitly says `sales@purposedrivenmedia.group` is unconnected. No mail was sent and no Titan mail/contacts were imported.
