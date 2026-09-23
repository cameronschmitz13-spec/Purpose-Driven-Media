# PDM 360° Brand Architecture

## Decision
PDM will use **PDM 360° Visibility Screening** as the customer-facing brand for the existing Visibility Screening product family.

This is a branding and communication upgrade.

It is **not**:
- a new scoring engine
- a new database model
- a separate report product
- a Growth Score
- a reason to duplicate Business, Non-Profit, Faith & Ministry, or Organization implementations

The existing product architecture remains the source of truth.

## Why 360° fits PDM
The screening already evaluates more than a website.

It examines the public journey through:
- identity
- search
- local presence
- reputation
- message clarity
- mobile experience
- freshness
- conversion readiness
- sector-specific next steps

The 360° concept communicates that breadth in a form prospects can understand immediately.

## Brand hierarchy

### Company
**Purpose Driven Media**

### Master promise
**Get Found, Understood, and Connected.**

### Diagnostic product
**PDM 360° Visibility Screening**

### Audience configurations
- **PDM 360° Business Visibility Screening**
- **PDM 360° Non-Profit Visibility Screening**
- **PDM 360° Faith & Ministry Visibility Screening**
- **PDM 360° Organization Visibility Screening**

### Score
**Visibility Score**

### Critical issue
**Critical Visibility Leak — Address Immediately**

### Context layer
**Market & Community Intelligence**

### Action layer
Use the existing hierarchy:
- **Fix First**
- **Improve Next**
- **Monitor**

## Core message
Preferred:

**See your organization from every angle.**

Expanded:

**See how people find, understand, trust, and connect with your organization—then know what to improve first.**

Alternative supporting line:

**A 360° view of your visibility, backed by evidence and built around your next best move.**

Do not claim the screening measures the entire health, growth potential, or financial strength of an organization.

## Found / Understood / Connected narrative
The master brand should become the simple story that makes the detailed report easy to understand.

### FOUND
Questions:
- Can people find the right organization?
- Is identity consistent?
- Does the organization appear in relevant search/local contexts?
- Are listings accurate and useful?

### UNDERSTOOD
Questions:
- Is the value/mission clear?
- Is current information easy to locate?
- Does the website make sense quickly?
- Is the experience credible and usable on mobile?

### CONNECTED
Questions:
- Can someone confidently take the next step?
- Is the primary CTA obvious and functional?
- Can a customer request a quote/book?
- Can a donor give?
- Can a volunteer apply?
- Can a church visitor find service/visit information?
- Can someone request help or make contact?

These are customer-facing narrative buckets, not a replacement for the canonical seven universal scoring categories plus sector module.

## Canonical score stays intact
The current 100-point structure remains:

### Universal core — 70
1. Findability and Identity
2. Local Presence and Reputation
3. Organic Search Visibility
4. Message Clarity
5. Mobile Experience and Performance
6. Conversion Readiness
7. Measurement and Freshness

### Sector module — 30
Configured for:
- Business
- Non-Profit
- Faith & Ministry
- General Organization

The 360° brand must map to this architecture rather than introduce a parallel taxonomy.

## Market & Community Intelligence
The report can become broader without corrupting the score.

Use a clearly separated contextual section for:
- 3-D geographic visualization
- demographic context
- Census/ACS estimates
- service-area context
- nearby organizations
- competitors/comparable organizations
- market/community characteristics
- evidence-backed strategic observations

Recommended label:

**360° Market & Community Intelligence**

Purpose:

**Help the organization understand what is happening around it and how that context should influence visibility decisions.**

This layer should not penalize an organization for market conditions outside its control.

## Website positioning

### Hero direction
Keep the main PDM brand visible.

Suggested structure:

Eyebrow:
**PDM 360° VISIBILITY SCREENING**

Headline:
**See Your Organization From Every Angle.**

Body:
**Find out how people discover you, understand you, trust what they see, and take the next step. PDM turns verified visibility evidence into a clear score, critical issues, and prioritized actions.**

Primary CTA:
**Start My 360° Visibility Screening**

Secondary CTA:
**See a Sample Report**

Supporting brand:
**Get Found, Understood, and Connected.**

### What the screening checks
Explain real dimensions instead of generic 360° language.

Recommended visual story:
- Found
- Understood
- Connected
- Verified evidence
- 100-point Visibility Score
- Critical Visibility Leaks
- Market & Community Intelligence
- Fix First / Improve Next / Monitor

### Sample report
Show the actual report structure before the broad service menu.

The sample should demonstrate:
- organization identity
- Visibility Score
- key action cards
- critical leak if applicable
- category scores
- evidence
- market/community intelligence
- 3-D geographic layer where appropriate
- next-step CTA

## Visual direction
The 360° identity should feel like an extension of PDM, not a separate brand.

Use:
- PDM navy
- PDM gold
- warm off-white
- double-chevron mark
- clear evidence/data presentation
- restrained circular/360 motifs only where they improve comprehension

Possible visual motifs:
- subtle ring framing around a score
- a four-sided or circular “view” metaphor
- directional chevrons
- connected evidence points
- geographic depth

Avoid:
- neon tech-company aesthetics
- fake radar charts
- decorative gauges with no methodology
- excessive gradients
- spinning 360 animations
- arbitrary new scores
- imagery implying surveillance

## Copy rules
Prefer:
- See your organization from every angle.
- Know how people find, understand, and connect with you.
- See what is working, what is leaking opportunity, and what to fix first.
- Evidence-backed visibility intelligence.
- A clearer view of your digital presence and local context.
- Turn visibility data into clear next steps.

Avoid:
- Complete business health scan
- Guaranteed growth
- Predict your revenue
- Total business intelligence
- AI knows everything about your market
- 360° Growth Score

## Evidence and trust
The 360° brand should strengthen trust by highlighting PDM's evidence discipline.

Where useful, explain:
- scored findings are tied to evidence
- third-party evidence must pass identity verification
- ambiguous/wrong-entity sources are excluded from scoring
- the report distinguishes score-bearing evidence from contextual intelligence

A useful trust phrase:

**Built on verified evidence—not name matches and guesswork.**

Do not imply every source or conclusion is infallible.

## Funnel role
The screening remains the front door to PDM.

Recommended flow:

PDM website
→ PDM 360° Visibility Screening
→ Visibility Score + evidence
→ Critical Visibility Leaks
→ Fix First / Improve Next / Monitor
→ Market & Community Intelligence
→ Visibility Roadmap / PDM review
→ implementation services / Director's Desk where appropriate

The free diagnostic should deliver genuine value and should not hide every useful result behind an appointment gate.

## Implementation guardrails
When applying this brand to the live website:

1. inspect the current Site first
2. preserve the existing screening engine
3. preserve the 70/30 scoring model
4. preserve `visibility-v1` versioning
5. preserve identity/evidence gating
6. preserve the unified screening UX
7. preserve sector configurations
8. preserve Critical Visibility Leak behavior
9. add 360° primarily through copy, visual hierarchy, report framing, and market/community context
10. do not create duplicate UI or database paths
11. verify Business, Non-Profit, Faith & Ministry, and Organization
12. run LifePoint identity regression before release
13. test desktop and mobile

## Success test
The rebrand is successful if a prospect understands within seconds that:

**PDM looks at the whole visibility journey—not just a website—and gives me evidence-backed priorities I can act on.**

The rebrand has failed if users believe PDM is claiming to measure every aspect of business growth or organizational health.
