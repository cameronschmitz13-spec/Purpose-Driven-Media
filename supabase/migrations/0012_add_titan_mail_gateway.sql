-- PDM-owned Titan mail gateway metadata and message index.
-- Credentials are intentionally NOT stored here; keep Titan credentials only
-- in the gateway host's encrypted environment/secret store.

create table if not exists public.titan_mail_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  email_address text not null unique,
  provider text not null default 'titan' check (provider = 'titan'),
  status text not null default 'active' check (status in ('active','paused','error')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.titan_mail_messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.titan_mail_accounts(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  folder text not null,
  imap_uid bigint not null check (imap_uid > 0),
  provider_message_id text,
  in_reply_to text,
  references_json jsonb not null default '[]'::jsonb,
  subject text not null default '(no subject)',
  from_json jsonb not null default '[]'::jsonb,
  to_json jsonb not null default '[]'::jsonb,
  cc_json jsonb not null default '[]'::jsonb,
  received_at timestamptz,
  flags text[] not null default '{}'::text[],
  has_attachments boolean not null default false,
  body_text text not null default '',
  snippet text not null default '',
  indexed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, folder, imap_uid)
);

create index if not exists titan_mail_messages_account_received_idx
  on public.titan_mail_messages(account_id, received_at desc);
create index if not exists titan_mail_messages_org_received_idx
  on public.titan_mail_messages(organization_id, received_at desc)
  where organization_id is not null;
create index if not exists titan_mail_messages_provider_message_idx
  on public.titan_mail_messages(provider_message_id)
  where provider_message_id is not null;
create index if not exists titan_mail_messages_search_idx
  on public.titan_mail_messages using gin (
    to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(body_text, ''))
  );

alter table public.titan_mail_accounts enable row level security;
alter table public.titan_mail_messages enable row level security;

-- Deliberately no anon/authenticated policies. Mail data is available only
-- through the authenticated PDM mail gateway, which uses the server-side
-- service role and enforces its own bearer-token boundary.
revoke all on table public.titan_mail_accounts from anon, authenticated;
revoke all on table public.titan_mail_messages from anon, authenticated;
grant select, insert, update, delete on table public.titan_mail_accounts to service_role;
grant select, insert, update, delete on table public.titan_mail_messages to service_role;

comment on table public.titan_mail_accounts is
  'Non-secret Titan mailbox registry for the PDM-owned mail gateway. Credentials never belong in Postgres.';
comment on table public.titan_mail_messages is
  'Service-only Titan message index. Clients access mail through the PDM mail gateway, never directly.';
