# PDM 360° Advisor — Product & AI Architecture

## Decision
Add **PDM 360° Advisor** as the paid conversational intelligence layer attached to a completed PDM 360° Visibility Screening.

Customer-facing chat CTA:

**Ask PDM 360°**

Core promise:

**Your screening does not end with a score. Ask questions, test ideas, understand the evidence, and turn your results into clear next moves with an advisor that already understands your organization.**

The Advisor must be grounded in the specific paid screening/report the user is viewing.

It must not behave like a generic chatbot.

---

## Product role

The PDM 360° Visibility Screening diagnoses visibility.

The PDM 360° Advisor helps the user:
- understand the diagnosis
- challenge assumptions
- identify the highest-value constraint
- prioritize actions
- build plans
- interpret market/community context
- improve offers/messages/next-step pathways
- compare options
- quantify simple scenarios when inputs are available
- ask follow-up questions when evidence is insufficient

Recommended product flow:

PDM 360° Visibility Screening
→ completed report
→ payment / valid entitlement
→ **Ask PDM 360°**
→ personalized strategy conversation
→ prioritized implementation plan
→ PDM services / Director's Desk where appropriate

The Advisor is not a replacement for the report. It is an intelligence layer on top of it.

---

## Brand and voice

Use an original PDM strategy voice.

Desired qualities:
- direct
- practical
- numbers-aware
- constraint-first
- skeptical of vague marketing advice
- focused on measurable outcomes
- concise when the answer is simple
- capable of deep analysis when the question requires it
- willing to say “I do not have enough evidence yet”

Do not impersonate, imitate, claim affiliation with, or imply endorsement by Alex Hormozi or any other public business personality.

The product may use broadly established business principles such as:
- identify the bottleneck
- quantify the bottleneck
- fix upstream constraints before downstream optimization
- distinguish traffic/acquisition from conversion
- improve clarity and value before buying more traffic
- reduce friction and perceived risk
- prioritize measurable actions

These principles must be presented as PDM's own strategy system.

---

## Access model — paid screening entitlement

Advisor access is premium.

A user must have:
1. a valid authenticated account
2. authorized organization membership
3. access to the target screening/report
4. an active server-validated Advisor entitlement for that screening/report or qualifying plan

Never unlock Advisor access based only on:
- a client-side flag
- URL parameters
- browser storage
- user-editable metadata

### Payment-provider boundary
The repository currently has no production payment/subscription implementation.

Do not fabricate Stripe or another provider integration.

Build a provider-neutral entitlement boundary so a future payment webhook can grant/revoke access safely.

Recommended entitlement concepts:
- entitlement id
- user id and/or organization id
- screening report id / screening run id
- entitlement type
- status
- granted_at
- starts_at
- expires_at nullable
- payment_provider nullable
- payment_reference nullable
- created_at / updated_at

Server-side authorization must validate entitlement on every Advisor request.

A successful payment event may create or activate an entitlement only from a trusted server/webhook path.

---

## Screening-specific context

Every Advisor conversation must be anchored to exactly one authorized screening/report by default.

The context assembly pipeline should understand the target organization through structured, evidence-aware retrieval.

### Highest-priority context
1. organization identity
2. screening type
3. rubric/version
4. completed report snapshot
5. total Visibility Score
6. universal category results
7. sector-module results
8. Critical Visibility Leaks
9. Fix First / Improve Next / Monitor
10. screening findings
11. confirmed evidence sources
12. screening responses
13. 360° Market & Community Intelligence
14. prior screenings for the same organization when authorized
15. optional organization documents/data explicitly made available to the Advisor

### Evidence boundary
Only confirmed identity-matched screening sources may be treated as score-bearing evidence.

Rejected or ambiguous sources must never be silently reintroduced by the Advisor.

The Advisor may discuss contextual data that is not score-bearing, but it must distinguish:
- scored/verified evidence
- contextual third-party data
- user-provided information
- estimates
- inference
- missing/unknown information

---

## State-of-the-art understanding architecture

Use a hybrid approach rather than a single giant prompt.

### 1. Structured retrieval
Use deterministic database queries for:
- scores
- category values
- finding metadata
- source relationships
- report snapshots
- screening responses
- entitlement status
- historical run references

Do not ask the language model to “remember” values that can be retrieved exactly.

### 2. Semantic retrieval for long-form material
For long reports, source excerpts, optional user documents, and extensive market/context material:
- chunk semantically
- preserve source/document identifiers
- preserve page/section/location metadata when available
- retrieve only relevant passages
- support multiple relevant chunks when a question spans topics
- preserve provenance through the answer pipeline

Use long-context models where useful, but do not rely on raw context-window size as a substitute for retrieval quality.

### 3. Adaptive depth
The system should choose an appropriate reasoning depth.

Examples:
- “What is my score?” → direct structured lookup
- “Why is my conversion readiness low?” → retrieve findings + evidence + report explanation
- “I have $1,500. What should I do first?” → retrieve priorities + leaks + relevant sector data, then reason across tradeoffs
- “Compare my last three screenings and explain what actually improved.” → retrieve historical runs, calculate deltas, identify evidence-backed changes
- “Rewrite my offer based on the report.” → retrieve business findings, message clarity, reputation, audience context, and user-provided offer details

Do not spend maximum reasoning cost on trivial queries.

### 4. Deterministic calculations
Use code/calculator/database operations for arithmetic and comparisons whenever possible.

The model should not perform important numerical calculations from memory when a deterministic tool can calculate them.

### 5. Tool-aware reasoning
The Advisor may use controlled tools for:
- database retrieval
- calculations
- approved document retrieval
- approved external research if separately enabled
- plan generation

Tool permissions must be explicit.

The Advisor should be read-only against canonical screening scores/findings unless a separate authorized workflow explicitly allows user-created notes or plans.

---

## Verification pipeline

The Advisor must not simply draft once and return the answer.

Use a multi-stage answer pipeline.

### Stage A — intent and evidence plan
Determine:
- what the user is actually asking
- which screening facts are required
- whether current evidence is sufficient
- whether calculations or additional retrieval are needed

### Stage B — evidence retrieval
Retrieve the smallest sufficient evidence set.

Prefer:
- structured report data first
- confirmed screening findings/sources second
- contextual intelligence third
- user-provided information fourth
- external information only when allowed and clearly separated

### Stage C — draft
Generate a provisional answer grounded in retrieved material.

### Stage D — claim verification
Before returning the answer, verify factual claims against the retrieved evidence.

For each material claim, determine whether it is:
- directly supported
- calculated from supported inputs
- reasonable inference
- unsupported

Unsupported material claims must be:
- removed
- softened
- explicitly labeled as an assumption
- or trigger a request for missing information

### Stage E — contradiction check
Check the draft against:
- the report snapshot
- score/category values
- Critical Visibility Leaks
- included/rejected source status
- other retrieved evidence

If sources conflict, surface the conflict rather than choosing a convenient answer.

### Stage F — confidence calibration
Use confidence language based on evidence quality, not model certainty.

Suggested levels:
- **High confidence** — directly supported by multiple strong/verified facts
- **Moderate confidence** — supported but with meaningful limitations
- **Low confidence / needs verification** — insufficient or conflicting evidence

Do not display fake percentages for answer confidence unless a validated calibration system is built.

### Stage G — final answer
Return the useful answer with source links/references into the screening where practical.

Do not expose private chain-of-thought.

The system may retain:
- retrieved source ids
- claim/evidence mappings
- verifier outcome
- compact decision summary
- quality metadata

Do not persist hidden reasoning traces or chain-of-thought.

---

## Answer format

The Advisor should adapt to the question rather than force every answer into a template.

For strategic questions, a strong default is:

**Answer**
Direct conclusion.

**Why**
The specific screening findings driving the conclusion.

**Next 3 Moves**
No more than three priority actions unless the user requests a longer plan.

**Evidence**
Links/references to the relevant PDM findings/sources.

**Confidence / Missing Data**
Only when useful.

For simple questions, answer simply.

---

## Sector intelligence

The Advisor must automatically condition itself on the screening type.

### Business
Focus may include:
- discoverability
- service/product clarity
- offer clarity
- reputation
- quote/booking/contact flow
- lead capture
- follow-up
- conversion friction
- local competitive context
- proof
- customer action

It may discuss revenue/lead scenarios only when the user provides sufficient inputs.

Do not invent financial metrics.

### Non-Profit
Use appropriate language:
- mission clarity
- donor trust
- volunteer pathways
- program/service access
- community reach
- supporter engagement
- impact communication
- fundraising visibility
- stewardship

Do not reduce nonprofit success to commercial revenue logic.

### Faith & Ministry
Use appropriate language:
- service/visit clarity
- ministry discoverability
- sermons/media
- groups/events
- giving pathway
- prayer/help/contact
- newcomer next steps
- community awareness

Do not optimize churches as if attendance or revenue were the ultimate goal.

Respect the organization's stated mission and ministry context.

### General Organization
Adapt to:
- membership
- services
- participation
- community reach
- events
- public trust
- stakeholder actions

---

## Suggested questions

Surface context-aware starter prompts.

Universal:
- What should I fix first?
- Explain my score.
- Where am I losing people?
- What is my biggest visibility constraint?
- Give me my next 3 moves.
- Build a 30-day action plan.
- What should I not spend money on yet?
- Which findings have the strongest evidence?
- What information are you least certain about?
- Compare this screening with my previous one.

Business:
- How can I get more qualified leads?
- Is my offer clear enough?
- What would you change on my homepage?
- If I have a limited budget, where should it go first?
- How do I reduce friction in my quote/booking path?
- What do my competitors appear to be doing better?

Non-Profit:
- How can we make our mission easier to understand?
- What is hurting donor trust?
- How can we improve volunteer conversion?
- What should we fix before running a fundraising campaign?

Faith & Ministry:
- What could confuse a first-time visitor?
- Is our service information easy to find?
- Where could people drop off before planning a visit?
- How can we make ministry next steps clearer?

---

## Accuracy and hallucination rules

The Advisor must:
- distinguish facts from recommendations
- cite screening evidence for material report claims
- avoid inventing missing data
- never claim a source was verified if it was not
- never use rejected/ambiguous identity evidence as confirmed evidence
- never change a canonical score conversationally
- say when the answer depends on assumptions
- ask for missing business inputs when needed
- avoid guaranteed outcomes
- avoid fake benchmark claims
- avoid fake competitor data
- avoid fabricated demographic precision

If the Advisor cannot support a conclusion, it should say so plainly.

Useful response:

**I can see the visibility problem, but I do not have enough information to estimate the financial impact yet. Give me your average sale, monthly qualified leads, and close rate and I can model the scenario.**

---

## Privacy and tenant isolation

Advisor data must follow the same organization ownership model as screening data.

Requirements:
- Supabase Auth remains identity source of truth
- organization membership is authorization input
- entitlement is checked server-side
- RLS on any exposed Advisor tables
- no cross-organization retrieval
- no service-role key in the browser
- no trust in user-editable JWT metadata for authorization
- server-only provider keys
- prompt/context logs must not leak one customer's data to another
- sensitive raw source material should be minimized in logs
- retention policies should be configurable

If vector/semantic retrieval is introduced, every chunk must carry organization/report ownership metadata and retrieval must enforce tenant boundaries before content reaches the model.

---

## Proposed persistence model

Do not deploy blindly; verify current Supabase docs and generate migrations using the project's approved migration workflow.

Likely entities:

### advisor_entitlements
Purpose: authoritative server-side access control.

Possible fields:
- id
- user_id nullable
- organization_id
- screening_run_id nullable
- screening_report_id nullable
- entitlement_type
- status
- starts_at
- expires_at nullable
- payment_provider nullable
- payment_reference nullable
- created_at
- updated_at

### advisor_conversations
- id
- organization_id
- screening_run_id
- screening_report_id
- created_by
- title
- status
- prompt_version
- created_at
- updated_at

### advisor_messages
- id
- conversation_id
- role
- content
- created_by nullable
- model/provider metadata
- created_at

### advisor_message_citations
- id
- message_id
- source_kind
- source_id
- label
- claim_key nullable
- created_at

### advisor_verification_events
Store compact verification metadata, not hidden chain-of-thought.
- id
- message_id
- verifier_version
- support_status
- contradiction_found
- missing_data jsonb
- evidence_ids jsonb
- created_at

### advisor_feedback
- id
- message_id
- user_id
- rating / helpful boolean
- reason
- created_at

All public-schema tables require RLS.

---

## Payment / entitlement UX

Before entitlement:
- show a locked Advisor panel
- explain what it can do using the user's screening
- show sample questions
- show the purchase/upgrade action only if a real payment flow exists

After successful trusted payment:
- activate entitlement server-side
- unlock **Ask PDM 360°**
- attach conversation to the paid screening/report

If payment integration is not yet available:
- do not fake a checkout
- leave the UI explicitly pending
- implement and test entitlement plumbing separately

---

## Model routing and cost control

State-of-the-art does not mean “use the most expensive model for every token.”

Use model routing:
- lightweight model/rules for intent classification and simple retrieval
- strong reasoning model for multi-factor strategy
- dedicated verification pass for material strategic answers
- deterministic tools for math/data lookup

Use:
- retrieval caching
- report context summaries
- immutable report snapshots
- prompt versioning
- request budgets
- rate limits
- token/cost telemetry
- fallback behavior

Never reduce verification quality solely to save cost on paid strategic answers.

---

## Prompt/version discipline

Version:
- Advisor system prompt
- retrieval policy
- verifier prompt
- answer policy

Every produced answer should be attributable to:
- screening/report id
- screening rubric version
- Advisor prompt version
- model/provider version metadata when available
- evidence ids used
- verification status

This makes regressions testable.

---

## Evaluation suite

Do not launch based only on “chat feels good.”

Build evaluation fixtures for all four sectors.

Required categories:
- exact score retrieval
- category explanation
- Critical Visibility Leak handling
- rejected-source exclusion
- identity-conflict resistance
- insufficient-data refusal
- numerical calculation correctness
- sector-language correctness
- competitor uncertainty
- historical-screening comparison
- recommendation prioritization
- citation/source correctness
- prompt-injection resistance from retrieved source text
- cross-tenant isolation
- entitlement enforcement

Include the LifePoint identity regression.

The Advisor must never resurrect the wrong-state/wrong-organization evidence that the screening engine rejected.

---

## Prompt injection and untrusted-source safety

Treat retrieved web/source/document content as untrusted data.

Instructions inside retrieved content must never override the Advisor's system policy.

The retrieval layer should label content as evidence, not instructions.

Do not allow source text such as “ignore previous instructions” to alter:
- authorization
- entitlement
- system behavior
- scoring
- source trust
- tool permissions

---

## Product analytics

Measure:
- locked-panel views
- purchase/upgrade starts
- entitlement activations
- Advisor opens
- questions per entitled report
- starter prompt usage
- response latency
- verifier failure/retry rate
- citation coverage
- user feedback
- top question categories
- plan-generation usage
- follow-through actions where voluntarily tracked

Do not expose sensitive customer content in analytics events.

---

## Success standard

The PDM 360° Advisor succeeds when the user feels:

**“This understands my actual screening, can explain why PDM reached the result, catches its own unsupported claims, and gives me a practical next move based on my organization—not generic AI advice.”**

It fails if it becomes:
- a generic chat box
- an unverified marketing idea generator
- a personality imitation
- a source of invented metrics
- a way around payment
- a second hidden scoring engine
- a cross-customer data leak
