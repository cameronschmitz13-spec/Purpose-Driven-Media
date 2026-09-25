-- Cover the organization foreign key used by Titan mail account lookups.
create index if not exists titan_mail_accounts_organization_id_idx
  on public.titan_mail_accounts(organization_id)
  where organization_id is not null;
