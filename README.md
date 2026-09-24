# Purpose Driven Media

Purpose Driven Media helps businesses and organizations get **Found, Understood, and Connected** online.

This repository is the working source of truth for PDM's website conversion strategy, **PDM 360° Visibility Screening** positioning, scoring architecture, SEO, trust/proof standards, and ChatGPT Work/Codex execution prompts.

## Start here
1. Read `AGENTS.md`
2. Read `docs/AGENT_ORCHESTRATION.md`
3. For screening/product work, read `docs/PDM_360_BRAND_ARCHITECTURE.md`
4. Choose the relevant task prompt from `/prompts`
5. Let the agent inspect the implementation before editing

## Core strategy
The **PDM 360° Visibility Screening** is the customer-facing brand for PDM's diagnostic mechanism.

**Diagnose first. Prescribe second.**

Use the screening to show what is working, what is unclear or missing, what context matters, and what should be fixed first. PDM services and software should follow from those identified needs.

The 360° concept is a branding/narrative layer. It does not replace the canonical 100-point Visibility Score, 70/30 scoring architecture, evidence gate, or sector configurations.

## Master positioning
**Get Found, Understood, and Connected.**

Core product message:

**See your organization from every angle.**

Expanded:

**See how people find, understand, trust, and connect with your organization—then know what to improve first.**

## Repository structure

```text
AGENTS.md
docs/
  BRAND.md
  PDM_360_BRAND_ARCHITECTURE.md
  PDM_360_ADVISOR.md
  PDM_360_ADVISOR_TECH_STACK.md
  VISIBILITY_SCREENING.md
  SCORING_ARCHITECTURE.md
  UNIFIED_SCREENING_UX.md
  SCREENING_ACCURACY_AND_IDENTITY.md
  CRO_BASELINE.md
  SEO_BASELINE.md
  AGENT_ORCHESTRATION.md
prompts/
  01_HOMEPAGE_CRO.md
  02_VISIBILITY_SCREENING.md
  03_TRUST_PROOF.md
  04_TECHNICAL_SEO.md
  05_MOBILE_UX.md
  06_SEARCH_CONSOLE.md
  07_RELEASE_QA.md
  08_CHATGPT_SITES_IMPLEMENTATION.md
  09_SWEEPING_PDM_ACCURACY_UX_AUTH_UPDATE.md
  10_PDM_360_WEBSITE_BRANDING.md
  11_PDM_360_ADVISOR_IMPLEMENTATION.md
```

## Model routing
See `docs/AGENT_ORCHESTRATION.md` for the HuggingGPT-inspired plan → select → execute → QA workflow and usage-optimized model guidance.

## Trust rule
Never fabricate testimonials, ratings, customer counts, revenue lifts, awards, client outcomes, or software capabilities. Fictional screening samples must be clearly labeled as fictional.

## Sweeping screening update
For the current comprehensive product/auth/accuracy implementation, run:

`prompts/09_SWEEPING_PDM_ACCURACY_UX_AUTH_UPDATE.md`

Key supporting files:
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/SCREENING_ACCURACY_AND_IDENTITY.md`
- `docs/SCORING_ARCHITECTURE.md`
- `docs/SUPABASE_AUTH_AND_DATA.md`
- `docs/MEASUREMENT_AND_OBSERVABILITY.md`
- `qa/fixtures/lifepoint_chillicothe_mo.json`
- `supabase/migrations/0001_screening_schema.sql`
- `supabase/migrations/0002_rls_and_auth_helpers.sql`

The LifePoint Chillicothe identity regression is release-blocking for screening-engine changes.

## PDM 360° website branding
For the approved customer-facing 360° rebrand, use:

`prompts/10_PDM_360_WEBSITE_BRANDING.md`

This prompt is intentionally constrained to preserve the existing product architecture.

Read first:
- `docs/PDM_360_BRAND_ARCHITECTURE.md`
- `docs/BRAND.md`
- `docs/VISIBILITY_SCREENING.md`
- `docs/SCORING_ARCHITECTURE.md`

## PDM 360° Advisor
The paid post-screening AI layer is specified in:

`docs/PDM_360_ADVISOR.md`

Implementation prompt:

`prompts/11_PDM_360_ADVISOR_IMPLEMENTATION.md`

The Advisor is designed to be screening-specific, evidence-aware, entitlement-gated, sector-aware, and verification-first. It must not become a generic chatbot or a second scoring engine.

Approved implementation stack:

`docs/PDM_360_ADVISOR_TECH_STACK.md`

Default: **Vercel AI SDK + AI Elements + Supabase + AI Gateway + Stripe**, with **OpenAI Agents SDK TypeScript** reserved for complex delegated/verification workflows. Do not add a heavier orchestration framework to v1 without a concrete requirement.

The repository currently does not contain a production payment/subscription system, so the implementation must use a provider-neutral server-side entitlement boundary and must not fabricate checkout/payment state.

The live website is edited in ChatGPT Sites; repository commits do not automatically publish the Site.
