# Squarespace Implementation Runbook

## Production platform
- Website: https://purposedrivenmedia.group/
- Current production platform: Squarespace

## Architecture rule
GitHub is the source of truth for strategy, copy, CRO/SEO requirements, QA, and prompts.
Squarespace is the production editing surface.

Do **not** assume changes committed to this repository automatically deploy to Squarespace.

## Best implementation workflow
Use ChatGPT Work / Cloud Browser for changes that require the Squarespace editor:

1. Read `AGENTS.md`.
2. Read the relevant task prompt and referenced docs.
3. Open the live PDM website and inspect the current page before changing anything.
4. Open Squarespace and sign in using the user's authorized session.
5. Make the smallest set of changes required by the approved prompt.
6. Preview desktop and mobile.
7. Verify buttons, links, forms, images, and navigation.
8. Publish only when the requested task is complete and there are no obvious regressions.
9. Report exactly what changed and anything that still needs manual verification.
10. Update repository documentation when a durable decision changes.

## Squarespace-specific cautions
- Reuse existing sections and styles where practical instead of rebuilding pages.
- Avoid injecting custom code unless Squarespace's native editor cannot accomplish the requirement.
- Do not add third-party scripts without a clear reason.
- Preserve current domain, forms, analytics, and integrations unless explicitly changing them.
- Check mobile layout after every major section change.
- Check SEO settings at both page and site level where relevant.
- Avoid duplicate H1s.
- Keep image sizes reasonable for page performance.
- Use real PDM assets and the correct double-chevron logo.

## GitHub vs Squarespace
Store in GitHub:
- approved copy
- brand rules
- CRO architecture
- SEO requirements
- experiment plans
- QA checklists
- durable screenshots/reference notes where appropriate

Change in Squarespace:
- page content
- section order
- buttons
- images
- forms
- page SEO settings
- navigation
- layout/styling
- code injection only when necessary
