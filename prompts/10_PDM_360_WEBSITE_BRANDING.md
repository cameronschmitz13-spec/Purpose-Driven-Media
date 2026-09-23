# PDM 360° Website Branding Implementation

Open the existing Purpose Driven Media website and the `Purpose-Driven-Media` repository.

Read first:
- `AGENTS.md`
- `docs/BRAND.md`
- `docs/PDM_360_BRAND_ARCHITECTURE.md`
- `docs/VISIBILITY_SCREENING.md`
- `docs/SCORING_ARCHITECTURE.md`
- `docs/UNIFIED_SCREENING_UX.md`
- `docs/SCREENING_ACCURACY_AND_IDENTITY.md`
- `docs/SWEEPING_UPDATE_STATUS.md`

## Objective
Apply the approved **PDM 360° Visibility Screening** brand to the live website and screening experience without rebuilding or replacing the existing screening architecture.

This is primarily a branding, copy, visual hierarchy, and report-framing update.

## Non-negotiable product boundaries
Preserve:
- the existing Visibility Screening engine
- the 100-point Visibility Score
- the 70-point universal core
- the 30-point sector module
- `visibility-v1` versioning
- identity/source verification rules
- Critical Visibility Leak behavior
- the shared Business / Non-Profit / Faith & Ministry / Organization UX system
- Supabase Auth/data/RLS architecture
- current evidence provenance
- existing 3-D geographic capability

Do NOT:
- create a Growth Score
- create a second 360 score
- invent an overlapping 360 scoring taxonomy
- add market/demographic facts to the score without a documented rubric change
- fork sector screenings into separate visual products
- rebuild working components from scratch
- publish while existing release blockers fail

## Approved product naming
Master company:
**Purpose Driven Media**

Master promise:
**Get Found, Understood, and Connected.**

Flagship diagnostic:
**PDM 360° Visibility Screening**

Audience configurations:
- **PDM 360° Business Visibility Screening**
- **PDM 360° Non-Profit Visibility Screening**
- **PDM 360° Faith & Ministry Visibility Screening**
- **PDM 360° Organization Visibility Screening**

Score:
**Visibility Score**

Critical issue:
**Critical Visibility Leak — Address Immediately**

Context layer:
**360° Market & Community Intelligence**

## Homepage direction
Inspect the current homepage before editing.

Integrate PDM 360° as the strongest diagnostic/conversion mechanism without erasing the core PDM brand.

Preferred message hierarchy:

Eyebrow:
**PDM 360° VISIBILITY SCREENING**

Headline:
**See Your Organization From Every Angle.**

Supporting copy:
**Find out how people discover you, understand you, trust what they see, and take the next step. PDM turns verified visibility evidence into a clear score, critical issues, and prioritized actions.**

Primary CTA:
**Start My 360° Visibility Screening**

Secondary CTA:
**See a Sample Report**

Reinforce:
**Get Found, Understood, and Connected.**

Do not force this exact copy into a layout where a shorter variant is clearly stronger, but preserve the meaning and naming.

## Screening explanation
Use the Found / Understood / Connected framework as the simple customer-facing story.

### Found
Explain discovery, identity, search, local presence, and listings.

### Understood
Explain message clarity, current information, trust, usability, and mobile experience.

### Connected
Explain next-step readiness: contact, quote, booking, visit, donation, volunteering, prayer/help, or other sector-appropriate action.

Do not collapse the actual scoring engine into only these three buckets.

## Report branding
Update report framing so the result clearly feels like a **PDM 360° Visibility Report** while preserving actual score logic.

The report should continue to show:
- organization identity
- report status
- Visibility Score
- Critical Visibility Leaks
- Fix First
- Improve Next
- Monitor
- detailed category scores
- evidence/explanations
- progress/history where available
- next-step CTA

Where actual data supports it, add or clearly label:

**360° Market & Community Intelligence**

This may include:
- geography
- service area
- Census/ACS demographic context
- nearby organizations
- competitors/comparable organizations
- local market/community observations
- the existing 3-D map

Keep contextual intelligence visually separate from the mathematical Visibility Score.

## Trust language
Where useful, surface PDM's evidence discipline.

Preferred phrase:
**Built on verified evidence—not name matches and guesswork.**

Do not overstate certainty.

Make it clear when information is:
- verified/scored evidence
- contextual third-party data
- estimated
- unavailable
- excluded due to identity ambiguity

## Visual direction
Build on the existing PDM identity:
- PDM Navy `#0A2B4F`
- PDM Gold `#C99A22`
- warm off-white
- PDM double-chevron mark

Use 360° motifs sparingly:
- subtle rings
- depth/layers
- connected evidence points
- geographic context
- a restrained circular framing device if useful

Avoid:
- fake radar charts
- meaningless gauges
- generic AI-dashboard aesthetics
- neon tech styling
- excessive gradients
- distracting 360 animations
- new decorative scores

## Sector consistency
Verify the same brand and report system across:
- Business
- Non-Profit
- Faith & Ministry
- General Organization

Sector wording and rubric configuration may differ.

Visual architecture should not.

## Work sequence
1. Inspect the current live Site and existing reusable components.
2. Compare current homepage/screening copy against the approved 360° brand architecture.
3. Identify the smallest coherent set of edits.
4. Apply the PDM 360° name and narrative.
5. Preserve and reuse existing working components.
6. Update homepage screening section/CTA.
7. Update screening introduction/configuration copy.
8. Update report headings/framing where safe.
9. Integrate Market & Community Intelligence labeling around the existing 3-D/context features.
10. Verify no scoring behavior changed unintentionally.
11. Verify no duplicate sector UI was introduced.
12. Run the LifePoint identity regression.
13. Test Business, Non-Profit, Faith & Ministry, and Organization flows.
14. Test mobile and desktop.
15. Verify auth/session/data ownership remain intact.
16. Run available QA/build/lint/tests.
17. Publish only if existing release blockers pass.

## Final report
At completion, report:
- pages/components changed
- copy/naming changed
- whether scoring logic changed (expected: no)
- whether database schema changed (expected: no unless genuinely required)
- sector paths tested
- LifePoint regression result
- mobile/desktop results
- remaining blockers
- recommended next highest-impact branding/CRO improvement

## Success standard
The finished site should make a prospect understand quickly:

**PDM looks at the whole visibility journey—not just a website—and gives me evidence-backed priorities I can act on.**

Do not turn PDM 360° into a claim that PDM measures every aspect of business growth or organizational health.
