create or replace function public.site_save_screening_report(
  p_screening_type text,
  p_organization_name text,
  p_input_snapshot jsonb,
  p_report_snapshot jsonb,
  p_display_score numeric default null,
  p_report_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_report_id uuid := coalesce(p_report_id, gen_random_uuid());
  v_saved_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  if p_screening_type not in ('business', 'nonprofit', 'faith_ministry', 'organization') then
    raise exception 'invalid screening type'
      using errcode = '22023';
  end if;

  if p_organization_name is null
     or length(btrim(p_organization_name)) < 1
     or length(btrim(p_organization_name)) > 240 then
    raise exception 'invalid organization name'
      using errcode = '22023';
  end if;

  if p_input_snapshot is null
     or jsonb_typeof(p_input_snapshot) <> 'object'
     or octet_length(p_input_snapshot::text) > 1048576 then
    raise exception 'invalid input snapshot'
      using errcode = '22023';
  end if;

  if p_report_snapshot is null
     or jsonb_typeof(p_report_snapshot) <> 'object'
     or octet_length(p_report_snapshot::text) > 2097152 then
    raise exception 'invalid report snapshot'
      using errcode = '22023';
  end if;

  if p_display_score is not null
     and (p_display_score < 0 or p_display_score > 100) then
    raise exception 'display score out of range'
      using errcode = '22023';
  end if;

  insert into public.site_screening_reports (
    id,
    created_by,
    screening_type,
    organization_name,
    input_snapshot,
    report_snapshot,
    display_score
  )
  values (
    v_report_id,
    v_user_id,
    p_screening_type,
    btrim(p_organization_name),
    p_input_snapshot,
    p_report_snapshot,
    p_display_score
  )
  on conflict (id) do nothing
  returning id into v_saved_id;

  if v_saved_id is not null then
    return v_saved_id;
  end if;

  select id
    into v_saved_id
  from public.site_screening_reports
  where id = v_report_id
    and created_by = v_user_id
    and deleted_at is null;

  if v_saved_id is null then
    raise exception 'report id already exists'
      using errcode = '23505';
  end if;

  return v_saved_id;
end;
$$;

revoke all on function public.site_save_screening_report(
  text, text, jsonb, jsonb, numeric, uuid
) from public, anon;

grant execute on function public.site_save_screening_report(
  text, text, jsonb, jsonb, numeric, uuid
) to authenticated;
