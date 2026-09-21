-- Organization creation is handled by the authenticated create-organization Edge Function.
-- Remove the exposed SECURITY DEFINER RPC and make future public functions opt-in.

drop function if exists public.create_organization(text,text,text,text,text,text);

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from authenticated;
