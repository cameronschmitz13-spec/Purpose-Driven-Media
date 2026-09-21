# Sweeping PDM Update — Implementation Status

## Ready
The repository now defines:
- homepage CRO direction
- PDM brand rules
- unified screening UX
- organization identity/source provenance gate
- exact LifePoint Chillicothe regression fixture
- canonical 70/30 scoring architecture
- Supabase Auth/data architecture
- RLS requirements
- measurement/observability
- SEO baseline
- usage-efficient skill routing

## Live-site implementation dependency
The production editing surface is ChatGPT Sites.

Repository commits do not automatically modify the live ChatGPT Site.

The implementation run must use ChatGPT Work / Cloud Browser with access to the existing PDM Site in order to:
- inspect the actual current UI
- identify shared/duplicated screening components
- edit the Site
- compare Business vs Non-Profit screens
- exercise screening flows
- inspect browser errors
- publish after QA

## Supabase provisioning dependency
A Supabase organization is connected, but no project currently exists.

Do not create a project until the owner confirms:
- which Supabase organization to use
- the current project cost after it is retrieved

Once confirmed:
1. retrieve current project cost
2. obtain explicit cost confirmation
3. create the PDM project
4. apply schema/RLS migrations
5. configure Auth
6. run security/performance advisors
7. test cross-organization isolation

## Release blocker
Do not publish the screening-engine update until the LifePoint identity regression passes.
