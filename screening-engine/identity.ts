import type {
  CandidateSource,
  CanonicalIdentity,
  IdentityDecision,
} from "./types.ts";

const text = (v: unknown) => typeof v === "string" ? v.trim() : "";
const norm = (v: unknown) => text(v).toLowerCase().replace(/[^a-z0-9]+/g, "");
const normState = (v: unknown) => text(v).toUpperCase().replace(/[^A-Z]/g, "");
const normPostal = (v: unknown) =>
  text(v).replace(/[^0-9A-Za-z]/g, "").slice(0, 5).toUpperCase();

const normPhone = (v: unknown) => {
  const digits = text(v).replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

export const normDomain = (v: unknown) => {
  let raw = text(v).toLowerCase();
  if (!raw) return "";
  try {
    if (!/^https?:\/\//.test(raw)) raw = "https://" + raw;
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^www\./, "").split("/")[0];
  }
};

function firstPartyUrls(target: CanonicalIdentity) {
  return [
    ...Object.values(target.first_party_social ?? {}),
    ...Object.values(target.first_party_links ?? {}),
  ].map((url) => url.replace(/\/$/, "").toLowerCase());
}

export function evaluateSourceIdentity(
  target: CanonicalIdentity,
  candidate: CandidateSource,
): IdentityDecision {
  const targetDomain = normDomain(target.canonical_domain ?? target.website_url);
  const sourceDomain = normDomain(candidate.source_url);
  const candidateDomain = normDomain(candidate.observed_domain);

  const strong: string[] = [];
  const supporting: string[] = [];
  const conflicts: string[] = [];
  const field_differences: Record<string, { canonical: string; observed: string }> = {};

  const tName = norm(target.organization_name);
  const cName = norm(candidate.observed_name);
  const tCity = norm(target.city);
  const cCity = norm(candidate.observed_city);
  const tState = normState(target.state_region);
  const cState = normState(candidate.observed_state);
  const tPostal = normPostal(target.postal_code);
  const cPostal = normPostal(candidate.observed_postal_code);
  const tPhone = normPhone(target.phone);
  const cPhone = normPhone(candidate.observed_phone);
  const tAddress = norm(target.primary_address);
  const cAddress = norm(candidate.observed_address);

  if (targetDomain && sourceDomain === targetDomain) strong.push("canonical_domain");
  if (candidateDomain && targetDomain && candidateDomain === targetDomain) {
    strong.push("observed_domain");
  }
  if (tPhone && cPhone && tPhone === cPhone) strong.push("phone");
  if (tAddress && cAddress && tAddress === cAddress) strong.push("address");

  if (
    firstPartyUrls(target).includes(
      candidate.source_url.replace(/\/$/, "").toLowerCase(),
    )
  ) {
    strong.push("verified_first_party_profile");
  }

  if (tName && cName && tName === cName) supporting.push("name");
  if (tCity && cCity && tCity === cCity) supporting.push("city");
  if (tState && cState && tState === cState) supporting.push("state");
  if (tPostal && cPostal && tPostal === cPostal) supporting.push("postal_code");

  if (tState && cState && tState !== cState) conflicts.push("different_state");
  if (tCity && cCity && tCity !== cCity) conflicts.push("different_city");
  if (targetDomain && candidateDomain && targetDomain !== candidateDomain) {
    conflicts.push("different_domain");
  }
  if (tPhone && cPhone && tPhone !== cPhone) conflicts.push("different_phone");
  if (tAddress && cAddress && tAddress !== cAddress) conflicts.push("different_address");

  if (tAddress && cAddress && tAddress !== cAddress) {
    field_differences.address = {
      canonical: text(target.primary_address),
      observed: text(candidate.observed_address),
    };
  }
  if (tPhone && cPhone && tPhone !== cPhone) {
    field_differences.phone = {
      canonical: text(target.phone),
      observed: text(candidate.observed_phone),
    };
  }
  if (targetDomain && candidateDomain && targetDomain !== candidateDomain) {
    field_differences.domain = {
      canonical: targetDomain,
      observed: candidateDomain,
    };
  }
  if (tPostal && cPostal && tPostal !== cPostal) {
    field_differences.postal_code = {
      canonical: text(target.postal_code),
      observed: text(candidate.observed_postal_code),
    };
  }

  let status: IdentityDecision["status"] = "ambiguous";
  let confidence = 0.5;
  let reason = "insufficient verified identity signals";

  const strongCount = new Set(strong).size;
  const supportCount = new Set(supporting).size;
  const strongFieldConflictCount = [
    "different_domain",
    "different_phone",
    "different_address",
  ].filter((key) => conflicts.includes(key)).length;

  if (conflicts.includes("different_state")) {
    if (strongCount >= 2) {
      status = "ambiguous";
      confidence = 0.7;
      reason =
        "strong identity signals exist but state conflicts; excluded pending branch/campus verification";
    } else {
      status = "rejected";
      confidence = 0.99;
      reason = "different state without sufficient verified relationship";
    }
  } else if (conflicts.includes("different_city") && strongCount === 0) {
    status = "rejected";
    confidence = 0.95;
    reason = "different city without a strong identity match";
  } else if (strongCount >= 1) {
    status = "confirmed";
    confidence = strongCount >= 2 ? 0.99 : 0.96;
    reason = "confirmed by strong identity signal";
  } else if (strongFieldConflictCount >= 2) {
    status = "rejected";
    confidence = 0.95;
    reason = "multiple strong identity fields conflict with the canonical organization";
  } else if (strongFieldConflictCount === 1) {
    status = "ambiguous";
    confidence = 0.65;
    reason = "supporting identity signals exist but a strong identity field conflicts";
  } else if (supportCount >= 2) {
    status = "confirmed";
    confidence = supportCount >= 3 ? 0.9 : 0.82;
    reason = "confirmed by multiple supporting identity signals with no decisive conflict";
  }

  return {
    status,
    confidence,
    included_in_score: status === "confirmed",
    reason,
    match_basis: [...new Set([...strong, ...supporting])],
    conflicts,
    field_differences,
  };
}
