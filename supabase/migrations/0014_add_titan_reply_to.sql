-- Preserve Reply-To separately so replies honor the sender's requested address.
alter table public.titan_mail_messages
  add column if not exists reply_to_json jsonb not null default '[]'::jsonb;
