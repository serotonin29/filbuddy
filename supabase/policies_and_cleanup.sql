-- ============================================================
-- FilBuddy — pembersihan data E2E/test + policy self-cleanup
-- Jalankan di Supabase Dashboard → SQL Editor.
-- Aman dijalankan berulang (idempotent).
--
-- Bagian 1 menghapus SEMUA akun test (email berpola e2e.* dan
-- test.e2e.*) beserta seluruh datanya. Semua FK memakai
-- ON DELETE CASCADE ke profiles → questions/answers/votes/
-- slots/activities ikut terhapus otomatis.
--
-- Bagian 2 menambah policy DELETE milik sendiri supaya test E2E
-- bisa membersihkan jejaknya sendiri di run berikutnya.
-- ============================================================

-- ---------- 1) Bersihkan data test ----------
delete from auth.users
where email like 'e2e.%'
   or email like 'test.e2e.%';

-- ---------- 2) Policy delete-own (idempotent) ----------
drop policy if exists "questions_delete_own" on public.questions;
create policy "questions_delete_own"
  on public.questions for delete
  using (auth.uid() = author_id);

drop policy if exists "answers_delete_own" on public.answers;
create policy "answers_delete_own"
  on public.answers for delete
  using (auth.uid() = author_id);

drop policy if exists "slots_delete_own" on public.slots;
create policy "slots_delete_own"
  on public.slots for delete
  using (auth.uid() = owner_id);

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own"
  on public.activities for delete
  using (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);
