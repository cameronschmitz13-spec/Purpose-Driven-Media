# Sol handoff execution progress — 2026-09-27

**Release verdict: FAIL.** This follows the September 27 diagnostic handoff. Canonical PDM Site source commit `51098884fdbeb29dd34bcfe1bde09ae5943808ad` was pushed to its Sites source repository and saved as **version 36, unpublished** (`appgprj_6a91991aec5881919b5beffad5e7b81f~appgver_49bcbc8d72fc8191bcefab2a313f4d8d`). Production remains version 34; saved version 35 is also unpublished. No report, schema, entitlement, payment or mailbox data was changed.

## Completed in Site source

| Handoff finding | Change | Verification |
| --- | --- | --- |
| Admin login hydration mismatch | `app/login/page.tsx` resolves a validated `return_to` on the server and passes it to `components/SupabaseLogin.tsx`. The initial markup and client now show the same admin copy. | Direct preview hard load at `/login?return_to=/business/admin` showed admin copy and no application text-hydration error. A browser-agent extension added an unrelated `<html>` attribute warning; a Vinext `crypto.subtle` client-navigation error was observed in HTTP preview, without establishing production behavior. |
| Account switching exposes stale private client state | `SupabaseAccountHub`, `SupabaseBusinessReport` and `SupabaseOwnerGate` subscribe to auth changes; report state clears on principal change, stale responses are ignored, and owner gate rechecks privileges. Unavailable account data no longer says zero reports. | Build/typecheck/targeted lint pass. A live A→B multi-tab authenticated test remains NOT RUN. |
| Saved organization opens a new scan | `modules/organization/app/page.tsx` selects `SavedOrganizationReport` from stored score, category JSON, evidence and original date. Rerun remains a separate link creating a new dated run. The interactive 3-D map is available as current context and labeled separately from the saved score. | Two behavior-oriented SSR component tests pass for exact 48/100, original date, access-gated references and unsafe-link rejection. Authenticated original-report flow with upstream services offline remains NOT RUN. |
| Historical maximum mixed with current report/Advisor preview | Current screening score now drives the main gauge, print score, potential lift and Advisor preview context. Best history is labeled separately. | Typecheck and build pass; numeric browser fixture remains NOT RUN. |
| Unhandled business report backend outage | Single-report read catches storage failure and returns safe private JSON 503. | Build/typecheck pass; controlled 503 integration test remains NOT RUN. |
| Owner password reset missing | Added Supabase reset-request form and `/reset-password` page using Auth `resetPasswordForEmail` and `updateUser`, with existing callback exchange. | Browser form navigation observed without sending a message. Real mailbox receipt and Auth redirect allowlist remain NOT RUN. |

**Local checks:** `npm run build` PASS; `npx tsc --noEmit` PASS; targeted ESLint on new/changed small files PASS; `node --test tests/*.test.mjs` **17/17 PASS**; `pdm-repo/qa/admin-access.test.mjs` **14/14 PASS**. The whole Site lint suite has pre-existing unrelated errors in several components; do not report global lint green. Existing report tests remain partly source-string checks and cannot replace authenticated browser verification.

## Still blocked for Sol

1. **Report store recovery and owner-wide access:** both legacy backend project IDs still return `Sites project not found` through the selected Sites workspace. No export/backup or current active backend source is accessible here; Supabase still had zero imported organizations/runs/reports at the diagnostic. Locate the authorized workspace and preserve/export real records before consolidation. Production owner list/open/delete cannot be certified.
2. **Exact business report deletion:** current Site's admin still issues `mode=latest` against the old business backend. Implement stable selected report-ID deletion and atomic aggregate update in the **current backend**, then wire history-row UI. Its current source/runtime was unavailable; replacing only the Site button would target an unsupported endpoint. Never delete a real customer report as a test.
3. **Independent verification:** no independent fixer/verifier review completed on the Site changes; run A/B account-switch, saved report, 503, and password-recovery regressions with disposable accounts and record counts before any deploy.
4. **Broader product blockers:** General Organization path and canonical 70/30 scoring, current GAP transfer, Titan mailbox connection, server-backed paid Advisor entitlement/model/UI, and full mobile/accessibility/performance checks remain as described in the handoff.

Continue at the recovery/access boundary and current backend contract. Keep Site version 36 unpublished until owner history/reopen/delete and relevant release gates pass. Mark every unrun flow `NOT RUN`, not PASS.
