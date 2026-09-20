# ChatGPT Sites Implementation Runbook

## Production platform
- Website: https://purposedrivenmedia.group/
- Current production platform: ChatGPT Sites
- The site is created and edited through ChatGPT Sites, not Squarespace.

## Architecture rule
GitHub is the persistent source of truth for:
- brand rules
- CRO strategy
- approved copy
- SEO requirements
- trust/proof standards
- test plans
- QA checklists
- durable implementation decisions

ChatGPT Sites is the production editing surface for the live website.

Do not assume a GitHub commit automatically changes the live ChatGPT Site.

## Implementation workflow
1. Read `AGENTS.md`.
2. Read the relevant task prompt and referenced docs.
3. Inspect the live PDM site before editing.
4. Open the PDM project in ChatGPT Sites.
5. Reuse the existing design and components where practical.
6. Make the smallest high-impact set of changes.
7. Preview desktop and mobile.
8. Verify buttons, links, forms, images, navigation, and screening flows.
9. Publish only after QA passes.
10. Report exactly what changed.
11. Update GitHub docs when a durable decision changes.

## Important
Do not rebuild from scratch unless explicitly requested.

Preserve:
- current branding
- working forms
- navigation
- analytics/tracking
- integrations
- domain setup
- existing functionality

## Brand requirements
- Use the PDM double-chevron mark.
- Keep the deep navy / warm gold / white-cream identity.
- The preferred brand line is: `Get Found, Understood, and Connected.`
- Vibrant accent colors are allowed when they improve clarity or attention.

## CRO requirements
The homepage should prioritize:
1. Problem + CTA
2. Sample Visibility Screening
3. What PDM checks
4. What the visitor receives
5. Real proof
6. Process
7. Relevant services/software
8. FAQ
9. Final CTA

Primary CTA:
`Start My Visibility Screening`

Secondary CTA:
`See a Sample Report`

## Trust requirements
Never fabricate testimonials, scores presented as real, client counts, awards, revenue impact, ratings, or software capabilities.

Any fictional screening example must be labeled clearly:
`Sample Report — fictional organization for illustration only.`

## SEO requirements
Where supported in ChatGPT Sites:
- one meaningful H1
- intent-aligned title and meta description
- clean canonical URL
- appropriate social sharing metadata
- useful image alt text
- logical heading hierarchy
- no accidental noindex
- valid sitemap/robots behavior if Sites controls these automatically
- structured data only if supported and factually accurate

## QA
Before publishing:
- desktop preview
- mobile preview
- CTA test
- form test
- nav test
- image check
- heading check
- spelling check
- fictional-sample disclosure check
- no fabricated proof
