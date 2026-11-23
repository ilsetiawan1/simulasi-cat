-- Simulasi CAT CPNS (simulasi-cat)
-- Initial Schema, Indexes, Profile Trigger, and Row Level Security (RLS)
-- Reference: docs/TSD.md Section 5

-- 1. Tabel profiles (sinkron otomatis dengan auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel exam_packages (katalog paket SKD Penuh, Mini Tryout Subtes, SKB)
create table if not exists public.exam_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null check (category in ('SKD_FULL', 'MINI_TWK', 'MINI_TIU', 'MINI_TKP', 'SKB')),
  duration_minutes integer not null check (duration_minutes > 0),
  total_questions integer not null check (total_questions > 0),
  passing_grade_twk integer,
  passing_grade_tiu integer,
  passing_grade_tkp integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Tabel questions (bank soal dengan opsi JSONB tanpa huruf A-E statis)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.exam_packages(id) on delete cascade,
  subtest text not null check (subtest in ('TWK', 'TIU', 'TKP', 'SKB')),
  question_text text not null,
  image_url text,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  shuffle_options boolean not null default true,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

-- 4. Tabel scores (riwayat skor & sumber data Leaderboard)
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.exam_packages(id) on delete cascade,
  client_attempt_id uuid not null,
  score_twk integer not null default 0 check (score_twk >= 0),
  score_tiu integer not null default 0 check (score_tiu >= 0),
  score_tkp integer not null default 0 check (score_tkp >= 0),
  score_skb integer not null default 0 check (score_skb >= 0),
  total_score integer not null check (total_score >= 0),
  is_passed boolean not null default false,
  duration_seconds integer not null check (duration_seconds >= 0),
  completed_at timestamptz not null default now(),
  unique (user_id, client_attempt_id)
);

-- Indeks Kinerja
create index if not exists idx_questions_package_subtest
  on public.questions (package_id, subtest);

create index if not exists idx_scores_leaderboard_rank
  on public.scores (package_id, total_score desc, score_tkp desc, score_tiu desc, score_twk desc, completed_at asc);

create index if not exists idx_scores_user_history
  on public.scores (user_id, completed_at desc);

-- Trigger Auto-Create Profile pada Registrasi User
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_name text;
begin
  raw_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, 'Peserta'), '@', 1)
  );

  if char_length(raw_name) < 2 then
    raw_name := 'Peserta';
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(raw_name, 60),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.exam_packages enable row level security;
alter table public.questions enable row level security;
alter table public.scores enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "packages_select_active" on public.exam_packages;
create policy "packages_select_active" on public.exam_packages
  for select using (is_active = true);

drop policy if exists "questions_select_public" on public.questions;
create policy "questions_select_public" on public.questions
  for select using (true);

drop policy if exists "scores_select_public" on public.scores;
create policy "scores_select_public" on public.scores
  for select using (true);

drop policy if exists "scores_insert_own" on public.scores;
create policy "scores_insert_own" on public.scores
  for insert to authenticated
  with check (auth.uid() = user_id);
