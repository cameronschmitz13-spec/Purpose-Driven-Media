-- Make visibility-v1's 0-4 rating scale reproducible.
-- Safe to refine because there are no screening_runs yet.

update public.rubric_versions
set config = config || '{
  "scoring_method":"weighted_normalized_0_4",
  "formula":"points = (rating / 4) * weight",
  "rounding":"2_decimal_places",
  "critical_issue_behavior":"flag_without_silently_rewriting_total"
}'::jsonb
where version='visibility-v1';

update public.rubric_versions
set config = jsonb_set(
  config,
  '{universal_categories}',
  '[
    {"key":"findability_identity","label":"Findability and Identity","points":10,"rating_min":0,"rating_max":4},
    {"key":"local_presence_reputation","label":"Local Presence and Reputation","points":10,"rating_min":0,"rating_max":4},
    {"key":"organic_search_visibility","label":"Organic Search Visibility","points":10,"rating_min":0,"rating_max":4},
    {"key":"message_clarity","label":"Message Clarity","points":10,"rating_min":0,"rating_max":4},
    {"key":"mobile_experience_performance","label":"Mobile Experience and Performance","points":10,"rating_min":0,"rating_max":4},
    {"key":"conversion_readiness","label":"Conversion Readiness","points":10,"rating_min":0,"rating_max":4},
    {"key":"measurement_freshness","label":"Measurement and Freshness","points":10,"rating_min":0,"rating_max":4}
  ]'::jsonb
)
where screening_type='universal' and version='visibility-v1';

update public.rubric_versions
set config = jsonb_set(
  config,
  '{area_weights}',
  (
    select jsonb_object_agg(area, 5)
    from jsonb_array_elements_text(config->'areas') as area
  )
)
where screening_type in ('business','nonprofit','faith_ministry','organization')
  and version='visibility-v1';
