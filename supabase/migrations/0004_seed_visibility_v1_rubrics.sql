insert into public.rubric_versions (name, version, screening_type, config)
values
(
  'PDM Visibility Universal Core', 'visibility-v1', 'universal',
  '{"total_points":100,"universal_core_points":70,"sector_module_points":30,"criterion_scale":{"min":0,"max":4},"universal_categories":[{"key":"findability_identity","label":"Findability and Identity","points":10},{"key":"local_presence_reputation","label":"Local Presence and Reputation","points":10},{"key":"organic_search_visibility","label":"Organic Search Visibility","points":10},{"key":"message_clarity","label":"Message Clarity","points":10},{"key":"mobile_experience_performance","label":"Mobile Experience and Performance","points":10},{"key":"conversion_readiness","label":"Conversion Readiness","points":10},{"key":"measurement_freshness","label":"Measurement and Freshness","points":10}],"identity_gate_required":true,"critical_issue_override":true}'::jsonb
),
(
  'PDM Visibility Business', 'visibility-v1', 'business',
  '{"inherits":"visibility-v1:universal","sector_points":30,"sector":"local_service_business","areas":["service_product_clarity","local_intent","quote_booking_contact","reputation","portfolio_proof_media","lead_tracking_followup"],"identity_gate_required":true}'::jsonb
),
(
  'PDM Visibility Non-Profit', 'visibility-v1', 'nonprofit',
  '{"inherits":"visibility-v1:universal","sector_points":30,"sector":"nonprofit_community","areas":["mission_impact_clarity","donation_experience","volunteer_supporter_pathway","program_service_access","transparency_trust","email_event_advocacy_engagement"],"identity_gate_required":true}'::jsonb
),
(
  'PDM Visibility Faith & Ministry', 'visibility-v1', 'faith_ministry',
  '{"inherits":"visibility-v1:universal","sector_points":30,"sector":"faith_ministry","areas":["visit_service_information","giving","events_groups","sermons_media_live","contact_prayer_help","app_email_member_engagement"],"identity_gate_required":true}'::jsonb
),
(
  'PDM Visibility Organization', 'visibility-v1', 'organization',
  '{"inherits":"visibility-v1:universal","sector_points":30,"sector":"general_organization","areas":["mission_service_clarity","primary_action_pathway","trust_proof","program_service_access","contact_readiness","engagement_followup"],"identity_gate_required":true}'::jsonb
)
on conflict (screening_type, version) do update
set name = excluded.name, config = excluded.config;
