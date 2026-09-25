import { runScreening } from "./engine.ts";
import type { ScreeningInput } from "./types.ts";

if (import.meta.main) {
  const file = Deno.args[0];
  if (!file) {
    console.error("Usage: deno run --allow-read screening-engine/cli.ts <screening-input.json>");
    Deno.exit(2);
  }

  const raw = await Deno.readTextFile(file);
  const input = JSON.parse(raw) as ScreeningInput;
  const output = runScreening(input);
  console.log(JSON.stringify(output, null, 2));
}
