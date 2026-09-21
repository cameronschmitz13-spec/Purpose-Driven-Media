import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedTypes = new Set(["business", "nonprofit", "faith_ministry", "organization"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanOptional(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

function normalizeDomain(value: unknown): string | null {
  let raw = cleanOptional(value, 500);
  if (!raw) return null;
  try {
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
    return new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return raw.toLowerCase().replace(/^www\./, "").split("/")[0] || null;
  }
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

  const name = cleanOptional(body.name, 200);
  const organizationType = cleanOptional(body.organization_type, 50);
  if (!name) return json({ error: "Organization name is required" }, 400);
  if (!organizationType || !allowedTypes.has(organizationType)) {
    return json({ error: "Invalid organization type" }, 400);
  }

  const admin = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name,
      normalized_name: name.toLowerCase(),
      organization_type: organizationType,
      website_url: cleanOptional(body.website_url),
      canonical_domain: normalizeDomain(body.canonical_domain ?? body.website_url),
      street_address: cleanOptional(body.street_address, 255),
      city: cleanOptional(body.city, 120),
      state_region: cleanOptional(body.state_region, 120),
      postal_code: cleanOptional(body.postal_code, 30),
      phone: cleanOptional(body.phone, 50),
    })
    .select("id")
    .single();

  if (orgError || !org) return json({ error: "Could not create organization" }, 500);

  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (memberError) {
    await admin.from("organizations").delete().eq("id", org.id);
    return json({ error: "Could not create organization membership" }, 500);
  }

  await admin.from("audit_events").insert({
    actor_user_id: user.id,
    organization_id: org.id,
    event_type: "organization_created",
    payload: { organization_type: organizationType },
  });

  return json({ organization_id: org.id }, 201);
});
