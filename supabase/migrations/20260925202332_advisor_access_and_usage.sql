-- Foundation only: no entitlements seeded. Server must validate JWT with auth.getUser.
-- All RPCs are SECURITY INVOKER and callable only by service_role.
alter table public.screening_runs add constraint screening_runs_id_org_unique unique (id, organization_id);
create table public.advisor_entitlements (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, screening_run_id uuid not null,
 status text not null default 'pending' check (status in ('pending','active','revoked')),
 starts_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz,
 payment_provider text not null check (length(trim(payment_provider)) between 1 and 40),
 payment_reference text not null check (length(trim(payment_reference)) between 1 and 200),
 payment_event_id text not null check (length(trim(payment_event_id)) between 1 and 200),
 payment_verified_at timestamptz not null, created_at timestamptz not null default now(),
 unique (payment_provider,payment_event_id),
 foreign key (screening_run_id,organization_id) references public.screening_runs(id,organization_id) on delete cascade,
 check (expires_at is null or expires_at > starts_at), check ((status = 'revoked') = (revoked_at is not null))
);
create index advisor_entitlements_run_idx on public.advisor_entitlements(screening_run_id,organization_id,status);
create table public.advisor_conversations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, screening_run_id uuid not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 prompt_version text not null default 'pdm-advisor-v1', created_at timestamptz not null default now(),
 unique (id,organization_id,screening_run_id,user_id),
 foreign key (screening_run_id,organization_id) references public.screening_runs(id,organization_id) on delete cascade
);
create index advisor_conversations_owner_idx on public.advisor_conversations(user_id,screening_run_id);
create index advisor_conversations_run_idx on public.advisor_conversations(screening_run_id,organization_id);
create table public.advisor_requests (
 id uuid primary key, conversation_id uuid not null, organization_id uuid not null,
 screening_run_id uuid not null, user_id uuid not null,
 tier smallint not null check (tier between 0 and 3),
 reserved_tokens integer not null check (reserved_tokens between 0 and 24000),
 status text not null default 'reserved' check (status in ('reserved','complete','failed')),
 input_tokens integer check (input_tokens >= 0), output_tokens integer check (output_tokens >= 0),
 cost_usd numeric(12,6) check (cost_usd >= 0), generator_model text, verifier_model text,
 created_at timestamptz not null default now(), finished_at timestamptz, unique (id,conversation_id),
 foreign key (conversation_id,organization_id,screening_run_id,user_id)
 references public.advisor_conversations(id,organization_id,screening_run_id,user_id) on delete cascade
);
create index advisor_requests_budget_idx on public.advisor_requests(user_id,created_at);
create index advisor_requests_run_budget_idx on public.advisor_requests(screening_run_id,created_at);
create index advisor_requests_conversation_idx on public.advisor_requests(conversation_id);
create table public.advisor_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.advisor_conversations(id) on delete cascade,
 request_id uuid not null,
 foreign key (request_id,conversation_id) references public.advisor_requests(id,conversation_id) on delete cascade,
 role text not null check (role in ('user','assistant')),
 content text not null check (length(content) between 1 and 24000),
 citations jsonb not null default '[]' check (jsonb_typeof(citations) = 'array' and octet_length(citations::text) <= 32000),
 verification jsonb not null default '{}' check (jsonb_typeof(verification) = 'object' and octet_length(verification::text) <= 32000),
 created_at timestamptz not null default now(), unique (request_id,role)
);
create index advisor_messages_conversation_idx on public.advisor_messages(conversation_id,created_at);
create table public.advisor_feedback (
 message_id uuid not null references public.advisor_messages(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 helpful boolean not null, created_at timestamptz not null default now(), primary key (message_id,user_id)
);
create index advisor_feedback_user_idx on public.advisor_feedback(user_id);
alter table public.advisor_entitlements enable row level security;
alter table public.advisor_conversations enable row level security;
alter table public.advisor_requests enable row level security;
alter table public.advisor_messages enable row level security;
alter table public.advisor_feedback enable row level security;
revoke all on public.advisor_entitlements,public.advisor_conversations,public.advisor_requests,public.advisor_messages,public.advisor_feedback from public,anon,authenticated;
grant all on public.advisor_entitlements,public.advisor_conversations,public.advisor_requests,public.advisor_messages,public.advisor_feedback to service_role;
grant select (id,organization_id,screening_run_id,status,starts_at,expires_at,revoked_at) on public.advisor_entitlements to authenticated;
grant select on public.advisor_conversations,public.advisor_messages,public.advisor_feedback to authenticated;
create policy advisor_entitlements_member_read on public.advisor_entitlements for select to authenticated
 using ((select private.is_org_member(organization_id)));
create policy advisor_conversations_owner_read on public.advisor_conversations for select to authenticated
 using (user_id = (select auth.uid()) and (select private.is_org_member(organization_id)));
create policy advisor_messages_owner_read on public.advisor_messages for select to authenticated
 using (exists (select 1 from public.advisor_conversations c where c.id = conversation_id));
create policy advisor_feedback_owner_read on public.advisor_feedback for select to authenticated
 using (user_id = (select auth.uid()) and exists (select 1 from public.advisor_messages m where m.id = message_id));
create function private.advisor_authorize(p_user_id uuid,p_run_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_org uuid;
begin
 if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id and deleted_at is null and (banned_until is null or banned_until <= now())) then
  raise exception 'Advisor access denied' using errcode = '42501'; end if;
 select r.organization_id into v_org from public.screening_runs r
 join public.screening_reports s on s.screening_run_id = r.id
 join public.organization_members m on m.organization_id = r.organization_id
 where r.id = p_run_id and r.status = 'complete' and m.user_id = p_user_id and m.status = 'active';
 if v_org is null or not exists (select 1 from public.advisor_entitlements e
  where e.organization_id = v_org and e.screening_run_id = p_run_id and e.status = 'active'
  and e.revoked_at is null and e.starts_at <= now() and (e.expires_at is null or e.expires_at > now())
  and e.payment_verified_at <= now()) then raise exception 'Advisor access denied' using errcode = '42501'; end if;
 return v_org;
end; $$;
revoke all on function private.advisor_authorize(uuid,uuid) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.advisor_authorize(uuid,uuid) to service_role;
create function public.advisor_begin_request(
 p_user_id uuid,p_run_id uuid,p_request_id uuid,p_question text,
 p_tier smallint,p_token_budget integer,p_conversation_id uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_org uuid; v_conversation uuid; v_existing public.advisor_requests%rowtype;
begin
 v_org := private.advisor_authorize(p_user_id,p_run_id);
 if p_request_id is null or p_question is null or length(trim(p_question)) not between 1 and 6000
  or p_tier is null or p_tier not between 0 and 3 or p_token_budget is null or p_token_budget not between 0 and 24000
  or (p_tier = 0 and p_token_budget <> 0) or (p_tier > 0 and p_token_budget < 1) then
  raise exception 'Invalid Advisor request' using errcode = '22023'; end if;
 -- Consistent lock order serializes both user-wide and run-wide budget reservations.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('advisor-user:' || p_user_id::text,0));
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('advisor-run:' || p_run_id::text,0));
 v_org := private.advisor_authorize(p_user_id,p_run_id);
 select * into v_existing from public.advisor_requests where id = p_request_id;
 if found then
  if v_existing.user_id <> p_user_id or v_existing.screening_run_id <> p_run_id
   or (p_conversation_id is not null and v_existing.conversation_id <> p_conversation_id)
   or v_existing.tier <> p_tier or v_existing.reserved_tokens <> p_token_budget
   or not exists (select 1 from public.advisor_messages where request_id = p_request_id and role = 'user' and content = p_question) then
   raise exception 'Request identifier conflict' using errcode = '42501'; end if;
  return jsonb_build_object('request_id',p_request_id,'conversation_id',v_existing.conversation_id,'status',v_existing.status,'replayed',true);
 end if;
 if p_conversation_id is not null then
  select id into v_conversation from public.advisor_conversations where id = p_conversation_id
   and user_id = p_user_id and screening_run_id = p_run_id and organization_id = v_org;
  if v_conversation is null then raise exception 'Conversation access denied' using errcode = '42501'; end if;
 end if;
 -- Failed/abandoned requests remain charged: retries cannot reset the rolling caps.
 if (select count(*) from public.advisor_requests where user_id = p_user_id and created_at > now() - interval '1 minute') >= 6
  or (select count(*) from public.advisor_requests where user_id = p_user_id and created_at > now() - interval '24 hours') >= 100
  or (select count(*) from public.advisor_requests where screening_run_id = p_run_id and created_at > now() - interval '24 hours') >= 250
  or (select coalesce(sum(reserved_tokens),0) from public.advisor_requests where user_id = p_user_id and created_at > now() - interval '24 hours') + p_token_budget > 240000
  or (select coalesce(sum(reserved_tokens),0) from public.advisor_requests where screening_run_id = p_run_id and created_at > now() - interval '24 hours') + p_token_budget > 600000 then
  raise exception 'Advisor request budget exceeded' using errcode = 'P0001'; end if;
 if v_conversation is null then
  insert into public.advisor_conversations(organization_id,screening_run_id,user_id)
   values (v_org,p_run_id,p_user_id) returning id into v_conversation;
 end if;
 insert into public.advisor_requests(id,conversation_id,organization_id,screening_run_id,user_id,tier,reserved_tokens)
  values (p_request_id,v_conversation,v_org,p_run_id,p_user_id,p_tier,p_token_budget);
 insert into public.advisor_messages(conversation_id,request_id,role,content) values (v_conversation,p_request_id,'user',p_question);
 return jsonb_build_object('request_id',p_request_id,'conversation_id',v_conversation,'status','reserved','replayed',false);
end; $$;
revoke all on function public.advisor_begin_request(uuid,uuid,uuid,text,smallint,integer,uuid) from public,anon,authenticated;
grant execute on function public.advisor_begin_request(uuid,uuid,uuid,text,smallint,integer,uuid) to service_role;
create function public.advisor_finish_request(
 p_user_id uuid,p_request_id uuid,p_answer text,p_citations jsonb,p_verification jsonb,
 p_input_tokens integer,p_output_tokens integer,p_cost_usd numeric,
 p_generator_model text default null,p_verifier_model text default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_request public.advisor_requests%rowtype; v_message uuid;
begin
 select * into v_request from public.advisor_requests where id = p_request_id and user_id = p_user_id for update;
 if not found then raise exception 'Request access denied' using errcode = '42501'; end if;
 perform private.advisor_authorize(p_user_id,v_request.screening_run_id);
 if v_request.status = 'complete' then
  select id into v_message from public.advisor_messages where request_id = p_request_id and role = 'assistant'; return v_message;
 end if;
 if v_request.status <> 'reserved' then raise exception 'Request closed' using errcode = '22023'; end if;
 if p_answer is null or length(trim(p_answer)) not between 1 and 24000
  or p_citations is null or jsonb_typeof(p_citations) <> 'array' or p_verification is null or jsonb_typeof(p_verification) <> 'object'
  or p_input_tokens is null or p_input_tokens < 0 or p_output_tokens is null or p_output_tokens < 0
  or p_input_tokens::bigint + p_output_tokens::bigint > v_request.reserved_tokens
  or (p_cost_usd is not null and p_cost_usd < 0) then raise exception 'Invalid Advisor completion' using errcode = '22023'; end if;
 -- Compact allowlist; no provider traces or chain-of-thought fields.
 if exists (select 1 from jsonb_object_keys(p_verification) k where k not in
  ('status','verifierVersion','claims','sourceIds','missingData','contradictions','independent','rubricVersion','promptVersion'))
  or (v_request.tier >= 2 and (p_verification ->> 'independent' is distinct from 'true'
   or coalesce(p_verification ->> 'status','') not in ('verified','qualified','insufficient')
   or nullif(trim(p_verifier_model),'') is null)) then
  raise exception 'Verification metadata required' using errcode = '22023'; end if;
 insert into public.advisor_messages(conversation_id,request_id,role,content,citations,verification)
  values (v_request.conversation_id,p_request_id,'assistant',p_answer,p_citations,p_verification) returning id into v_message;
 update public.advisor_requests set status = 'complete',input_tokens = p_input_tokens,output_tokens = p_output_tokens,
  cost_usd = p_cost_usd,generator_model = p_generator_model,verifier_model = p_verifier_model,finished_at = now() where id = p_request_id;
 return v_message;
end; $$;
revoke all on function public.advisor_finish_request(uuid,uuid,text,jsonb,jsonb,integer,integer,numeric,text,text) from public,anon,authenticated;
grant execute on function public.advisor_finish_request(uuid,uuid,text,jsonb,jsonb,integer,integer,numeric,text,text) to service_role;
create function public.advisor_record_feedback(p_user_id uuid,p_message_id uuid,p_helpful boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_run uuid;
begin
 select c.screening_run_id into v_run from public.advisor_messages m join public.advisor_conversations c on c.id = m.conversation_id
  where m.id = p_message_id and m.role = 'assistant' and c.user_id = p_user_id;
 if v_run is null then raise exception 'Message access denied' using errcode = '42501'; end if;
 perform private.advisor_authorize(p_user_id,v_run);
 insert into public.advisor_feedback(message_id,user_id,helpful) values (p_message_id,p_user_id,p_helpful)
  on conflict (message_id,user_id) do update set helpful = excluded.helpful,created_at = now();
end; $$;
revoke all on function public.advisor_record_feedback(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.advisor_record_feedback(uuid,uuid,boolean) to service_role;
