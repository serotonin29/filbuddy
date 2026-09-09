-- ============================================================
-- FilBuddy — PENGERASAN RLS (idempoten, aman dijalankan berulang)
-- Men-drop & membuat ulang SEMUA policy dengan role eksplisit,
-- memastikan anon tidak bisa membaca data apa pun.
-- ============================================================

-- ---------- profiles ----------
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- ---------- questions ----------
drop policy if exists "questions_select" on public.questions;
drop policy if exists "questions_insert_own" on public.questions;
drop policy if exists "questions_update_own" on public.questions;

create policy "questions_select" on public.questions
  for select to authenticated using (true);
create policy "questions_insert_own" on public.questions
  for insert to authenticated with check (auth.uid() = author_id);
create policy "questions_update_own" on public.questions
  for update to authenticated using (auth.uid() = author_id);

-- ---------- answers ----------
drop policy if exists "answers_select" on public.answers;
drop policy if exists "answers_insert_own" on public.answers;
drop policy if exists "answers_update_own_or_asker" on public.answers;

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

-- ---------- question_votes ----------
drop policy if exists "votes_select" on public.question_votes;
drop policy if exists "votes_insert_own" on public.question_votes;
drop policy if exists "votes_delete_own" on public.question_votes;

create policy "votes_select" on public.question_votes
  for select to authenticated using (true);
create policy "votes_insert_own" on public.question_votes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "votes_delete_own" on public.question_votes
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- slots ----------
drop policy if exists "slots_select" on public.slots;
drop policy if exists "slots_insert_own" on public.slots;
drop policy if exists "slots_update_own" on public.slots;
drop policy if exists "slots_delete_own" on public.slots;

create policy "slots_select" on public.slots
  for select to authenticated using (true);
create policy "slots_insert_own" on public.slots
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "slots_update_own" on public.slots
  for update to authenticated using (auth.uid() = owner_id);
create policy "slots_delete_own" on public.slots
  for delete to authenticated using (auth.uid() = owner_id);

-- ---------- activities (privat per user) ----------
drop policy if exists "activities_select_own" on public.activities;
drop policy if exists "activities_insert_own" on public.activities;

create policy "activities_select_own" on public.activities
  for select to authenticated using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities
  for insert to authenticated with check (auth.uid() = user_id);

-- Pastikan RLS aktif di semua tabel
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.question_votes enable row level security;
alter table public.slots enable row level security;
alter table public.activities enable row level security;

select 'RLS dikeraskan — anon kini ditolak dari semua tabel' as status;
