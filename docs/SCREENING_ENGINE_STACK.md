# PDM Reproducible Screening Engine

## Purpose

This document defines the reusable execution stack for PDM 360° Visibility Screenings.

The engine does **not** create a second scoring system. Production scoring remains the canonical `visibility-v1` 100-point model documented in `docs/SCORING_ARCHITECTURE.md` and finalized by the existing Supabase transactional score finalizer.

The new engine standardizes the work that happens around that canonical score:

```text
TARGET
  ↓
IDENTITY FINGERPRINT
  ↓
COLLECTORS / PUBLIC & AUTHORIZED SOURCES
  ↓
IDENTITY GATE
  ↓
NORMALIZED EVIDENCE
  ↓
CRITERION ASSESSMENTS (0–4)
  ↓
EVIDENCE VALIDATION
  ↓
visibility-v1 FINALIZER PAYLOAD
  ↓
CRITICAL VISIBILITY LEAKS
  ↓
TOP 3 PRIORITIES
  ↓
REPORT SNAPSHOT
  ↓
HUMAN VERIFICATION / SEND
```

## Chosen stack

### Runtime
- TypeScript on Deno-compatible APIs.
- Works in local scripts, CI, and Supabase Edge Function environments.
- No multi-agent framework is required for the deterministic core.

### Canonical persistence
Existing Supabase tables remain the source of truth:
- `organizations`
- `screening_runs`
- `screening_sources`
- `screening_findings`
- `screening_reports`
- `audit_events`

### Existing production boundaries retained
- `start-screening-run` creates the immutable-at-start run and rubric snapshot.
- `evaluate-source-identity` remains the production identity decision boundary.
- `finalize-screening-score` remains the production score commit boundary.
- RLS and service-only write controls remain unchanged.

### Collection layer
Collectors are replaceable adapters. They may gather:
- submitted/first-party website pages
- web search results
- local-business / maps information
- verified organization-controlled social profiles
- local news/community sources
- PageSpeed / Lighthouse / CrUX
- Google Search Console / GA4 when authorized
- CRM, email, booking, giving, or sector-specific systems when authorized

Collectors must output normalized candidate source records. They never score directly.

## Identity gate

Every discovered source is evaluated before it can influence a criterion.

The submitted organization is the anchor. Name similarity alone is never sufficient.

A source is one of:
- `confirmed`
- `ambiguous`
- `rejected`

Only `confirmed` sources may influence a score.

The LifePoint Chillicothe fixture is a release-blocking regression:
- exact Chillicothe/phone evidence with one stale address can remain confirmed and become a listing-consistency finding
- a same-name Tennessee church must be rejected
- rejected or ambiguous evidence must have zero scoring impact

## Evidence contract

Every candidate source should retain:
- stable source id within the run
- URL
- source type
- fetched/observed timestamp
- observed organization identity fields
- identity decision
- decision rationale
- confidence
- field conflicts/differences
- extracted observations used by assessors

Every scored criterion stores:
- rating 0–4
- scope: universal or sector
- criterion key
- confidence
- explanation
- evidence basis
- source ids used
- optional Critical Visibility Leak flag

## Missing-data rule

Missing integrations do not automatically reduce a score.

Use evidence basis `not_connected` when a metric requires unavailable private data. Assess only what can be responsibly observed under the rubric and explain the limitation.

## Rubric

The engine mirrors `visibility-v1` only to validate inputs and preview the deterministic total.

Production persistence must still call the Supabase finalizer.

Universal core — 70:
- findability_identity
- local_presence_reputation
- organic_search_visibility
- message_clarity
- mobile_experience_performance
- conversion_readiness
- measurement_freshness

Each universal category weighs 10.

Sector module — 30:
- six sector areas
- each weighs 5

Formula:
`points = (rating / 4) × weight`

Critical Visibility Leaks are explicit flags and do not silently rewrite the mathematical total.

## Priority ordering

The engine produces a deterministic priority list:
1. Critical Visibility Leaks first
2. then lower-rated criteria
3. then higher-weight criteria
4. then higher-confidence criteria
5. stable key order as the tie-breaker

The first three become the default Top 3 priorities. A human reviewer may change narrative wording but must not rewrite source evidence or score math without a new assessment.

## Report generation

The engine outputs a JSON report snapshot suitable for:
- PDM dashboard rendering
- DOCX/PDF generation
- PDM 360° Advisor grounding
- future before/after comparisons

The report snapshot includes:
- canonical identity
- rubric version
- calculated score preview
- category/sector assessment summaries
- Critical Visibility Leaks
- Top 3 priorities
- accepted evidence
- excluded/ambiguous evidence log
- provenance timestamp

## Human approval gate

A screening is not client-ready until a reviewer confirms:
- target identity
- every Critical Visibility Leak
- the Top 3 priorities
- conflicting first-party facts
- any material claim that could change a customer's decision
- report wording does not imply unavailable private analytics

## What this stack intentionally does not do

- no second PDM 360 score
- no free-form LLM score generation
- no name-only entity matching
- no silent score changes between runs
- no automatic use of rejected/ambiguous sources
- no punishment for missing private integrations
- no claims of guaranteed rankings, leads, attendance, donations, or revenue
