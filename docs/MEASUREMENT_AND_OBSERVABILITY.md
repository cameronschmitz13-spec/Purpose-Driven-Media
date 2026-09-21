# PDM Measurement and Observability

## Goal
Measure whether the site and screening product work without creating noisy analytics.

## Core conversion events
Track consistently across all screening types:
- homepage_primary_cta_click
- sample_report_open
- screening_started
- screening_identity_resolved
- screening_completed
- report_viewed
- account_signup_started
- account_signup_completed
- login_completed
- saved_report_reopened

## Accuracy / pipeline observability
Internal operational events should capture:
- source_candidate_found
- source_identity_confirmed
- source_identity_rejected
- source_identity_ambiguous
- screening_failed
- scoring_failed
- report_generation_failed

Do not log passwords, auth tokens, secret keys, or sensitive raw credentials.

## Dimensions
Useful non-sensitive dimensions:
- screening_type
- rubric_version
- category_key
- device_class
- route
- failure_code

Do not send unnecessary PII into analytics.

## Funnel
Monitor:
1. landing page visit
2. screening CTA
3. screening start
4. identity confirmation
5. screening completion
6. report viewed
7. account/save action

## QA
Every instrumented event should fire once per intended action.

Prevent duplicate events caused by rerenders/navigation retries.
