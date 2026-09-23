# PDM 360° Visibility Screening

## Role
The Visibility Screening is PDM's diagnostic mechanism. It makes online visibility understandable and actionable.

The approved customer-facing product name is:

**PDM 360° Visibility Screening**

The 360° concept communicates that PDM evaluates the organization across the full public visibility journey rather than checking only a website, social profile, or search result.

It does not create a second scoring system.

## Core promise
Show organizations what is working, what is unclear or missing, what is happening around them, and what to improve first.

Preferred customer-facing line:

**See your organization from every angle people use to find, understand, trust, and connect with you.**

## Relationship to the PDM master brand
The product should reinforce:

**Get Found, Understood, and Connected.**

Use the three words as the high-level narrative:

- **Found** — discovery, identity, search, local presence, listings
- **Understood** — message clarity, current information, experience, trust
- **Connected** — conversion readiness and successful next-step pathways

These are marketing/storytelling groupings, not replacements for the canonical scoring categories.

## One product, multiple audience configurations
Business, Non-Profit, Faith & Ministry, and general Organization screenings are one screening product family.

Preferred audience names:

- **PDM 360° Business Visibility Screening**
- **PDM 360° Non-Profit Visibility Screening**
- **PDM 360° Faith & Ministry Visibility Screening**
- **PDM 360° Organization Visibility Screening**

They must use the same UX shell and report experience.

Use the current Non-Profit screening as the canonical visual/interaction reference.

Audience differences should be configuration/rubric differences, not duplicated page implementations.

See:
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/SCREENING_ACCURACY_AND_IDENTITY.md`
- `docs/PDM_360_BRAND_ARCHITECTURE.md`

## Canonical scoring
The underlying score remains a **Visibility Score**.

Do not rename it to Growth Score or silently add new score dimensions for branding purposes.

The canonical architecture remains the versioned 70/30 model documented in:
`docs/SCORING_ARCHITECTURE.md`

## Current demonstrated dimensions
Only use dimensions that the actual screening evaluates:
- Search findability
- Website clarity
- Participant/customer readiness
- Listing consistency
- Freshness & content
- Local links/directories/trust signals
- Organizational identity / mission clarity

Keep stable internal category keys even if audience-facing labels differ.

## 360° Market & Community Intelligence layer
The 360° report may add contextual intelligence around the score, including defensible information such as:
- geography
- service area
- demographics
- Census/ACS estimates
- nearby organizations
- competitors/comparable organizations
- documented local market/community context

This layer should answer:

**What is happening around this organization that should influence its visibility strategy?**

Do not automatically score contextual market/demographic facts.

If future rubric criteria score any such information, document the method, evidence requirements, weights, version, and applicability before release.

## Accuracy rule
No external evidence may affect a score until it passes organization identity matching.

Name similarity alone is never enough.

If a source may belong to another organization, branch, campus, city, or state:
- mark it ambiguous/rejected
- exclude it from scoring
- do not display it as customer-facing evidence

## Critical visibility leaks
Preserve the existing independent critical-issue system.

A high Visibility Score must not hide a broken or materially incorrect primary next step.

Examples include:
- wrong phone/location/service information
- broken contact/booking/donation flow
- missing primary CTA
- materially expired information
- mobile failure
- major security problem

Use the approved label:

**Critical Visibility Leak — Address Immediately**

## Scoring
Every screening run must identify the scoring/rubric version used.

Do not silently recalculate historical reports after rubric changes.

If a category is shared across audience types, use the same rule unless a documented audience-specific reason exists.

## Report narrative
The report should help the user answer:

1. Can people find us?
2. Can they understand us?
3. Can they trust what they see?
4. Can they take the right next step?
5. What should we fix first?
6. What does our surrounding market/community context tell us?

The detailed rubric and evidence should remain available beneath the simplified narrative.

## Sample report
A fictional organization may be used for demonstration.

Recommended fictional organization:
**Riverbend Family Outreach**

Required disclosure:
**Sample Report — fictional organization for illustration only.**

Example scores may be used only as demonstration data and must never be described as a client result.

## Conversion bridge
Immediately after a sample report:

**What would your organization score?**

CTA:
**Start My 360° Visibility Screening**

Secondary CTA:
**See a Sample Report**

## Required regression
Maintain a regression case from the actual LifePoint/Lifepoint screening that previously mixed third-party information from another state.

The test must use the exact submitted target and reject the wrong organization before scoring.
