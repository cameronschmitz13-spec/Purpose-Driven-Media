# Fresh Site reports: provisional persistence contract

The existing Site screening UI may save new, user-supplied legacy results without a secret key. This migration does not restore historical records or change the canonical `visibility-v1` engine. Provisional scores must be labeled as unverified legacy calculations in the UI. Never call them canonical or evidence verified.

## Required setup

Apply `0015_site_provisional_reports.sql` in migration order. A project administrator must grant the already verified PDM owner through a private SQL console with a separately verified Auth UUID:

```sql
insert into private.platform_admins(user_id)
values ('<verified-owner-auth-uuid>')
on conflict (user_id) do nothing;
```

Keep that UUID out of source and browser configuration. The owner-wide list/read/delete does not work until this grant is made. Customer save/read/delete works without the grant. This table is in a non-exposed schema, and no signed-in account can grant itself access.

Before the owner dashboard calls its list, require `.rpc('site_platform_admin_access')` to return exactly `true`. A false value, an RPC error, or an absent session must fail closed. The function returns only whether the current verified Auth user has the private grant; it reveals no report or owner account data.

## Browser session calls

Use the signed-in Supabase client with the publishable key and the current user's access token. The `created_by` value must equal the server-verified Supabase Auth user's ID; the database enforces this with RLS. Never send a secret/service-role key to the browser.

Save once (immutable):

```ts
const { data, error } = await supabase.from('site_screening_reports').insert({
  created_by: user.id,
  screening_type: 'business', // business | nonprofit | faith_ministry | organization
  organization_name: 'Example Organization',
  input_snapshot: { /* answers and submitted target identity */ },
  report_snapshot: { /* actual legacy result shown to the user */ },
  display_score: 67.5, // nullable when there is no defensible score
  rubric_version: 'legacy-site-v1',
  score_provenance: 'client_computed_unverified',
  status: 'provisional',
}).select('id, created_at').single();
```

Fetch one by ID: `.from('site_screening_reports').select('*').eq('id', reportId).single()`.

List newest first: `.from('site_screening_reports').select('id, created_by, screening_type, organization_name, display_score, rubric_version, score_provenance, status, created_at').order('created_at', { ascending: false })`. Normal users see their own reports; the privately provisioned platform owner sees all active reports. RLS excludes soft-deleted records.

Exact-ID delete: `.rpc('delete_site_screening_report', { p_report_id: reportId })`. The return is the deleted UUID or `null` if no active authorized row has that ID. The RPC marks just that row deleted and writes an audit event. A repeated request returns `null`. Do not infer that a `null` response proves another account's report exists.

The Site must render the stored `report_snapshot` to reopen the original result. Avoid re-running a scan on the saved-report route. Validate the snapshot shape in the UI before rendering external links or embedded text. Source identity screening rules still apply if new external evidence is collected; this provisional store does not validate supplied claims or scoring evidence.

## Release verification

With disposable accounts, save each of the four sectors, reload and open the exact saved ID, list under the owner, deny a different customer's read, deny a signed-out read, delete one report by exact ID, and verify the other report remains. Test account switching without stale cached private data. Owner provisioning and these authenticated checks remain release gates; the migration file by itself does not prove them.
