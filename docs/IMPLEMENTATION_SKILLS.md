# Usage-Efficient Skills and Agent Routing

## Goal
Use the smallest amount of model/context/tooling necessary for each phase.

Do not load every skill into every task.

## Always available source of truth
- GitHub repository
- `AGENTS.md`
- only the specific docs referenced by the task

## Skills to use

### 1. Supabase
Skill:
`skills://plugins/supabase/supabase`

Use for:
- Auth
- sessions
- RLS
- database schema
- Edge Functions
- storage if later needed
- security verification

Load this skill only for Supabase work.

### 2. Supabase Postgres Best Practices
Skill:
`skills://plugins/supabase/supabase-postgres-best-practices`

Use when:
- designing/refining schema
- writing SQL
- optimizing queries/indexes
- reviewing performance

Do not load for pure page-copy or visual tasks.

### 3. Agent Browser
Skill:
`skills://plugins/vercel/agent-browser`

Use for:
- inspecting the live PDM site
- exercising screening flows
- reproducing LifePoint identity contamination
- visual comparison between screening types
- testing login/signup/reset flows

### 4. Agent Browser Verify
Skill:
`skills://plugins/vercel/agent-browser-verify`

Use after implementation to:
- verify key pages load
- check browser errors
- validate critical UI
- run a final visual gut-check

## Conditional skills
Only if the implementation environment actually exposes these technologies:

- `skills://plugins/vercel/react-best-practices` — if editing React/TSX
- `skills://plugins/vercel/nextjs` — if editing a Next.js application
- `skills://plugins/vercel/shadcn` — if shadcn/ui is actually used

Do not introduce React, Next.js, shadcn, or Vercel merely to use a skill.

## Model routing

### High reasoning
Use once for:
- architecture
- unified screening model
- data-accuracy/entity-resolution rules
- auth/data/security design
- interpreting an ambiguous data bug

### Medium reasoning
Use for:
- implementing approved UI changes
- Supabase schema/RLS after architecture is fixed
- mobile cleanup
- SEO changes
- tests and regression fixes

### Instant/lower effort
Use for:
- copy edits
- spacing
- renaming labels
- repetitive metadata
- straightforward QA follow-ups

## Context minimization
For each Work run:
1. read AGENTS.md
2. read only the task prompt
3. read only docs explicitly referenced by that prompt
4. inspect live implementation
5. execute
6. verify
7. summarize durable changes back into GitHub

Avoid reposting full project history.
