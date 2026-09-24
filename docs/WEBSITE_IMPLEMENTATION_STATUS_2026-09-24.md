# PDM website implementation status — September 24, 2026

## Source of truth

The public website is built and published from the Sites source repository for project `appgprj_6a91991aec5881919b5beffad5e7b81f`. This GitHub repository contains the product architecture and implementation briefs; changes to it alone do not deploy the website.

## Implemented in the current website update

- Generic homepage screening actions lead to the visible three-sector chooser at `/#screening-options`. Sector-specific actions continue directly to business, nonprofit, or church/ministry intake. All stale `/#audiences` references in site source have been replaced.
- Shared footer uses the canonical `purposedrivenmedia.group` contact address and site-relative navigation.
- LifePoint report includes a clear dated August 27, 2026 validation label, avoids calling that evidence current today, links directly to a companion 3-D geographic view, and routes review requests to a public contact page with organization/report context.
- Business and sector pricing use the Visibility Roadmap name. They identify PDM 360° Advisor as planned and unavailable; checkout does not confer Advisor access. Existing prices and one-time Square behavior remain as published.
- The public review-request page provides a prefilled email with report reference and a phone fallback. It states that a requested time is not an automatically booked appointment. Existing account-gated calendar routes remain for authenticated workflows.
- Privacy and service terms now distinguish private saved business reports from intentionally public example reports.

## Still required before Advisor can be sold as active

Implement each-request server authorization for account identity, organization membership, target report access and active entitlement; verified payment or audited grant activation; report-grounded cited answers; conflict and arithmetic checks; rate limits, expiration, revocation, retention and usage terms. Follow `docs/PDM_360_ADVISOR.md`. Do not change the static preview label or promise unlimited usage until these pass.

## Still required for comprehensive sitewide completion

- Reconcile Supabase customer login with account-gated admin and scheduling routes; preserve server authorization.
- Validate a complete signed-in owner/report flow, expired account, unrelated account, and error/empty states.
- Establish the system of record for prior screening/report data and admin CRM connection status.
- Version the existing five-area scoring rubric before any 70/30 architecture migration. Do not rewrite the historic LifePoint 92/100 score.
- Document the separate 96 outside-footprint score math, and distinguish unavailable evidence from a verified zero.
- Reverify LifePoint's public facts and third-party link identities before the meeting. The published report is a dated snapshot.
- Verify mobile, keyboard, print output, and WebGL2 map/fallback on the presentation laptop.
- Check the connected production deployment and every external checkout/service value after publishing.

## Meeting walkthrough

Open `/organization/reports/lifepoint`, explain the dated 92/100 result and three priorities, review facilities and the 30-day plan, open `/organization/reports/lifepoint/map` if 3-D works on the actual laptop, then use the public review-request path. The 97 figure is a planning target, not an achieved score. Advisor is a preview.
