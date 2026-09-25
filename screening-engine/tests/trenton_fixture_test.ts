import { runScreening } from "../engine.ts";
import type { ScreeningInput } from "../types.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

Deno.test("Trenton First Assembly 2026-09-25 fixture is reproducible", async () => {
  const fixtureUrl = new URL(
    "../../qa/fixtures/trenton_first_assembly_mo_2026_09_25.json",
    import.meta.url,
  );
  const input = JSON.parse(await Deno.readTextFile(fixtureUrl)) as ScreeningInput;
  const result = runScreening(input);

  assert(result.preview_total === 60, `expected 60, got ${result.preview_total}`);
  assert(
    result.excluded_source_ids.includes("wrong-trenton-tennessee"),
    "wrong-state Trenton church must be excluded",
  );
  assert(
    !result.accepted_source_ids.includes("wrong-trenton-tennessee"),
    "wrong-state Trenton church must never be accepted",
  );

  const top = result.priorities.map((item) => item.key);
  assert(
    JSON.stringify(top) === JSON.stringify([
      "measurement_freshness",
      "visit_service_information",
      "conversion_readiness",
    ]),
    `unexpected priorities: ${JSON.stringify(top)}`,
  );

  assert(
    result.finalizer_payload.critical_issues.length === 2,
    "expected two Critical Visibility Leaks",
  );
});
