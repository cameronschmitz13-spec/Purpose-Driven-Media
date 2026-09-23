# Canonical Visibility Scoring Architecture

## Purpose
Define one scoring architecture for Business, Non-Profit, Faith & Ministry, and general Organization screenings.

This architecture is based on PDM's prior cross-sector product research and should replace ad-hoc audience-specific score systems over time.

## PDM 360° branding boundary
The customer-facing name **PDM 360° Visibility Screening** does not alter this scoring architecture.

The 360° concept is a brand and report narrative layer that communicates breadth.

Do not:
- create a second 360 score
- rename the Visibility Score to Growth Score
- add overlapping scored categories solely to support the 360° name
- silently fold demographic, market, competitor, or geographic context into the score

Market/community intelligence may appear alongside the Visibility Score as contextual evidence and strategy input.

Any future scored use of those inputs requires a documented rubric change, versioning, evidence rules, regression testing, and historical-score preservation.

## Canonical 100-point model

### Universal core — 70 points
Every organization is evaluated on the same seven universal areas:

1. Findability and Identity — 10
2. Local Presence and Reputation — 10
3. Organic Search Visibility — 10
4. Message Clarity — 10
5. Mobile Experience and Performance — 10
6. Conversion Readiness — 10
7. Measurement and Freshness — 10

### Sector module — 30 points
The remaining 30 points come from the selected sector configuration.

#### Faith & Ministry
Evaluate applicable items such as:
- visit/service information
- giving
- events/groups
- sermons/media/live content
- contact/prayer/help pathways
- app/email/member engagement where applicable

#### Non-Profit & Community
Evaluate applicable items such as:
- mission/impact clarity
- donation experience
- volunteer/supporter pathway
- program/service access
- transparency/trust
- email/event/advocacy engagement

#### Local & Service Business
Evaluate applicable items such as:
- service/product clarity
- local intent
- quote/booking/contact
- reputation
- portfolio/proof/media
- lead tracking/follow-up

## Criterion scale
Score individual criteria from 0–4:

- 0 = absent, broken, or critically deficient
- 1 = significant weakness
- 2 = functional but underdeveloped
- 3 = strong
- 4 = excellent / optimized / measured

Use weighted scoring to map criteria into their assigned category/module points.

## Critical issue override
A high average must never hide a mission-critical failure.

Flag independently as:

**Critical Visibility Leak — Address Immediately**

Examples:
- wrong phone number
- wrong primary location
- wrong service/church times
- broken donation link
- broken booking flow
- broken contact form
- no functioning primary CTA
- materially expired event information
- website failure on mobile
- major security problem

## Evidence gate
No third-party evidence may influence any criterion until it passes the identity rules in `SCREENING_ACCURACY_AND_IDENTITY.md`.

## Versioning
Every production rubric must have an immutable version identifier.

Recommended starting version:
`visibility-v1`

If production currently uses a different scoring model:
- do not silently rewrite historical scores
- document the current model as a legacy rubric version
- introduce this architecture as a new version after regression testing
- preserve historical report snapshots

## UX mapping
The customer-facing report may use friendlier category labels, but internal keys and scoring definitions must remain stable.

The same report shell should render every sector.

The Found / Understood / Connected framework and 360° story may simplify the narrative layer, but must not obscure the detailed categories or alter their weights.

## Accuracy over benchmarking
For metrics without a defensible sector benchmark, baseline the organization's own performance and measure improvement over time rather than inventing a universal target.

## Weighted normalization

For `visibility-v1`, each scored category/area receives a rating from 0 through 4.

Convert the rating to points with:

`points = (rating / 4) × weight`

Round display/report points to two decimal places.

Universal categories each carry 10 points:
- 0 → 0
- 1 → 2.5
- 2 → 5
- 3 → 7.5
- 4 → 10

Each of the six sector areas carries 5 points:
- 0 → 0
- 1 → 1.25
- 2 → 2.5
- 3 → 3.75
- 4 → 5

The seven universal categories total 70 points. The six sector areas total 30 points.

A critical visibility leak is an explicit report flag. It does not silently rewrite the mathematical total. The report must show both the calculated score and the critical issue so a high average cannot hide a broken contact/booking/donation path, wrong identity information, materially expired information, mobile failure, or major security problem.
