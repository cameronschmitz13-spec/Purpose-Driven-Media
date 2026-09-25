import { evaluateSourceIdentity } from "./identity.ts";
import {
  criterionWeight,
  expectedKeys,
  RUBRIC_VERSION,
  weightedPoints,
} from "./rubric.ts";
import type {
  CriterionAssessment,
  EvaluatedSource,
  FinalizerEntry,
  PriorityItem,
  ScreeningInput,
  ScreeningOutput,
} from "./types.ts";

function assertFinite01(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }
}

function assessmentMap(
  input: ScreeningInput,
  scope: "universal" | "sector",
) {
  return new Map(
    input.assessments
      .filter((assessment) => assessment.scope === scope)
      .map((assessment) => [assessment.key, assessment]),
  );
}

function validateAssessmentSet(input: ScreeningInput) {
  if (input.rubric_version !== RUBRIC_VERSION) {
    throw new Error(
      `Unsupported rubric version ${input.rubric_version}; expected ${RUBRIC_VERSION}`,
    );
  }

  const expected = expectedKeys(input.screening_type);
  const universal = assessmentMap(input, "universal");
  const sector = assessmentMap(input, "sector");

  const duplicateKey = input.assessments.find((assessment, index, all) =>
    all.findIndex((other) =>
      other.scope === assessment.scope && other.key === assessment.key
    ) !== index
  );
  if (duplicateKey) {
    throw new Error(
      `Duplicate assessment: ${duplicateKey.scope}:${duplicateKey.key}`,
    );
  }

  for (const key of expected.universal) {
    if (!universal.has(key)) throw new Error(`Missing universal assessment: ${key}`);
  }
  for (const key of expected.sector) {
    if (!sector.has(key)) throw new Error(`Missing sector assessment: ${key}`);
  }

  if (universal.size !== expected.universal.length) {
    throw new Error("Unexpected universal assessment key supplied");
  }
  if (sector.size !== expected.sector.length) {
    throw new Error("Unexpected sector assessment key supplied");
  }
}

function evaluateSources(input: ScreeningInput): EvaluatedSource[] {
  const ids = new Set<string>();
  return input.sources.map((source) => {
    if (!source.id) throw new Error("Every source requires a stable id");
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    ids.add(source.id);

    return {
      ...source,
      identity: evaluateSourceIdentity(input.target, source),
    };
  });
}

function validateEvidence(
  assessment: CriterionAssessment,
  sourcesById: Map<string, EvaluatedSource>,
) {
  if (!assessment.explanation.trim()) {
    throw new Error(`Assessment ${assessment.key} requires an explanation`);
  }
  assertFinite01(assessment.confidence, `Assessment ${assessment.key} confidence`);

  const sourceIds = assessment.source_ids ?? [];

  if (assessment.evidence_basis === "source" && sourceIds.length === 0) {
    throw new Error(
      `Assessment ${assessment.key} uses source evidence but has no source_ids`,
    );
  }

  for (const sourceId of sourceIds) {
    const source = sourcesById.get(sourceId);
    if (!source) {
      throw new Error(
        `Assessment ${assessment.key} references unknown source ${sourceId}`,
      );
    }
    if (!source.identity.included_in_score) {
      throw new Error(
        `Assessment ${assessment.key} references ${source.identity.status} source ${sourceId}; rejected/ambiguous evidence cannot affect scoring`,
      );
    }
  }
}

function toFinalizerEntry(
  assessment: CriterionAssessment,
): FinalizerEntry {
  const sourceIds = assessment.source_ids ?? [];
  return {
    rating: assessment.rating,
    confidence: assessment.confidence,
    ...(sourceIds[0] ? { source_id: sourceIds[0] } : {}),
    explanation: assessment.explanation,
    raw_value: {
      ...(assessment.raw_value ?? {}),
      evidence_basis: assessment.evidence_basis,
      evidence_source_ids: sourceIds,
      rating: assessment.rating,
    },
  };
}

function buildPriorities(
  input: ScreeningInput,
): PriorityItem[] {
  const ordered = [...input.assessments]
    .sort((a, b) => {
      const aCritical = a.critical_issue ? 1 : 0;
      const bCritical = b.critical_issue ? 1 : 0;
      if (aCritical !== bCritical) return bCritical - aCritical;
      if (a.rating !== b.rating) return a.rating - b.rating;

      const aWeight = criterionWeight(input.screening_type, a.scope, a.key);
      const bWeight = criterionWeight(input.screening_type, b.scope, b.key);
      if (aWeight !== bWeight) return bWeight - aWeight;

      if (a.confidence !== b.confidence) return b.confidence - a.confidence;
      return a.key.localeCompare(b.key);
    })
    .slice(0, 3);

  return ordered.map((assessment, index) => ({
    rank: index + 1,
    key: assessment.key,
    scope: assessment.scope,
    rating: assessment.rating,
    confidence: assessment.confidence,
    critical: Boolean(assessment.critical_issue),
    explanation: assessment.explanation,
    source_ids: assessment.source_ids ?? [],
  }));
}

export function runScreening(input: ScreeningInput): ScreeningOutput {
  validateAssessmentSet(input);

  const sources = evaluateSources(input);
  const sourcesById = new Map(sources.map((source) => [source.id, source]));

  for (const assessment of input.assessments) {
    if (assessment.rating < 0 || assessment.rating > 4) {
      throw new Error(
        `Assessment ${assessment.key} rating must be between 0 and 4`,
      );
    }
    validateEvidence(assessment, sourcesById);
  }

  const universal: Record<string, FinalizerEntry> = {};
  const sector: Record<string, FinalizerEntry> = {};
  let previewTotal = 0;

  for (const assessment of input.assessments) {
    const weight = criterionWeight(
      input.screening_type,
      assessment.scope,
      assessment.key,
    );
    previewTotal += weightedPoints(assessment.rating, weight);

    const target = assessment.scope === "universal" ? universal : sector;
    target[assessment.key] = toFinalizerEntry(assessment);
  }

  previewTotal = Math.round(previewTotal * 100) / 100;

  const criticalIssues = input.assessments
    .filter((assessment) => Boolean(assessment.critical_issue))
    .map((assessment) => ({
      criterion_key: assessment.key,
      title: assessment.critical_issue!.title,
      detail: assessment.critical_issue!.detail,
      source_ids: assessment.source_ids ?? [],
    }));

  const priorities = buildPriorities(input);

  const finalizerPayload = {
    screening_run_id: input.run_id,
    ratings: { universal, sector },
    critical_issues: criticalIssues,
    ...(typeof input.planning_target === "number"
      ? { planning_target: input.planning_target }
      : {}),
  };

  const accepted = sources.filter((source) => source.identity.included_in_score);
  const excluded = sources.filter((source) => !source.identity.included_in_score);

  const reportSnapshot = {
    schema_version: "pdm-screening-report-v1",
    rubric_version: RUBRIC_VERSION,
    observed_at: input.observed_at,
    screening_type: input.screening_type,
    canonical_identity: input.target,
    preview_total: previewTotal,
    critical_visibility_leak: criticalIssues.length > 0,
    critical_issues: criticalIssues,
    top_3_priorities: priorities,
    assessments: input.assessments,
    accepted_evidence: accepted,
    excluded_or_ambiguous_evidence: excluded,
    production_note:
      "preview_total mirrors visibility-v1 math; the Supabase transactional finalizer remains authoritative for persisted production scores",
  };

  return {
    rubric_version: RUBRIC_VERSION,
    target: input.target,
    sources,
    accepted_source_ids: accepted.map((source) => source.id),
    excluded_source_ids: excluded.map((source) => source.id),
    preview_total: previewTotal,
    priorities,
    finalizer_payload: finalizerPayload,
    report_snapshot: reportSnapshot,
  };
}
