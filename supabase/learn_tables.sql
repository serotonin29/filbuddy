-- ============================================================
-- FilBuddy — Fitur Kelas Belajar (video dari Google Drive)
-- Jalankan seluruh file ini di Supabase SQL Editor
-- (dashboard.supabase.com → project kamu → SQL Editor → New query)
-- ============================================================

-- ==== TABEL ====

-- Kursus: dibuat user mana pun yang login (penulis = pemilik)
create table public.learn_courses (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null,
  -- Diisi bila kursus diimport otomatis dari folder Google Drive
  source_folder_id text,
  created_at timestamptz not null default now()
);

-- Pelajaran: video dari Google Drive (drive_file_id) ATAU URL langsung (video_url).
-- Subtitle opsional: file Drive (.srt/.vtt) atau URL .vtt langsung.
create table public.learn_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learn_courses(id) on delete cascade,
  title text not null,
  drive_file_id text,
  video_url text,
  subtitle_drive_file_id text,
  subtitle_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint learn_lessons_has_source check (
    coalesce(drive_file_id, video_url) is not null
  )
);

-- Progres per user per pelajaran (selesai / belum)
create table public.learn_progress (
  lesson_id uuid not null references public.learn_lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

-- ==== INDEX ====

create index idx_learn_courses_author on public.learn_courses(author_id, created_at desc);
create index idx_learn_courses_folder on public.learn_courses(source_folder_id);
create index idx_learn_lessons_course on public.learn_lessons(course_id, position);
create index idx_learn_progress_user on public.learn_progress(user_id);

-- ==== ROW LEVEL SECURITY ====

alter table public.learn_courses enable row level security;
alter table public.learn_lessons enable row level security;
alter table public.learn_progress enable row level security;

-- Kursus: semua terautentikasi bisa baca; penulis kelola miliknya
create policy "learn_courses_select" on public.learn_courses
  for select to authenticated using (true);
create policy "learn_courses_insert_own" on public.learn_courses
  for insert to authenticated with check (auth.uid() = author_id);
create policy "learn_courses_update_own" on public.learn_courses
  for update to authenticated using (auth.uid() = author_id);
create policy "learn_courses_delete_own" on public.learn_courses
  for delete to authenticated using (auth.uid() = author_id);

-- Pelajaran: baca semua; tambah/hapus hanya penulis kursus terkait
create policy "learn_lessons_select" on public.learn_lessons
  for select to authenticated using (true);
create policy "learn_lessons_insert_owner" on public.learn_lessons
  for insert to authenticated with check (
    exists (
      select 1 from public.learn_courses c
      where c.id = learn_lessons.course_id and c.author_id = auth.uid()
    )
  );
create policy "learn_lessons_delete_owner" on public.learn_lessons
  for delete to authenticated using (
    exists (
      select 1 from public.learn_courses c
      where c.id = learn_lessons.course_id and c.author_id = auth.uid()
    )
  );

-- Progres: privat per user
create policy "learn_progress_select_own" on public.learn_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "learn_progress_insert_own" on public.learn_progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "learn_progress_delete_own" on public.learn_progress
  for delete to authenticated using (auth.uid() = user_id);
