-- ============================================================
-- FilBuddy — Skema Database Supabase (PostgreSQL)
-- Jalankan seluruh file ini di Supabase SQL Editor
-- (dashboard.supabase.com → project kamu → SQL Editor → New query)
-- ============================================================

-- ==== ENUM & TABEL ====

create type prodi_enum as enum ('IF', 'SI', 'SK', 'MI');

-- Profil mahasiswa, 1-1 dengan auth.users (dibuat otomatis via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  nim text not null unique,
  email text not null unique,
  prodi prodi_enum not null,
  points integer not null default 100,
  teaching_hours numeric not null default 0,
  sessions_done integer not null default 0,
  rating numeric not null default 5.0,
  rating_count integer not null default 0,
  teach_skills jsonb not null default '[]',
  learn_skills jsonb not null default '[]',
  study_mode text not null default 'hybrid',
  availability jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.questions (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  excerpt text not null,
  category text not null,
  tags text[] not null default '{}',
  reward integer not null default 0,
  votes integer not null default 0,
  views integer not null default 0,
  status text not null default 'menunggu' check (status in ('terjawab', 'menunggu', 'hot')),
  created_at timestamptz not null default now()
);

create table public.answers (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  votes integer not null default 0,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

-- Vote unik per user per pertanyaan (mencegah vote ganda)
create table public.question_votes (
  question_id bigint not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  dir smallint not null check (dir in (1, -1)),
  primary key (question_id, user_id)
);

create table public.slots (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  schedule text not null,
  partner text not null,
  partner_label text not null default 'Partner:',
  status text not null default 'scheduled' check (status in ('live', 'scheduled', 'waiting')),
  note text,
  created_at timestamptz not null default now()
);

create table public.activities (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  icon text not null,
  icon_class text not null default '',
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- ==== INDEX ====

create index idx_questions_author on public.questions(author_id);
create index idx_questions_status on public.questions(status);
create index idx_answers_question on public.answers(question_id);
create index idx_slots_owner on public.slots(owner_id);
create index idx_activities_user on public.activities(user_id, created_at desc);

-- ==== ROW LEVEL SECURITY ====

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.question_votes enable row level security;
alter table public.slots enable row level security;
alter table public.activities enable row level security;

-- Profiles: semua terautentikasi bisa baca (leaderboard), hanya pemilik bisa ubah
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Questions: baca semua, tulis milik sendiri
create policy "questions_select" on public.questions
  for select to authenticated using (true);
create policy "questions_insert_own" on public.questions
  for insert to authenticated with check (auth.uid() = author_id);
create policy "questions_update_own" on public.questions
  for update to authenticated using (auth.uid() = author_id);

-- Answers: baca semua; penulis bisa insert/update;
-- penanya boleh update (untuk tandai accepted)
create policy "answers_select" on public.answers
  for select to authenticated using (true);
create policy "answers_insert_own" on public.answers
  for insert to authenticated with check (auth.uid() = author_id);
create policy "answers_update_own_or_asker" on public.answers
  for update to authenticated using (
    auth.uid() = author_id
    or exists (
      select 1 from public.questions q
      where q.id = answers.question_id and q.author_id = auth.uid()
    )
  );

-- Votes: baca semua, tulis/hapus hanya milik sendiri
create policy "votes_select" on public.question_votes
  for select to authenticated using (true);
create policy "votes_insert_own" on public.question_votes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "votes_delete_own" on public.question_votes
  for delete to authenticated using (auth.uid() = user_id);

-- Slots: baca semua, kelola milik sendiri
create policy "slots_select" on public.slots
  for select to authenticated using (true);
create policy "slots_insert_own" on public.slots
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "slots_update_own" on public.slots
  for update to authenticated using (auth.uid() = owner_id);
create policy "slots_delete_own" on public.slots
  for delete to authenticated using (auth.uid() = owner_id);

-- Activities: privat per user
create policy "activities_select_own" on public.activities
  for select to authenticated using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities
  for insert to authenticated with check (auth.uid() = user_id);

-- ==== TRIGGER: buat profile otomatis saat signup ====
-- Aplikasi mengirim nama, nim, dan prodi lewat options.data saat signUp().

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, nim, email, prodi, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Mahasiswa Baru'),
    coalesce(new.raw_user_meta_data->>'nim', new.id::text),
    new.email,
    coalesce((new.raw_user_meta_data->>'prodi')::prodi_enum, 'IF')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
