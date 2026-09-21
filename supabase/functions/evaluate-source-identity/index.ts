import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const text = (v: unknown) => typeof v === "string" ? v.trim() : "";
const norm = (v: unknown) => text(v).toLowerCase().replace(/[^a-z0-9]+/g, "");
const normState = (v: unknown) => text(v).toUpperCase().replace(/[^A-Z]/g, "");
const normPostal = (v: unknown) => text(v).replace(/[^0-9A-Za-z]/g, "").slice(0, 5).toUpperCase();
const normPhone = (v: unknown) => {
  const d = text(v).replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : d;
};
const normDomain = (v: unknown) => {
  let raw = text(v).toLowerCase();
  if (!raw) return "";
  try {
    if (!/^https?:\/\//.test(raw)) raw = "https://" + raw;
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^www\./, "").split("/")[0];
  }
};

function firstPartyUrls(target: Record<string, unknown>) {
  const urls: string[] = [];
  for (const key of ["first_party_social", "first_party_links"]) {
    const value = target[key];
    if (value && typeof value === "object") {
      for (const v of Object.values(value as Record<string, unknown>)) {
        if (typeof v === "string") urls.push(v.replace(/\/$/, "").toLowerCase());
      }
    }
  }
  return urls;
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
  if (userError || !userData.user) return json({ error: "Invalid session" }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json({ error: "Invalid JSON body" }, 400); }

  const runId = text(body.screening_run_id);
  const candidate = (body.candidate && typeof body.candidate === "object")
    ? body.candidate as Record<string, unknown> : {};
  const sourceUrl = text(candidate.source_url);
  const sourceType = text(candidate.source_type) || "third_party";
  if (!runId || !sourceUrl) return json({ error: "screening_run_id and candidate.source_url are required" }, 400);

  const { data: run, error: runError } = await userClient
    .from("screening_runs")
    .select("id, organization_id, canonical_identity_snapshot")
    .eq("id", runId).single();
  if (runError || !run) return json({ error: "Screening run not found or unauthorized" }, 404);

  const { data: org, error: orgError } = await userClient
    .from("organizations")
    .select("id,name,canonical_domain,website_url,street_address,city,state_region,postal_code,phone")
    .eq("id", run.organization_id).single();
  if (orgError || !org) return json({ error: "Organization not found or unauthorized" }, 404);

  const snap = (run.canonical_identity_snapshot && typeof run.canonical_identity_snapshot === "object")
    ? run.canonical_identity_snapshot as Record<string, unknown> : {};
  const target: Record<string, unknown> = {
    organization_name: snap.organization_name ?? snap.name ?? org.name,
    canonical_domain: snap.canonical_domain ?? org.canonical_domain ?? org.website_url,
    primary_address: snap.primary_address ?? snap.street_address ?? org.street_address,
    city: snap.city ?? org.city,
    state_region: snap.state_region ?? snap.state ?? org.state_region,
    postal_code: snap.postal_code ?? org.postal_code,
    phone: snap.phone ?? org.phone,
    first_party_social: snap.first_party_social,
    first_party_links: snap.first_party_links,
  };

  const observedDomain = text(candidate.observed_domain);
  const candidateDomain = normDomain(observedDomain);
  const targetDomain = normDomain(target.canonical_domain);
  const sourceDomain = normDomain(sourceUrl);
  const strong: string[] = [];
  const supporting: string[] = [];
  const conflicts: string[] = [];
  const differences: Record<string, { canonical: string; observed: string }> = {};

  const tName = norm(target.organization_name), cName = norm(candidate.observed_name);
  const tCity = norm(target.city), cCity = norm(candidate.observed_city);
  const tState = normState(target.state_region), cState = normState(candidate.observed_state);
  const tPostal = normPostal(target.postal_code), cPostal = normPostal(candidate.observed_postal_code);
  const tPhone = normPhone(target.phone), cPhone = normPhone(candidate.observed_phone);
  const tAddress = norm(target.primary_address), cAddress = norm(candidate.observed_address);

  if (targetDomain && sourceDomain === targetDomain) strong.push("canonical_domain");
  if (candidateDomain && targetDomain && candidateDomain === targetDomain) strong.push("observed_domain");
  if (tPhone && cPhone && tPhone === cPhone) strong.push("phone");
  if (tAddress && cAddress && tAddress === cAddress) strong.push("address");
  if (firstPartyUrls(target).includes(sourceUrl.replace(/\/$/, "").toLowerCase())) strong.push("verified_first_party_profile");

  if (tName && cName && tName === cName) supporting.push("name");
  if (tCity && cCity && tCity === cCity) supporting.push("city");
  if (tState && cState && tState === cState) supporting.push("state");
  if (tPostal && cPostal && tPostal === cPostal) supporting.push("postal_code");

  if (tState && cState && tState !== cState) conflicts.push("different_state");
  if (tCity && cCity && tCity !== cCity) conflicts.push("different_city");
  if (targetDomain && candidateDomain && targetDomain !== candidateDomain) conflicts.push("different_domain");
  if (tPhone && cPhone && tPhone !== cPhone) conflicts.push("different_phone");

  if (tAddress && cAddress && tAddress !== cAddress) differences.address = { canonical: text(target.primary_address), observed: text(candidate.observed_address) };
  if (tPhone && cPhone && tPhone !== cPhone) differences.phone = { canonical: text(target.phone), observed: text(candidate.observed_phone) };
  if (targetDomain && candidateDomain && targetDomain !== candidateDomain) differences.domain = { canonical: targetDomain, observed: candidateDomain };
  if (tPostal && cPostal && tPostal !== cPostal) differences.postal_code = { canonical: text(target.postal_code), observed: text(candidate.observed_postal_code) };

  let status: "confirmed" | "rejected" | "ambiguous" = "ambiguous";
  let confidence = 0.5;
  let reason = "insufficient verified identity signals";
  const stateConflict = conflicts.includes("different_state");
  const cityConflict = conflicts.includes("different_city");
  const strongCount = new Set(strong).size;
  const supportCount = new Set(supporting).size;

  if (stateConflict) {
    if (strongCount >= 2) {
      status = "ambiguous"; confidence = 0.7;
      reason = "strong identity signals exist but state conflicts; excluded pending branch/campus verification";
    } else {
      status = "rejected"; confidence = 0.99;
      reason = "different state without sufficient verified relationship";
    }
  } else if (cityConflict && strongCount === 0) {
    status = "rejected"; confidence = 0.95;
    reason = "different city without a strong identity match";
  } else if (strongCount >= 1) {
    status = "confirmed"; confidence = strongCount >= 2 ? 0.99 : 0.96;
    reason = "confirmed by strong identity signal";
  } else if (supportCount >= 2) {
    status = "confirmed"; confidence = supportCount >= 3 ? 0.9 : 0.82;
    reason = "confirmed by multiple supporting identity signals with no decisive conflict";
  }

  const included = status === "confirmed";
  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const row = {
    screening_run_id: runId, source_url: sourceUrl, source_type: sourceType,
    observed_name: text(candidate.observed_name) || null,
    observed_domain: observedDomain || null,
    observed_address: text(candidate.observed_address) || null,
    observed_city: text(candidate.observed_city) || null,
    observed_state: text(candidate.observed_state) || null,
    observed_postal_code: text(candidate.observed_postal_code) || null,
    observed_phone: text(candidate.observed_phone) || null,
    match_status: status,
    match_basis: [...new Set([...strong, ...supporting])],
    confidence, included_in_score: included,
    excluded_reason: included ? null : reason,
    identity_conflicts: conflicts, field_differences: differences,
    fetched_at: new Date().toISOString(),
  };

  const { data: stored, error: storeError } = await admin
    .from("screening_sources")
    .upsert(row, { onConflict: "screening_run_id,source_url" })
    .select("id,match_status,match_basis,confidence,included_in_score,excluded_reason,identity_conflicts,field_differences")
    .single();
  if (storeError) return json({ error: "Could not persist source decision" }, 500);

  await admin.from("audit_events").insert({
    actor_user_id: userData.user.id,
    organization_id: run.organization_id,
    event_type: status === "confirmed" ? "source_identity_confirmed" : status === "rejected" ? "source_identity_rejected" : "source_identity_ambiguous",
    payload: { screening_run_id: runId, source_url: sourceUrl, match_basis: row.match_basis, conflicts, included_in_score: included },
  });

  return json({ source: stored, decision_reason: reason });
});
