-- Run once in a NEW Supabase project. Pilot: all anonymous authenticated users can read the board.
create table public.game_results (
 run_id text primary key check (length(run_id) between 1 and 150),
 user_id uuid not null references auth.users(id),
 first_name text not null check (length(first_name) between 1 and 80),
 last_name text not null check (length(last_name) between 1 and 80),
 branch_number text not null check (branch_number ~ '^[0-9]{1,20}$'),
 role_key text not null check (role_key in ('am','inside','counter')),
 total_points integer not null check (total_points between 0 and 1000),
 accuracy integer not null check (accuracy between 0 and 100),
 completed_at timestamptz not null,
 received_at timestamptz not null default now(),
 game_version text not null check (game_version='7.7'),
 scoring_version text not null check (scoring_version='7.0')
);
alter table public.game_results enable row level security;
revoke all on public.game_results from anon, authenticated;
grant select, insert on public.game_results to authenticated;
create policy read_board on public.game_results for select to authenticated using (true);
create policy submit_own_run on public.game_results for insert to authenticated with check ((select auth.uid())=user_id);
-- No update/delete grants or policies. Admin corrections happen in the dashboard.
