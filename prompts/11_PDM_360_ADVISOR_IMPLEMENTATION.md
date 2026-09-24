# PDM 360° Advisor — Paid AI Implementation

Open the existing Purpose Driven Media project and the `Purpose-Driven-Media` repository.

Read first:
- `AGENTS.md`
- `docs/PDM_360_ADVISOR.md`
- `docs/PDM_360_ADVISOR_TECH_STACK.md`
- `docs/PDM_360_BRAND_ARCHITECTURE.md`
- `docs/VISIBILITY_SCREENING.md`
- `docs/SCORING_ARCHITECTURE.md`
- `docs/SCREENING_ACCURACY_AND_IDENTITY.md`
- `docs/SUPABASE_AUTH_AND_DATA.md`
- `docs/SITE_SUPABASE_INTEGRATION_CONTRACT.md`
- `docs/SWEEPING_UPDATE_STATUS.md`

## Objective
Implement **PDM 360° Advisor**, a paid conversational AI strategy layer attached to each completed PDM 360° Visibility Screening.

Customer-facing label:
**Ask PDM 360°**

This must be a screening-grounded advisor, not a generic chatbot.

## Approved technical stack

Use the architecture in `docs/PDM_360_ADVISOR_TECH_STACK.md`.

Default implementation:

- **Vercel AI SDK** — primary streaming chat, structured output, tool calling, and single-agent runtime
- **Vercel AI Elements** — report-embedded chat UI; install only the components actually needed
- **Supabase** — Auth, report ownership, entitlements, screening context, conversations, citations, verification metadata, RLS
- **Vercel AI Gateway** — model/provider routing, current model selection, cost/fallback control
- **Stripe** — preferred payment integration when the real billing flow is implemented; verified webhook grants/revokes server-side entitlement
- **OpenAI Agents SDK TypeScript** — optional Tier-3 specialist delegation/verification only

Do not begin by adding CrewAI, LangGraph, LangGraph Swarm, or Microsoft Agent Framework.

Do not build a multi-agent workflow for simple questions.

Use this escalation order:

1. deterministic Supabase/database lookup
2. lightweight single-model explanation
3. strong single-model strategy + verification
4. specialist agent delegation only when the problem genuinely benefits from independent roles

Before coding:
- inspect installed package versions
- verify current Vercel AI SDK / AI Elements / AI Gateway documentation
- fetch current model IDs rather than relying on remembered names
- inspect the existing payment implementation before adding Stripe
- preserve the provider-neutral entitlement model even if Stripe is selected


## Non-negotiable behavior
The Advisor must:
- be anchored to one authorized screening/report
- read the actual report, findings, confirmed evidence, responses, sector type, market/community context, and authorized historical screenings
- verify material claims before answering
- cite/refer back to relevant screening evidence
- distinguish fact, calculation, inference, estimate, and missing data
- reject unsupported claims
- surface source conflicts
- use sector-appropriate strategy
- prioritize a small number of high-impact next moves
- be willing to say there is not enough information
- never silently change the official Visibility Score
- never reintroduce rejected/ambiguous screening evidence as confirmed evidence

## Voice
Use PDM's own strategy voice:
- direct
- practical
- numbers-aware
- constraint-first
- evidence-backed
- action-oriented

Do not impersonate or mimic Alex Hormozi or any public personality and do not imply endorsement.

## Paid entitlement
Advisor access requires a server-validated entitlement.

Inspect the existing codebase for real billing/payment infrastructure first.

If a production billing provider exists:
- integrate through its trusted server/webhook path
- grant/revoke Advisor entitlement after verified payment state

If no production billing provider exists:
- do NOT fabricate checkout/payment success
- implement the provider-neutral entitlement architecture and locked/unlocked UI states
- document the real payment integration as a release dependency

Never trust client-only flags for paid access.

## Supabase
Before implementing Supabase schema/functions:
- inspect the current schema/migrations
- verify current Supabase documentation/changelog
- follow the repository's migration discipline
- enable RLS on new public tables
- use organization ownership + entitlement checks
- never expose service-role/secret keys
- do not use user-editable metadata for authorization

Recommended entities are documented in `docs/PDM_360_ADVISOR.md`; adapt them to the existing schema rather than blindly copying.

## Context assembly
Build a server-side context assembler.

At minimum retrieve:
1. organization identity
2. screening type
3. rubric version
4. report snapshot
5. Visibility Score
6. category and sector-module results
7. Critical Visibility Leaks
8. Fix First / Improve Next / Monitor
9. screening findings
10. confirmed evidence sources
11. screening responses
12. Market & Community Intelligence where available
13. authorized prior screenings where relevant

Use deterministic retrieval for structured values.

Use semantic retrieval only for long-form material where it adds value.

Every semantic chunk must retain tenant ownership and source provenance.

## Reasoning pipeline
Implement an adaptive multi-stage pipeline:

1. authenticate + authorize user
2. verify Advisor entitlement
3. classify question/required depth
4. build evidence plan
5. retrieve structured and semantic context
6. perform deterministic calculations/tool calls where required
7. generate provisional answer
8. verify material claims against evidence
9. check contradictions
10. calibrate confidence / identify missing data
11. produce final answer with evidence references
12. log compact quality metadata

Do not expose or persist hidden chain-of-thought.

Store claim/evidence relationships and verification outcomes instead.

## Verification requirement
Material strategic answers require a verification pass.

The verifier must flag:
- unsupported claims
- mismatched score/category values
- rejected/ambiguous source use
- contradiction with report snapshot
- invented metrics
- ungrounded competitor claims
- calculations that need deterministic recomputation

On verification failure:
- retrieve again or revise once
- if still unsupported, return a transparent limitation instead of bluffing

## UX
Add an Advisor panel to eligible completed reports.

Locked state:
**Unlock PDM 360° Advisor**
Explain that the Advisor can answer questions using this specific screening.

Unlocked state:
**Ask PDM 360°**

Include context-aware starter prompts such as:
- What should I fix first?
- Explain my score.
- What is my biggest constraint?
- Give me my next 3 moves.
- Build a 30-day plan.
- What should I not spend money on yet?
- Which findings are you least certain about?

Add sector-specific prompts automatically.

## Evidence UX
Where practical, make answer references clickable back to:
- category
- finding
- source
- Critical Visibility Leak
- Market & Community Intelligence section

Clearly label:
- verified/scored evidence
- contextual data
- user-provided information
- estimate/inference

## Security
Test:
- unauthorized user cannot open another organization's Advisor
- entitled user cannot switch report ids to access another organization
- expired/revoked entitlement is denied
- client cannot forge access
- source prompt injection cannot change system behavior
- rejected evidence cannot be revived
- model/provider keys never reach the browser

## Evaluation suite
Create repeatable tests for:
- exact score questions
- evidence explanation
- critical leaks
- insufficient data
- competitor uncertainty
- numeric scenarios
- business/nonprofit/faith-ministry/organization behavior
- historical comparison
- citations
- prompt injection
- cross-tenant isolation
- entitlement enforcement
- LifePoint wrong-organization regression

## Cost/performance
Use adaptive model routing.

Do not use the highest-cost reasoning path for simple structured lookups.

Do use strong reasoning + verification for complex paid strategy questions.

Track:
- latency
- token/model cost
- retrieval volume
- verifier retries
- citation coverage
- user feedback

## Release discipline
Do not publish or claim the Advisor is live until:
- actual entitlement enforcement works
- all four sector modes pass
- source identity rules are preserved
- verification tests pass
- cross-tenant access tests pass
- mobile/desktop UX passes
- provider keys/secrets are server-only
- billing is real or the feature remains clearly locked/pending

## Completion report
Report:
- files/components changed
- schema/migrations added
- RLS policies added/tested
- AI provider/model routing implemented
- context sources used
- verifier design
- entitlement implementation
- billing integration status
- sector tests
- LifePoint regression result
- security tests
- latency/cost observations
- remaining blockers

## Success standard
The user should experience:

**“This Advisor understands my actual PDM screening, can prove why it is saying something, checks itself before answering, and gives me practical next moves based on my organization.”**
