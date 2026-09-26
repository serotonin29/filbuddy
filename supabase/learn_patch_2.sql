-- ============================================================
-- FilBuddy — PATCH 2 untuk fitur Kelas Belajar
-- (struktur section, materi PDF, subtitle terjemahan AI)
-- Jalankan SELURUH file ini di Supabase SQL Editor — aman
-- dijalankan berulang (idempotent, pakai IF NOT EXISTS).
-- ============================================================

-- 1) Kolom section pada pelajaran (nama bab/subfolder asal video)
alter table public.learn_lessons add column if not exists section text;

-- 2) Kolom subtitle hasil terjemahan AI (teks VTT utuh)
alter table public.learn_lessons add column if not exists subtitle_translated text;

-- 3) Tabel materi PDF (lecture notes, dsb.)
create table if not exists public.learn_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learn_courses(id) on delete cascade,
  title text not null,
  drive_file_id text not null,
  section text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_learn_materials_course
  on public.learn_materials(course_id, position);

alter table public.learn_materials enable row level security;

create policy "learn_materials_select" on public.learn_materials
  for select to authenticated using (true);
create policy "learn_materials_insert_owner" on public.learn_materials
  for insert to authenticated with check (
    exists (
      select 1 from public.learn_courses c
      where c.id = learn_materials.course_id and c.author_id = auth.uid()
    )
  );
create policy "learn_materials_delete_owner" on public.learn_materials
  for delete to authenticated using (
    exists (
      select 1 from public.learn_courses c
      where c.id = learn_materials.course_id and c.author_id = auth.uid()
    )
  );

-- 4) Penulis kursus boleh meng-update pelajarannya (menyimpan hasil
--    terjemahan AI tanpa harus menghapus + membuat ulang pelajaran)
drop policy if exists "learn_lessons_update_owner" on public.learn_lessons;
create policy "learn_lessons_update_owner" on public.learn_lessons
  for update to authenticated using (
    exists (
      select 1 from public.learn_courses c
      where c.id = learn_lessons.course_id and c.author_id = auth.uid()
    )
  );
