# HuggingGPT-Inspired Work Orchestration

This project borrows the useful orchestration pattern from Microsoft's HuggingGPT/JARVIS research:

1. **Task Planning** — break a broad goal into bounded tasks.
2. **Specialist Selection** — choose the least-expensive capable model/agent for each task.
3. **Task Execution** — run only the relevant prompt and repository context.
4. **Synthesis / QA** — integrate results and verify against AGENTS.md.

We are **not** copying the legacy HuggingGPT runtime into PDM. GitHub is the persistent source of truth; ChatGPT Work/Codex is the controller.

## Usage-optimized model routing

### GPT-5.6 Sol — High
Use for:
- homepage conversion architecture
- major CRO decisions
- technical SEO diagnosis
- evidence/trust strategy
- interpreting Search Console once meaningful data exists

### GPT-5.6 Sol — Medium
Use for:
- implementing already-approved CRO changes
- schema markup
- analytics events
- mobile UX cleanup
- scoped refactors
- final QA

### Instant / lower effort
Use for:
- tiny copy corrections
- simple spacing/styling changes
- repetitive metadata cleanup
- straightforward file organization
- low-risk documentation updates

## Context-saving rule
Do not paste the full PDM background into every Work request.

Instead:
1. Read `AGENTS.md`.
2. Read the named prompt file.
3. Read only the referenced docs.
4. Inspect implementation.
5. Execute and test.

## One-variable testing rule
For ad/CRO experiments, change one primary variable at a time whenever possible so results can be interpreted.
