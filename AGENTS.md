# AGENTS.md — Purpose Driven Media

Read this file before changing the PDM website, screening product, copy, SEO, auth, data model, or campaign assets.

## Mission
Help businesses and organizations get **Found, Understood, and Connected** online.

## Core conversion idea
People cannot choose an organization they cannot find or understand.

The PDM Visibility Screening is the primary diagnostic mechanism. Customer-facing branding may present it as the **PDM 360° Visibility Screening**.

The 360° name is a brand/communication layer, not a second scoring engine or separate product architecture.

PDM services and software should be presented as practical responses to gaps the screening identifies.

## Primary audience
Small-business owners and organization leaders who:
- are unsure how visible they are online,
- may have a website or Google presence but do not know whether it is working,
- want clearer next steps and more qualified inquiries,
- are skeptical of generic marketing-agency promises.

## Primary CTA
Preferred:
`Start My 360° Visibility Screening`

Preferred secondary CTA:
`See a Sample Report`

Do not create several competing hero CTAs without a conversion reason.

## Brand
- Deep navy
- Warm gold
- White / warm cream
- PDM double-chevron mark
- Professional, direct, modern
- Vibrant accents are welcome without abandoning navy/gold identity

Primary line:
`Get Found, Understood, and Connected.`

Screening product brand:
`PDM 360° Visibility Screening`

Core screening promise:
`See your organization from every angle people use to find, understand, trust, and connect with you.`

Read `docs/BRAND.md` and `docs/PDM_360_BRAND_ARCHITECTURE.md` before changing logos, lockups, audience taglines, screening naming, or palette.

## 360° brand guardrails
The 360° concept must strengthen the existing product rather than replace it.

Never:
- create a second 360 scoring engine
- rename the existing Visibility Score to a Growth Score
- invent new scored dimensions that overlap the canonical scoring architecture
- treat demographics, market context, or geography as performance scores unless a documented rubric criterion explicitly scores them
- remove the Found / Understood / Connected master brand framework
- fork Business, Non-Profit, Faith & Ministry, or Organization into separate product architectures

The canonical scoring source of truth remains `docs/SCORING_ARCHITECTURE.md`.

## PDM 360° Advisor non-negotiable
Read:
- `docs/PDM_360_ADVISOR.md`
- `docs/PDM_360_ADVISOR_TECH_STACK.md`

**PDM 360° Advisor** is the paid conversational intelligence layer attached to an authorized completed screening.

Customer-facing CTA:
`Ask PDM 360°`

The Advisor must:
- ground answers in the user's actual authorized screening/report
- preserve source identity/evidence rules
- verify material claims before answering
- distinguish evidence, calculation, inference, estimate, and missing data
- remain read-only against canonical Visibility Scores/findings
- enforce paid entitlement server-side
- use sector-appropriate strategy for Business, Non-Profit, Faith & Ministry, and Organization
- avoid impersonating or implying endorsement by public personalities
- never expose or persist hidden chain-of-thought

If no real payment system exists, do not fake payment. Build the entitlement boundary and locked state, then document billing as a release dependency.

Advisor implementation defaults:
- Vercel AI SDK for primary chat/tool runtime
- AI Elements for UI
- Supabase for auth/data/entitlements/retrieval
- AI Gateway for model routing/cost control
- Stripe for trusted payment-to-entitlement when billing is implemented
- OpenAI Agents SDK TypeScript only for complex specialist delegation/verification

Use single-agent/deterministic paths first. Do not introduce CrewAI, LangGraph, LangGraph Swarm, or Microsoft Agent Framework into v1 without a proven requirement.

## Screening UX non-negotiable
Read:
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/VISIBILITY_SCREENING.md`
- `docs/PDM_360_BRAND_ARCHITECTURE.md`

All screening types must use one shared UX system.

The current Non-Profit screening is the canonical interaction/visual reference.

Business, Faith & Ministry, Non-Profit, and Organization screenings may differ in configured copy/rubric where justified, but must not fork into unrelated interfaces.

## Screening accuracy non-negotiable
Read:
`docs/SCREENING_ACCURACY_AND_IDENTITY.md`

Never use third-party evidence based on organization-name similarity alone.

The submitted target is the identity anchor.

Same-name organizations in a different city/state/domain must not contaminate a screening or score.

When identity is ambiguous, exclude the source from scoring.

Accuracy is more important than completeness.

## Auth and data
Read:
`docs/SUPABASE_AUTH_AND_DATA.md`

Use Supabase Auth as the authentication source of truth.

Never:
- store plaintext passwords
- commit secrets
- expose secret/service-role keys in public clients
- use user-editable metadata as authorization truth

Enable and verify RLS for exposed application data.

## Trust rules
Never fabricate:
- testimonials
- ratings
- customer counts
- revenue lifts
- awards
- case-study outcomes
- software capabilities
- screening results presented as real

Fictional sample reports must be clearly labeled as fictional/sample.

## CRO rules
- First screen should communicate audience + problem + mechanism + CTA.
- Diagnose first, prescribe second.
- Explain exactly what the PDM 360° Visibility Screening checks.
- Put the sample report before the broad service menu.
- Prioritize mobile readability and CTA visibility.
- Use real proof near conversion points.
- Use 360° to communicate breadth, not hype.

## SEO rules
- One meaningful H1.
- Intent-aligned title and meta.
- Canonical homepage must exclude tracking parameters such as fbclid/UTMs.
- Verify robots.txt, sitemap, canonical, indexability, and rendered content.
- Structured data must match visible content.
- Do not create thin location/industry pages just to target keywords.

## Usage-efficient execution
Read `docs/IMPLEMENTATION_SKILLS.md`.

Use the least-expensive capable model/skill for each phase.

Do not load every skill or all project history into every run.

## Change discipline
Before editing:
1. inspect the current implementation
2. identify reusable components
3. identify what already matches
4. identify duplicated screening/scoring logic
5. make the smallest high-impact changes
6. test desktop and mobile
7. preserve working functionality
8. verify data accuracy before declaring success

At completion report:
- files/areas changed
- tests performed
- accuracy regressions tested
- assumptions needing human verification
- next highest-impact task
