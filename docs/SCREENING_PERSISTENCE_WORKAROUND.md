# Screening Persistence Workaround

## Incident

The production site can authenticate with Supabase and read `site_screening_reports`, but completed screenings were not being persisted. Production request traces showed reads and authentication traffic but no screening report write request.

The normalized `visibility-v1` screening tables intentionally do not accept direct browser writes. Do not loosen RLS to work around this.

## Production workaround

Use the authenticated RPC:

`public.site_save_screening_report`

This persists a completed user-supplied/provisional report to `public.site_screening_reports` without depending on automated enrichment, research services, or the normalized scoring pipeline.

## Required browser flow

1. Wait until the Supabase auth session is ready.
2. When a completed screening has a report snapshot, create one UUID for that completed screening.
3. Persist that UUID alongside the in-memory/local screening state.
4. Call `site_save_screening_report`.
5. If the request fails because of a transient/network problem, retry with the same UUID.
6. Show a "saved" state only after the RPC succeeds.
7. Do not regenerate the UUID for a retry, or the retry can become a separate report.
8. Automated research/enrichment must be non-blocking. A research failure must not prevent the provisional report from being saved.

## Client example

```ts
const reportId =
  existingReportId ?? crypto.randomUUID();

// Persist reportId with the completed local screening state before the request,
// so a retry after navigation/reload can reuse the same ID.

const { data: savedId, error } = await supabase.rpc(
  "site_save_screening_report",
  {
    p_screening_type: screeningType,
    p_organization_name: organizationName,
    p_input_snapshot: inputSnapshot,
    p_report_snapshot: reportSnapshot,
    p_display_score: displayScore ?? null,
    p_report_id: reportId,
  },
);

if (error) {
  // Keep the completed screening locally and present a retry action.
  // Do not claim the report was saved.
  throw error;
}

// Only now mark the screening as persisted.
```

## Security properties

- Requires an authenticated Supabase user.
- Anonymous execution is revoked.
- Runs as `SECURITY INVOKER`; RLS remains active.
- The database forces `created_by = auth.uid()`.
- Validates screening type, organization name, JSON shape/size, and display score.
- A repeated save with the same report UUID by the same owner returns the existing report ID instead of inserting a duplicate.

## Verification already performed

Production validation used the authenticated Postgres role with a real signed-in user identity inside a transaction:

- first save with a fixed report ID: accepted
- retry with the same report ID: accepted
- resulting row count: exactly 1
- transaction: rolled back, so no test report remains

## Do not do this

- Do not enable broad client INSERT/UPDATE access on the normalized screening tables.
- Do not expose a service-role/secret key to the browser.
- Do not make report persistence dependent on legacy research endpoints.
- Do not silently discard a completed screening when saving fails.
