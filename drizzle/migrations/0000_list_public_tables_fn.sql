create or replace function public.list_public_tables()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(c.relname order by c.relname), '{}')
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
$$;

revoke all on function public.list_public_tables() from public, anon, authenticated;
grant execute on function public.list_public_tables() to service_role;