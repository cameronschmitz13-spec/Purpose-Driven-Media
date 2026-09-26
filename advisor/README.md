# PDM 360° Advisor core — unreleased foundation

`core.ts` is a dependency-free, read-only reasoning core. It is **not a deployed Advisor**, an authentication layer, a payment implementation, or a replacement scoring engine.

Run the deterministic regression suite with Node 24 or newer:

```sh
node --test qa/advisor/core.test.mjs
```

The server adapter must authenticate the current Supabase user, verify active organization membership and access to the exact completed report, validate an unexpired/unrevoked server-owned Advisor entitlement, reserve the request budget, and assemble context before calling `runAdvisor`. Never accept `AdvisorContext` directly from a browser. Authorize every historical report separately. Exact leak counts and category values must come from the canonical report, not a truncated retrieval subset.

The core implements exact Tier 0 score/leak/lowest-category answers without provider calls. Lowest category means percentage of available category points; all ties are returned. It preserves canonical scores and rubric versions. Tier 1 interpretation, Tier 2 strategy and Tier 3 complex questions use injectable generation and independent verification callbacks. Each callback must be a distinct model invocation; wrapping a shared function twice does not constitute verification. Use Vercel AI SDK with structured schemas and currently available OpenAI models through AI Gateway in the server adapter. Model IDs, credentials, retries/timeouts, token budgets and cost telemetry belong in that adapter.

Source and finding retrieval filters exact organization/run scope, confirmed identity and scored-source inclusion before ranking. Contextual evidence remains labeled and cannot become a scored finding. Rejected/ambiguous sources never enter the model context. Each answer claim needs resolving references and a supported independent verification verdict. Unknown citations, unsupported numeric quantities, contradictory claims, malformed output and provider failures are removed or produce an explicit insufficient-data response. No draft is streamed before verification. Only explicit answer fields and compact verdict metadata are returned, never arbitrary reasoning fields.

Evidence is bounded to 8/16/24 items for Tiers 1/2/3, with bounded excerpts and up to 12 claims. These are safety ceilings, not semantic retrieval: the adapter must retrieve a small relevant set using structured queries, including the needed category/finding/source relationships. General strategic questions require actual findings or verified sources. Requests needing more context should fetch a new scoped subset rather than dump an organization's entire dataset.

The tests exercise all four sector policies, exact decimal retrieval and calculations, the existing LifePoint fixture's already-decided source identity statuses, ambiguous/rejected exclusion, context scope, citations, verifier failures, malformed output, prompt/data separation and evidence limits. Mock provider tests **do not prove real-model injection resistance**, source identity classification, live RLS isolation, entitlement security or production answer quality. The LifePoint test consumes the persisted identity gate; it does not replace the identity resolver regression.

Release blockers remain: real Supabase report migration/linkage from legacy data; authentication/entitlement API and RLS tests; persistence/budgets; current Gateway model configuration and independent live-provider evaluations; AI Elements integration; mobile/desktop accessibility/browser verification; trusted payment-to-entitlement integration. Keep the production Advisor locked until those pass. No database schema, RLS policy or live website was changed by this core.
