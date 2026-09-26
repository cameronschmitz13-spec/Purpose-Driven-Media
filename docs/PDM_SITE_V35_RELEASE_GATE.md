# Canonical Site version 35 — unpublished review candidate

Canonical Site project: `appgprj_6a91991aec5881919b5beffad5e7b81f` (`purposedrivenmedia.group`). The exact source commit is `010187143e57f990838274328a42519dd23c86b8`; saved Site version 35 is `appgprj_6a91991aec5881919b5beffad5e7b81f~appgver_c6bff40b06748191b94074a53047a30c`. The build archive was attached to that saved version. **No deployment was created.** Version 34 remains live. The frontend source lives in the Site source repository, not this architecture/backend GitHub repository.

## Repair candidate

- `lib/pdm-fetch.ts` replaces the global fetch bridge with explicit authenticated requests to same-origin APIs. Admin, business, organization and report clients use it. Fresh validated Supabase identity takes precedence over any separate ChatGPT session; invalid explicit bearer credentials fail closed.
- `lib/portal-service.ts`, `app/api/session/route.ts`, `components/SupabaseOwnerGate.tsx` and four admin pages require a fresh, confirmed account identity and server owner check. The owner UI can distinguish missing session, wrong account and report-store errors.
- `app/api/admin/reports/route.ts` reads the business and organization stores directly, preserves all business screening history and exposes independent availability per source. `modules/business/app/admin/AdminDashboard.tsx` defaults to reports, reduces CRM clutter, shows history and preserves prior data on a transient source error. Business and organization deletion requests use the explicit authenticated fetch path. The old report backend's actual DELETE behavior was not changed in this candidate.
- `modules/business/components/{SampleReport,ReportView,ReportActions,BusinessPricing}.tsx` put the fictional sample through the real report UI, show the Category Leader Pattern, keep the 3-D map, label the sample prominently and avoid sending a fictional report ID/name into a real quote inquiry.
- `app/unified-report.css` repairs low-contrast text on light business result cards. Two CSS asset paths point to the files that actually exist. The copied report route and Cloudflare/TypeScript types were repaired.

## Evidence

- `npm run build`: passed. `npx tsc --noEmit --incremental false`: passed. `node --test tests/*.test.mjs`: 15 passed. Adjacent GitHub QA suite: 14 admin and 21 Advisor-core tests passed; `qa/advisor-schema/test.mjs`: 24 local PGlite assertions passed.
- Managed preview: homepage → full fictional `/business/sample` rendered executive readout, action plan, buyer path, Category Leader Pattern, pricing and report navigation; signed-out `/business/admin` displayed owner sign-in. Browser DOM color checks observed dark navy on buyer-path scores and leader-pattern text, dark bronze on cream mention chips. The preview runtime could not create WebGL2; it showed the map's data/control fallback. Actual 3-D rendering was **NOT RUN**.
- Signed-in owner report listing, open and delete; wrong-account browser switch; mobile/keyboard accessibility; live backend persistence; live Supabase RLS and cross-tenant tests: **NOT RUN**. The two report backend projects return `Sites project not found` through the connected workspace, and the live CDN returned Cloudflare 403/1010 to shell probes. Neither outcome proves report data loss or a customer-side authorization fix.
- Build warned about a large client chunk; Lighthouse, axe, provider integration, and independent performance/security scans were not run. Do not call the candidate production-ready from the local green checks.

## Release gate

**FAIL.** Restore authorized access to the two actual report stores and their secrets/bindings, verify an owner session opens every business/ministry/nonprofit history and deletes only a disposable report, verify nonowner denial and cross-tenant isolation, then test desktop/mobile report/map behavior. Keep the paid Advisor locked: the current Site has no production AI Elements/Gateway/Supabase report adapter or verified payment entitlement. The schema/core in this GitHub branch are foundations, not an unlocked chatbot. See `PDM_RELEASE_REVIEW_2026-09-25.md` and `ADVISOR_SCHEMA_STATUS.md` for independent findings and the remaining Advisor contract.
