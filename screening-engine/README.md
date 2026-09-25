# PDM Screening Engine

Deterministic, provider-neutral orchestration around the canonical PDM `visibility-v1` score.

Read `docs/SCREENING_ENGINE_STACK.md` first.

## Run locally

```bash
deno run --allow-read screening-engine/cli.ts path/to/screening-input.json
```

## Test

```bash
deno test --allow-read screening-engine/tests
```

## Production rule

The engine can preview the score and generate a validated payload, but persisted production scoring must still go through the existing Supabase `finalize-screening-score` boundary.

## Collector contract

Collectors may be manual, browser-driven, API-based, or AI-assisted. They must emit `CandidateSource` records and must never directly change the score.

## Assessor contract

Assessment logic produces exactly:
- 7 universal ratings
- 6 sector ratings

Each rating is 0–4 and carries evidence/provenance.

If an assessment cites a discovered source that the identity gate rejects or marks ambiguous, the run fails closed rather than scoring contaminated evidence.
