-- Run once in Supabase SQL Editor before publishing v7.8.
-- Allows v7.8 submissions (v7.7 only accepted game_version '7.7').
alter table public.game_results drop constraint if exists game_results_game_version_check;
alter table public.game_results add constraint game_results_game_version_check check (game_version in ('7.7','7.8'));
