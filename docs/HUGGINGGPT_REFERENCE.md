# HuggingGPT / JARVIS Reference

Reference project:
- microsoft/JARVIS
- Paper: HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in HuggingFace

## Useful architecture for PDM
HuggingGPT uses four stages:
1. Task Planning
2. Model Selection
3. Task Execution
4. Response Generation

For PDM, translate that to:
1. Break business/website work into scoped tasks.
2. Route each task to the least-expensive capable model.
3. Execute against the repository's documented source of truth.
4. Run QA and synthesize findings before release.

## What not to copy
Do not embed the full legacy JARVIS/HuggingGPT runtime into the PDM marketing website. The original project was built as a research orchestration system and can require substantial local model infrastructure.

The value to PDM is the orchestration pattern, not the old runtime stack.
