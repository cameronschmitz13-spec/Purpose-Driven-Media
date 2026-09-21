create unique index if not exists screening_sources_run_url_uidx
on public.screening_sources(screening_run_id, source_url);
