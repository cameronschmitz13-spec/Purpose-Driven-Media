# Unified Screening UX

## Decision
All PDM screening types must use the **same UX system**.

The current non-profit/non-for-profit screening experience is the canonical visual and interaction reference.

The Business Screening should look and behave like the Non-Profit Screening.

Ministry, business, non-profit, and general-organization screenings must not become separate visual products.

## One shared screening shell
Use one reusable screening application shell for every screening type.

Shared:
- header / PDM branding
- page width
- typography
- spacing
- progress/navigation
- question/card patterns
- loading states
- error states
- source/evidence states
- score presentation
- category bars
- Fix First / Improve Next / Monitor cards
- planning-target gauge
- progress-history section
- report actions
- mobile behavior
- accessibility behavior

## Configuration, not duplicate UI
Audience-specific differences must come from configuration/data, not copied screen implementations.

Allowed configuration differences:
- screening label
- audience wording
- question text
- category applicability
- scoring rule/weight when justified
- report explanations
- examples

Do not fork the visual system.

## Canonical report experience
Every completed screening should use the same report layout pattern:
1. organization identity header
2. report/sample status
3. key action cards
4. planning target / score visualization
5. standardized category score list
6. evidence/explanation
7. progress/history where applicable
8. next-step CTA

## Category consistency
Use stable category keys internally, even when the user-facing label varies by audience.

Example:
- `search_findability`
- `website_clarity`
- `readiness`
- `listing_consistency`
- `freshness_content`
- `identity_trust`

Avoid creating business-only copies of the same category with unrelated keys.

## Score comparability
If two screening types use the same category, use the same scoring rule unless there is a documented reason not to.

If a business-specific or non-profit-specific rule differs:
- keep the same UX
- make the difference explicit in rubric configuration
- version the rubric
- test both paths

## Responsive behavior
The same hierarchy must survive desktop, tablet, and phone.

Do not shrink the entire desktop report into an unreadable mobile screenshot.

On mobile:
- stack cards
- preserve score prominence
- keep category labels and scores legible
- use minimum comfortable tap targets
- avoid horizontal scrolling
- keep next-step actions obvious

## Accessibility
- keyboard reachable controls
- visible focus states
- semantic headings
- labels for form fields
- sufficient contrast
- status is never communicated by color alone
- meaningful screen-reader labels for scores/charts

## QA matrix
Before release, run the same end-to-end checklist for:
- Business
- Non-Profit
- Ministry
- General Organization

The only expected differences should be audience-specific content/rubric configuration.
