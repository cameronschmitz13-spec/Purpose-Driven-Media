import { withSupabase } from "npm:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const screeningRunId =
      typeof body.screening_run_id === "string" ? body.screening_run_id.trim() : "";
    const ratings =
      body.ratings && typeof body.ratings === "object" ? body.ratings : null;
    const criticalIssues = Array.isArray(body.critical_issues)
      ? body.critical_issues
      : [];
    const planningTarget =
      typeof body.planning_target === "number" ? body.planning_target : null;

    if (!screeningRunId || !ratings) {
      return Response.json(
        { error: "screening_run_id and ratings are required" },
        { status: 400 },
      );
    }

    const { data, error } = await ctx.supabaseAdmin.rpc(
      "finalize_screening_score",
      {
        p_screening_run_id: screeningRunId,
        p_ratings: ratings,
        p_critical_issues: criticalIssues,
        p_planning_target: planningTarget,
      },
    );

    if (error) {
      return Response.json(
        { error: "Could not finalize screening", detail: error.message },
        { status: 400 },
      );
    }

    return Response.json({ result: data?.[0] ?? null });
  }),
};
