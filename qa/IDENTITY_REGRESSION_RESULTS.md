# Identity Regression — Current Verification

Date: 2026-09-20

## Scope
This records the backend identity-gate verification completed before live ChatGPT Sites wiring.

## LifePoint canonical target
- Lifepoint Church of Chillicothe
- `lifepoint-church.com`
- Chillicothe, Missouri
- canonical first-party address: 434 Locust St
- verified phone: 660-973-2639

## Public-source observations used for the fixture
1. Official Lifepoint site: 434 Locust St, Chillicothe, MO; phone 660-973-2639.
2. Chillicothe city church directory: Lifepoint Church, 455 Locust Street; phone 660-973-2639.
3. Separate LifePoint organization: `lifepointchurch.org`, Smyrna, Tennessee; phone 615-459-3311.

## Expected decisions
### Chillicothe city directory
Expected: **confirmed same organization**, because the exact verified phone and same city/state identify the entity.

The 455 vs 434 Locust difference must be retained as a **listing-consistency finding**. It must not overwrite the canonical first-party address.

### Tennessee LifePoint
Expected: **rejected**.

It differs in state, city, domain, phone, and address. It contributes zero scoring impact.

## Synthetic regression fixtures
- `synthetic_same_name_different_state.json`: expected rejected
- `synthetic_conflicting_identity.json`: expected rejected

## Algorithm fixture result
The current identity-decision logic produces the expected decision for:
- Chillicothe stale-address directory case: confirmed + address difference
- Tennessee LifePoint: rejected
- same-name/different-state synthetic case: rejected
- conflicting domain/phone/address synthetic case: rejected

## Database enforcement verified
- source provenance columns present
- per-run source URL dedupe index present
- scoring-gate constraint present
- rejected/ambiguous sources cannot be persisted with `included_in_score=true`
- Supabase security advisor currently returns no security lints

## Still pending
This is not yet an end-to-end production pass.

After ChatGPT Sites is wired to Supabase, run the same cases through the real screening UI/pipeline with authenticated test accounts and verify the resulting report and score.
