# AGENTS.md — Purpose Driven Media

Read this file before changing the PDM website, screening product, copy, SEO, auth, data model, or campaign assets.

## Mission
Help businesses and organizations get **Found, Understood, and Connected** online.

## Core conversion idea
People cannot choose an organization they cannot find or understand.

The PDM Visibility Screening is the primary diagnostic mechanism. PDM services and software should be presented as practical responses to gaps the screening identifies.

## Primary audience
Small-business owners and organization leaders who:
- are unsure how visible they are online,
- may have a website or Google presence but do not know whether it is working,
- want clearer next steps and more qualified inquiries,
- are skeptical of generic marketing-agency promises.

## Primary CTA
Preferred:
`Start My Visibility Screening`

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

Read `docs/BRAND.md` before changing logos, lockups, audience taglines, or palette.

## Screening UX non-negotiable
Read:
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/VISIBILITY_SCREENING.md`

All screening types must use one shared UX system.

The current Non-Profit screening is the canonical interaction/visual reference.

Business, Ministry, Non-Profit, and Organization screenings may differ in configured copy/rubric where justified, but must not fork into unrelated interfaces.

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
- Explain exactly what a Visibility Screening checks.
- Put the sample report before the broad service menu.
- Prioritize mobile readability and CTA visibility.
- Use real proof near conversion points.

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
