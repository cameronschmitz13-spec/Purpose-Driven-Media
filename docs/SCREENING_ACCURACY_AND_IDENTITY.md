# Screening Accuracy, Identity Resolution, and Source Provenance

## Purpose
Prevent screening results from mixing information from different organizations that share similar names.

A known failure mode is a LifePoint/Lifepoint screening pulling third-party information for a different church in another state. This must be treated as a data-integrity defect, not a cosmetic issue.

## Non-negotiable rule
**Never accept third-party information because the organization name alone looks similar.**

The submitted organization/website is the identity anchor.

## Canonical organization fingerprint
Every screening must resolve and persist a canonical organization fingerprint before enrichment begins:

- submitted URL
- normalized root domain
- submitted/verified organization name
- organization type
- city
- state/region
- postal code when available
- street address when available
- phone number when available
- first-party social links when available
- first-party Google/Maps listing link when explicitly supplied or confidently verified

Never invent missing identity fields.

## Source priority
Use sources in this order:

1. **Submitted first-party website / submitted organization data**
2. **First-party pages on the same canonical domain**
3. **Verified organization-controlled profiles/listings**
4. **Third-party directories / review / local-news / community sources that pass entity matching**
5. **Generic search result snippets only as discovery leads, never as unquestioned evidence**

## Third-party entity match gate
Before any third-party source can influence a finding or score, the source must pass identity matching.

### Strong match signals
- exact canonical domain match
- exact address match
- exact phone match
- exact verified first-party profile link

### Supporting match signals
- normalized organization name
- same city
- same state
- same postal code
- matching leadership/contact details
- matching first-party social handle

### Hard rejection signals
Reject the source from scoring when:
- same/similar name but different state
- same/similar name but different city and no stronger matching identity
- conflicting phone/address/domain
- source clearly refers to another branch/campus/organization and the submitted target is not that branch
- identity remains ambiguous after reasonable verification

**When uncertain, exclude rather than contaminate the report.**

## Matching policy
A third-party source should be included only when:
- there is one strong identity signal, OR
- there are at least two supporting signals with no hard conflict.

Name-only match is never sufficient.

Store the match decision and rationale.

## Source provenance
Every external datum used in a screening should retain:
- source URL
- source type
- fetched/observed timestamp
- observed organization name
- observed location
- identity-match status: confirmed / rejected / ambiguous
- match basis
- confidence
- included_in_score boolean
- reason excluded when false

## Scoring rule
Only evidence that has passed the identity gate may affect a score.

Ambiguous or rejected evidence:
- may be logged for QA
- may not increase or decrease the organization's score
- may not appear in the customer-facing report as if it belongs to the organization

## First-party vs discovered data
Keep submitted/first-party facts separate from discovered third-party facts.

Never overwrite a verified first-party identity field with a third-party value without explicit validation.

## Screening reproducibility
Each completed screening should retain:
- input snapshot
- canonical organization fingerprint
- included source snapshot
- rejected/ambiguous source log
- rubric/scoring version
- category scores
- total score
- generated report snapshot

This lets PDM explain why a score was produced and compare re-screenings fairly.

## Rubric versioning
Do not silently change historical scores when scoring rules evolve.

Every run must reference a rubric version.

If a rubric changes:
- create a new version
- new screenings use the new version
- historical reports remain attached to the version used at the time

## Regression case: LifePoint / Lifepoint
Create an automated/manual QA fixture from the actual LifePoint screening that previously mixed another-state church information.

Do not guess which LifePoint is correct.

The test must start from the exact submitted screening URL and location, then verify:
- canonical domain is preserved
- city/state match the submitted target
- any same-name church in another state is rejected
- rejected sources do not affect scores
- report only displays evidence belonging to the intended organization
- source links and location are inspectable during QA

Add at least two more same-name-organization regression fixtures.

## Accuracy over completeness
A report with fewer verified facts is better than a fuller report containing someone else's data.
