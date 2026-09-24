# PDM 360° Advisor — Approved Technical Stack

## Decision

The default implementation stack for **PDM 360° Advisor** is:

1. **Next.js / TypeScript**
2. **Vercel AI SDK** — primary conversation and tool-calling runtime
3. **Vercel AI Elements** — chat UI and evidence/citation presentation
4. **Supabase** — Auth, organization ownership, screening data, entitlements, conversations, RLS, and retrieval
5. **Vercel AI Gateway** — provider/model routing, failover, and model-cost control
6. **Stripe** — production payment/entitlement trigger when billing is implemented
7. **OpenAI Agents SDK for TypeScript** — optional escalation layer for genuinely complex delegated/multi-agent reasoning

This stack should be preferred over introducing a separate orchestration framework for the first production version.

---

## Architecture principle

Build the simplest architecture that can satisfy the PDM 360° Advisor requirements.

Do **not** start by making every question a multi-agent workflow.

The primary path should be:

```text
PDM 360° Report
      |
      v
Ask PDM 360°
      |
      v
AI Elements
(chat interface)
      |
      v
Vercel AI SDK
(conversation + tools)
      |
      +-------------------+-------------------+
      |                   |                   |
      v                   v                   v
  Supabase           AI Gateway        Deterministic tools
report/evidence      model routing      math/data lookups
auth/RLS/history
      |
      v
PDM Advisor response pipeline
      |
      +--> retrieval
      +--> reasoning
      +--> claim verification
      +--> citations/evidence
      |
      v
Evidence-backed answer
```

For complex questions only:

```text
Vercel AI SDK / PDM Advisor
      |
      v
complexity gate
      |
      v
OpenAI Agents SDK (TypeScript)
      |
      +--> Screening Analyst
      +--> Market/Context Analyst
      +--> Strategy Analyst
      +--> Evidence Verifier
      |
      v
PDM Advisor synthesis
      |
      v
verification + final answer
```

The customer should experience one coherent PDM Advisor regardless of whether a specialist workflow runs internally.

---

## 1. Vercel AI SDK — primary AI runtime

Use Vercel AI SDK as the default application-layer runtime because PDM is already aligned with a Next.js/TypeScript/Vercel stack.

Use it for:
- streaming chat
- server-side generation
- structured outputs
- tool calling
- controlled agent loops
- retrieval calls
- deterministic tool integration
- model-provider abstraction
- response streaming to the report UI

### Implementation rule
Before writing AI SDK code:
- inspect the installed package version
- inspect local `node_modules/ai/docs/` / source when available
- otherwise use current AI SDK documentation
- never rely on remembered API signatures
- fetch current provider/model IDs rather than hard-coding model names from memory
- typecheck after changes

### Default routing
A simple factual screening question should not trigger a complex autonomous workflow.

Examples:

**“What is my Visibility Score?”**
→ deterministic Supabase lookup; minimal model work or no reasoning model if not needed.

**“Why is my conversion score low?”**
→ retrieve category findings + confirmed evidence; single strong response.

**“I have $20,000. Compare my screening, competitors, demographics, and three possible strategies.”**
→ deeper reasoning, deterministic calculations, verification, and optional specialist delegation.

---

## 2. Vercel AI Elements — Advisor UI

Use AI Elements rather than hand-building a generic chat interface.

Install only the components actually needed.

Recommended starting components:
- conversation
- message
- prompt-input
- suggestion
- sources / inline-citation where appropriate
- actions
- loader/status components

Potential later additions:
- attachments
- confirmation
- tool status
- feedback controls

Do not install the entire component collection unless the application genuinely needs it.

### PDM-specific UI requirements
The UI must make it easy to distinguish:
- Advisor answer
- verified screening evidence
- contextual market/community information
- user-provided information
- estimate/inference
- missing information

Evidence references should deep-link into the relevant PDM report section where practical.

Do not expose hidden chain-of-thought. Show concise status, evidence, sources, assumptions, and verification outcomes instead.

---

## 3. Supabase — source of truth and memory

Supabase remains the data/authentication source of truth for the Advisor.

Use Supabase for:
- Auth
- organization membership
- report authorization
- Advisor entitlements
- screening report snapshots
- category scores/findings
- confirmed evidence sources
- screening responses
- Critical Visibility Leaks
- Market & Community Intelligence
- conversation/message persistence
- citation mappings
- compact verification metadata
- user feedback
- authorized historical screening retrieval

### Security
Every Advisor request must validate server-side:

```text
authenticated user
→ organization membership
→ report/screening access
→ active Advisor entitlement
→ allowed context retrieval
```

Requirements:
- RLS on exposed Advisor tables
- no service-role/secret key in browser code
- no authorization based on user-editable metadata
- no cross-organization retrieval
- no vector chunk may be retrieved across tenant boundaries
- rejected/ambiguous screening evidence may not re-enter the Advisor as confirmed evidence

### Retrieval rule
Prefer exact structured retrieval before semantic retrieval.

Do not introduce embeddings/vector search just because the feature is AI.

Use semantic retrieval when long-form source material, uploaded documents, or large historical context makes it necessary.

This keeps v1 simpler, cheaper, and easier to verify.

---

## 4. Vercel AI Gateway — model routing and cost control

Use AI Gateway as the preferred routing layer unless implementation constraints justify otherwise.

Goals:
- current model access without hard-coding stale IDs
- route simple and complex queries differently
- provider flexibility
- operational visibility
- cost tracking
- fallback/failover where appropriate

### Query classes

#### Tier 0 — deterministic
Examples:
- exact score
- exact category value
- report date
- count of critical leaks

Use database/calculation tools.

#### Tier 1 — light interpretation
Examples:
- explain one category
- summarize one finding
- clarify a report term

Use an efficient model and small context.

#### Tier 2 — strategy
Examples:
- what should I fix first?
- build my next 3 moves
- analyze conversion friction
- prioritize a limited budget

Use a stronger reasoning model + evidence verification.

#### Tier 3 — complex strategy / delegation
Examples:
- compare multiple historical screenings
- analyze report + competitors + demographics + budget scenarios
- produce a multi-factor strategic plan
- reconcile conflicting evidence

Use a strong reasoning model, deterministic calculations, verification, and specialist agents only when they materially improve quality.

Do not use Tier 3 merely because the user typed a long question.

---

## 5. Stripe — payment to entitlement

Stripe is the preferred production payment integration for Advisor access.

However, the repository currently does not contain a completed production billing system.

Therefore:

- do not fake Stripe payment state
- do not unlock Advisor based on a client-side success redirect
- do not trust a checkout query parameter as entitlement proof

When billing is implemented:

```text
Stripe Checkout / payment
      |
      v
verified Stripe webhook
      |
      v
server-side entitlement grant
      |
      v
Supabase advisor_entitlements
      |
      v
Ask PDM 360° unlocked
```

Revocation/expiration must also be handled server-side.

The underlying entitlement model should remain provider-neutral enough that PDM can support:
- one-time paid screening access
- time-limited Advisor access
- recurring Director's Desk access
- sponsored/administrative access
- future plan structures

---

## 6. OpenAI Agents SDK TypeScript — optional complex-workflow layer

Do not make OpenAI Agents SDK the default path for every question.

Use it when the request benefits from:
- specialist delegation
- agents-as-tools
- controlled handoffs
- independent verification
- sandboxed/longer-running analysis
- explicit guardrails
- tracing across complex agent work

PDM's preferred specialist topology for complex work:

### Lead PDM Strategy Agent
Owns the user question and final synthesis.

Possible specialist agents:

**Screening Analyst**
- interprets score/category findings
- retrieves report evidence
- identifies critical leaks

**Market & Context Analyst**
- interprets demographics
- local market/community intelligence
- competitor/comparable context

**Strategy Analyst**
- evaluates choices
- prioritizes constraints
- builds scenarios/plans

**Evidence Verifier**
- checks material claims
- checks calculations
- rejects unsupported statements
- ensures rejected/ambiguous sources were not used

The Lead Agent must synthesize the result into one PDM answer.

Do not expose specialist internal reasoning or hidden chain-of-thought.

---

## Frameworks not selected for v1

Do not introduce these into the production Advisor merely because they are powerful:

- CrewAI
- LangGraph
- LangGraph Swarm
- Microsoft Agent Framework

They remain valid options for future workflows where their specific capabilities are justified.

Examples that might justify reconsideration:
- long-running resumable background workflows
- complex branching state machines
- large autonomous agent teams
- cross-system enterprise orchestration
- workloads that require framework-specific durability/governance

For the current Advisor, adding one of these by default would duplicate capabilities already covered by Vercel AI SDK + OpenAI Agents SDK and increase:
- implementation surface
- dependency load
- debugging complexity
- context requirements
- latency
- operational cost

Use Ponytail/YAGNI discipline: add a framework only after a concrete requirement proves the current stack insufficient.

---

## Verification pipeline on this stack

The implementation should map the existing verification architecture onto the selected stack:

```text
1. Supabase authorization + entitlement
2. classify query complexity
3. exact structured retrieval
4. optional relevant semantic retrieval
5. deterministic calculations/tools
6. draft answer
7. evidence/claim verification
8. contradiction check
9. confidence / missing-data calibration
10. final streamed answer + citations
11. compact verification telemetry
```

For complex Tier 3 questions, steps 5–8 may use specialist agents.

Verification should not be skipped solely to save model cost for paid strategic answers.

---

## Usage and cost discipline

The Advisor should save tokens by design.

Use:
- structured database retrieval rather than dumping full reports
- smallest sufficient evidence set
- context summaries for stable report sections
- cached immutable report metadata
- targeted semantic retrieval
- adaptive model routing
- deterministic arithmetic
- specialist agents only when justified
- compact handoffs rather than full conversation duplication
- prompt/version reuse
- request budgets and rate limits

Do not send an entire organization's complete data set to the model on every turn.

---

## Suggested v1 implementation order

1. Inspect current Next.js/Site implementation.
2. Confirm current Vercel AI SDK compatibility/docs.
3. Add server-side Advisor entitlement contract.
4. Add Supabase Advisor persistence + RLS.
5. Build screening/report context assembler.
6. Build simple deterministic + single-model question path.
7. Add claim verification and citations.
8. Add AI Elements chat UI inside completed reports.
9. Add AI Gateway routing/cost telemetry.
10. Add Stripe checkout/webhook entitlement only when the real billing flow is ready.
11. Add OpenAI Agents SDK specialist delegation only for validated Tier 3 use cases.
12. Run sector, LifePoint, prompt-injection, entitlement, cross-tenant, mobile, and browser tests.

This order intentionally gets a high-quality grounded Advisor working before introducing multi-agent complexity.

---

## Success standard

The technical stack is successful when:

- simple questions are fast and cheap
- strategic questions are deeply grounded
- complex questions can escalate to specialists
- the customer sees one coherent PDM Advisor
- answers trace back to the actual screening
- payment access is enforced server-side
- customers cannot access one another's data
- unsupported claims are caught before delivery
- the architecture remains understandable and maintainable
