-- ============================================================
-- FilBuddy — LOGIN VIA NIM
-- RPC publik yang memetakan NIM → email (untuk Supabase Auth).
-- Security definer + search_path dikunci; hanya mengembalikan
-- email dari NIM yang cocok persis.
-- Jalankan di SQL Editor.
-- ============================================================

create or replace function public.get_email_by_nim(p_nim text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.profiles
  where trim(p_nim) <> '' and nim = trim(p_nim)
  limit 1
$$;

-- Beri akses execute ke anon + authenticated (hanya untuk fungsi ini)
revoke all on function public.get_email_by_nim(text) from public;
grant execute on function public.get_email_by_nim(text) to anon, authenticated;
