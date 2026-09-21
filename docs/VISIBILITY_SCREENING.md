# PDM Visibility Screening

## Role
The Visibility Screening is PDM's diagnostic mechanism. It makes online visibility understandable and actionable.

## Core promise
Show organizations what is working, what is unclear or missing, and what to improve first.

## One product, multiple audience configurations
Business, Non-Profit, Ministry, and general Organization screenings are one screening product family.

They must use the same UX shell and report experience.

Use the current Non-Profit screening as the canonical visual/interaction reference.

Audience differences should be configuration/rubric differences, not duplicated page implementations.

See:
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/SCREENING_ACCURACY_AND_IDENTITY.md`

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

## Accuracy rule
No external evidence may affect a score until it passes organization identity matching.

Name similarity alone is never enough.

If a source may belong to another organization, branch, campus, city, or state:
- mark it ambiguous/rejected
- exclude it from scoring
- do not display it as customer-facing evidence

## Scoring
Every screening run must identify the scoring/rubric version used.

Do not silently recalculate historical reports after rubric changes.

If a category is shared across audience types, use the same rule unless a documented audience-specific reason exists.

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
**Start My Visibility Screening**

## Required regression
Maintain a regression case from the actual LifePoint/Lifepoint screening that previously mixed third-party information from another state.

The test must use the exact submitted target and reject the wrong organization before scoring.
