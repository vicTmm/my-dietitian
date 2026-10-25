-- Run once in Supabase SQL Editor. All user rows are isolated with RLS.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  water_goal integer not null default 2500 check (water_goal between 250 and 6000),
  updated_at timestamptz not null default now()
);
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  note text not null default '',
  meals jsonb not null default '[]'::jsonb check (jsonb_typeof(meals) = 'array'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists one_active_plan_per_user on public.meal_plans(user_id) where active;
create table if not exists public.daily_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  water_ml integer not null default 0 check (water_ml >= 0),
  checkin boolean not null default false,
  supplements jsonb not null default '[]'::jsonb,
  primary key(user_id, day)
);
create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, dose text not null, time time not null, note text not null default ''
);
create index if not exists supplements_user on public.supplements(user_id);
create table if not exists public.grocery_lists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  days integer not null default 5 check (days between 1 and 14),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.daily_logs enable row level security;
alter table public.supplements enable row level security;
alter table public.grocery_lists enable row level security;
create policy "Own profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Own meal plans" on public.meal_plans for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own daily logs" on public.daily_logs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own supplements" on public.supplements for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own grocery list" on public.grocery_lists for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
