create or replace function public.finalize_screening_score(
  p_screening_run_id uuid,
  p_ratings jsonb,
  p_critical_issues jsonb default '[]'::jsonb,
  p_planning_target numeric default null
)
returns table(total_score numeric, report_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  run_row public.screening_runs%rowtype;
  sector_config jsonb;
  universal_config jsonb;
  category jsonb;
  area record;
  entry jsonb;
  rating numeric;
  weight numeric;
  source_uuid uuid;
  running_total numeric := 0;
  running_max numeric := 0;
  expected_universal_count integer := 0;
  expected_sector_count integer := 0;
  supplied_universal_count integer := 0;
  supplied_sector_count integer := 0;
  new_report_id uuid;
begin
  select * into run_row
  from public.screening_runs
  where id = p_screening_run_id
  for update;

  if run_row.id is null then raise exception 'Screening run not found'; end if;
  if run_row.status = 'complete' then raise exception 'Completed screening reports are immutable'; end if;

  select config into sector_config
  from public.rubric_versions
  where id = run_row.rubric_version_id;

  select config into universal_config
  from public.rubric_versions
  where screening_type = 'universal'
    and version = (
      select version from public.rubric_versions where id = run_row.rubric_version_id
    );

  if sector_config is null or universal_config is null then
    raise exception 'Rubric configuration missing';
  end if;

  if jsonb_typeof(p_ratings->'universal') <> 'object'
     or jsonb_typeof(p_ratings->'sector') <> 'object' then
    raise exception 'Ratings must contain universal and sector objects';
  end if;

  select count(*) into expected_universal_count
  from jsonb_array_elements(universal_config->'universal_categories');

  select count(*) into expected_sector_count
  from jsonb_each(sector_config->'area_weights');

  select count(*) into supplied_universal_count
  from jsonb_object_keys(p_ratings->'universal');

  select count(*) into supplied_sector_count
  from jsonb_object_keys(p_ratings->'sector');

  if supplied_universal_count <> expected_universal_count then
    raise exception 'Universal rating count does not match rubric';
  end if;

  if supplied_sector_count <> expected_sector_count then
    raise exception 'Sector rating count does not match rubric';
  end if;

  delete from public.screening_findings
  where screening_run_id = p_screening_run_id;

  for category in
    select value from jsonb_array_elements(universal_config->'universal_categories')
  loop
    entry := p_ratings->'universal'->(category->>'key');
    if entry is null then raise exception 'Missing universal rating: %', category->>'key'; end if;
    rating := (entry->>'rating')::numeric;
    weight := (category->>'points')::numeric;
    if rating < 0 or rating > 4 then raise exception 'Rating out of range: %', category->>'key'; end if;
    source_uuid := nullif(entry->>'source_id','')::uuid;

    insert into public.screening_findings(
      screening_run_id, category_key, rule_key, finding_type, raw_value,
      score, max_score, confidence, source_id, explanation
    ) values (
      p_screening_run_id, category->>'key', 'rating', 'universal_rating',
      coalesce(entry->'raw_value','{}'::jsonb),
      round((rating / 4) * weight, 3), weight,
      nullif(entry->>'confidence','')::numeric, source_uuid, entry->>'explanation'
    );

    running_total := running_total + round((rating / 4) * weight, 3);
    running_max := running_max + weight;
  end loop;

  for area in
    select key, value from jsonb_each_text(sector_config->'area_weights')
  loop
    entry := p_ratings->'sector'->area.key;
    if entry is null then raise exception 'Missing sector rating: %', area.key; end if;
    rating := (entry->>'rating')::numeric;
    weight := area.value::numeric;
    if rating < 0 or rating > 4 then raise exception 'Rating out of range: %', area.key; end if;
    source_uuid := nullif(entry->>'source_id','')::uuid;

    insert into public.screening_findings(
      screening_run_id, category_key, rule_key, finding_type, raw_value,
      score, max_score, confidence, source_id, explanation
    ) values (
      p_screening_run_id, area.key, 'rating', 'sector_rating',
      coalesce(entry->'raw_value','{}'::jsonb),
      round((rating / 4) * weight, 3), weight,
      nullif(entry->>'confidence','')::numeric, source_uuid, entry->>'explanation'
    );

    running_total := running_total + round((rating / 4) * weight, 3);
    running_max := running_max + weight;
  end loop;

  if running_max <> 100 then raise exception 'Rubric max score must equal 100, got %', running_max; end if;
  if p_critical_issues is null or jsonb_typeof(p_critical_issues) <> 'array' then
    raise exception 'critical_issues must be a JSON array';
  end if;

  insert into public.screening_reports(
    screening_run_id, total_score, planning_target, report_snapshot
  ) values (
    p_screening_run_id, round(running_total, 2), p_planning_target,
    jsonb_build_object(
      'rubric_version', (select version from public.rubric_versions where id = run_row.rubric_version_id),
      'calculated_total', round(running_total, 2),
      'critical_issues', p_critical_issues,
      'critical_visibility_leak', jsonb_array_length(p_critical_issues) > 0,
      'completed_at', now()
    )
  )
  on conflict (screening_run_id) do update
  set total_score = excluded.total_score,
      planning_target = excluded.planning_target,
      report_snapshot = excluded.report_snapshot
  returning id into new_report_id;

  update public.screening_runs
  set status = 'complete', completed_at = now()
  where id = p_screening_run_id;

  insert into public.audit_events(actor_user_id, organization_id, event_type, payload)
  values (
    null, run_row.organization_id, 'screening_completed',
    jsonb_build_object(
      'screening_run_id', p_screening_run_id,
      'total_score', round(running_total, 2),
      'critical_issue_count', jsonb_array_length(p_critical_issues)
    )
  );

  return query select round(running_total, 2), new_report_id;
end;
$$;

revoke all on function public.finalize_screening_score(uuid,jsonb,jsonb,numeric)
from public, anon, authenticated;

grant execute on function public.finalize_screening_score(uuid,jsonb,jsonb,numeric)
to service_role;
