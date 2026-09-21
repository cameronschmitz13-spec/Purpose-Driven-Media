import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const text = (v: unknown) => typeof v === "string" ? v.trim() : "";

function safeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
  const token = authHeader.slice(7);

  const url = Deno.env.get("SUPABASE_URL");
  const publishableMap = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
  const secretMap = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  const publishableKey = publishableMap.default;
  const secretKey = secretMap.default;
  if (!url || !publishableKey || !secretKey) return json({ error: "Server configuration error" }, 500);

  const userClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json({ error: "Invalid session" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json({ error: "Invalid JSON body" }, 400); }

  const organizationId = text(body.organization_id);
  if (!organizationId) return json({ error: "organization_id is required" }, 400);

  const { data: org, error: orgError } = await userClient
    .from("organizations")
    .select("id,name,organization_type,canonical_domain,website_url,street_address,city,state_region,postal_code,phone")
    .eq("id", organizationId)
    .single();

  if (orgError || !org) return json({ error: "Organization not found or unauthorized" }, 404);

  const requestedType = text(body.screening_type) || org.organization_type;
  if (requestedType !== org.organization_type) {
    return json({ error: "screening_type must match the organization's configured type" }, 400);
  }

  const { data: rubric, error: rubricError } = await userClient
    .from("rubric_versions")
    .select("id,version,screening_type")
    .eq("screening_type", requestedType)
    .eq("version", "visibility-v1")
    .is("retired_at", null)
    .single();

  if (rubricError || !rubric) return json({ error: "Active visibility-v1 rubric not found" }, 500);

  const input = safeObject(body.input_snapshot);
  const firstPartySocial = safeObject(input.first_party_social);
  const firstPartyLinks = safeObject(input.first_party_links);

  const canonicalIdentity = {
    organization_name: org.name,
    canonical_domain: org.canonical_domain,
    website_url: org.website_url,
    primary_address: org.street_address,
    city: org.city,
    state_region: org.state_region,
    postal_code: org.postal_code,
    phone: org.phone,
    first_party_social: firstPartySocial,
    first_party_links: firstPartyLinks,
    captured_at: new Date().toISOString(),
  };

  const admin = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: run, error: runError } = await admin
    .from("screening_runs")
    .insert({
      organization_id: organizationId,
      initiated_by: user.id,
      screening_type: requestedType,
      rubric_version_id: rubric.id,
      status: "resolving_identity",
      input_snapshot: input,
      canonical_identity_snapshot: canonicalIdentity,
    })
    .select("id,status,screening_type,started_at")
    .single();

  if (runError || !run) return json({ error: "Could not start screening" }, 500);

  await admin.from("audit_events").insert({
    actor_user_id: user.id,
    organization_id: organizationId,
    event_type: "screening_started",
    payload: {
      screening_run_id: run.id,
      screening_type: requestedType,
      rubric_version: rubric.version,
    },
  });

  return json({ screening_run: run }, 201);
});
