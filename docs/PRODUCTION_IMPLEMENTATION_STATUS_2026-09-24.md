# Production implementation status — 2026-09-24

This records the completed Sol handoff for the live Purpose Driven Media, PDM business backend, and GAP House CRM sites.

## Published source versions

- Public PDM Site source commit: `335e45ffe08d8994b526ffa864a13879cba6eb68` (Sites version 29)
- PDM business backend source commit: `fe280047c5f72bd7248bc14ed53e3eb2d505ecf0` (Sites version 46)
- GAP House source commit: `2b3234498527b5ac25a65281ee527155d1c661c4` (Sites version 11)

All three production deployments completed successfully.

## Delivered

- Business results retain the interactive 3-D market map while removing its continuous animation loop and smoothing radius updates.
- Category Leader Pattern now has its own visible heading and report navigation target.
- Business pricing is reduced to two clear choices: the $160 Visibility Roadmap or a report-based scoped quote.
- The homepage no longer presents a dense cross-sector pricing wall; visitors choose a screening first and see sector-relevant next steps in their results.
- Quote requests carry the organization, report reference, and report priority into the review request.
- The central admin exposes all ministry/nonprofit screening history and per-screening/client deletion controls.
- Prospect research and CRM tools are collapsed into clearer admin drawers to reduce dashboard density.
- The Shepherd's List places the GAP House directory sync before prospect discovery.
- PDM → GAP House directory sync now reconciles every status and do-not-contact restriction. Pending, rejected, archived, and suppressed records cannot be newly imported for outreach, and GAP House restrictions cannot be reactivated by a later PDM sync.
- Lead discovery now excludes disused/abandoned listings, deduplicates by organization while retaining the most complete record, and prioritizes records with public contact evidence.

## Lead-finding implementation note

The lead-research pipeline was informed by [Dukotah/leadgen](https://github.com/Dukotah/leadgen), an MIT-licensed project with a useful collect → deduplicate → enrich → suppress → score pattern. PDM adapts that pattern to the existing TypeScript/OpenStreetMap workflow rather than copying its Python stack or adding an unreviewed dependency. Leads remain research candidates and require operator review before CRM insertion; no outreach is sent automatically.

## Verification

- Public PDM: 13/13 tests passed; production build passed.
- PDM business backend: 10/10 focused tests passed; production build passed.
- GAP House: 4/4 focused tests passed; production build passed.
- `git diff --check` passed in all three source repositories.

## Remaining controlled limitation

PDM 360° Advisor is visible and accurately described as pending access. A production AI provider and a verified entitlement/payment path are not configured, so the site does not pretend that live Advisor chat is available. This remains the next integration task.
