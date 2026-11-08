create table if not exists public.training_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1 check (revision > 0)
);
alter table public.training_snapshots enable row level security;
revoke all on public.training_snapshots from anon;
grant select, insert, update, delete on public.training_snapshots to authenticated;
create policy "Own training snapshots" on public.training_snapshots
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
