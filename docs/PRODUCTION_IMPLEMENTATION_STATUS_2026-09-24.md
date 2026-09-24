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
