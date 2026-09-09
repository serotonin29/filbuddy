-- ============================================================
-- FilBuddy — FIX "Database error saving new user"
-- Jalankan SELURUH file ini di Supabase SQL Editor.
-- Idempoten: aman dijalankan berulang kali.
-- ============================================================

-- 1. Pastikan enum prodi ada (abaikan error "already exists" kalau muncul)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'prodi_enum') then
    create type public.prodi_enum as enum ('IF', 'SI', 'SK', 'MI');
  end if;
end $$;

-- 2. Pastikan kolom profiles.prodi bertipe enum yang benar.
--    Kalau sebelumnya gagal sebagai text, konversi sekarang:
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'prodi' and data_type = 'text'
  ) then
    alter table public.profiles
      alter column prodi type public.prodi_enum
      using prodi::public.prodi_enum;
  end if;
exception
  when others then raise notice 'kolom prodi: %', sqlerrm;
end $$;

-- 3. Pastikan semua kolom yang dibutuhkan trigger ada
alter table public.profiles
  add column if not exists name text not null default 'Mahasiswa Baru',
  add column if not exists nim text,
  add column if not exists email text,
  add column if not exists prodi public.prodi_enum not null default 'IF',
  add column if not exists points integer not null default 100;

-- backfill wajib kalau ada baris lama
update public.profiles set nim = coalesce(nim, 'NIM-' || id::text) where nim is null;
update public.profiles set email = coalesce(email, 'unknown@upiyptk.ac.id') where email is null;

alter table public.profiles
  alter column nim set not null,
  alter column email set not null;

-- unique constraint kalau belum ada
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_nim_key'
  ) then
    alter table public.profiles add constraint profiles_nim_key unique (nim);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_email_key'
  ) then
    alter table public.profiles add constraint profiles_email_key unique (email);
  end if;
end $$;

-- 4. Buat ulang function trigger dengan versi paling defensif:
--    - cast prodi aman (fallback ke 'IF' jika nilai tak valid)
--    - nim fallback ke id user jika kosong (menghindari unique violation)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prodi text;
  v_nim text;
begin
  v_prodi := lower(coalesce(new.raw_user_meta_data->>'prodi', 'if'));
  if v_prodi not in ('if', 'si', 'sk', 'mi') then
    v_prodi := 'if';
  end if;

  v_nim := nullif(trim(coalesce(new.raw_user_meta_data->>'nim', '')), '');
  if v_nim is null then
    v_nim := 'NIM-' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, name, nim, email, prodi, points)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Mahasiswa Baru'),
    v_nim,
    coalesce(new.email, 'unknown@upiyptk.ac.id'),
    v_prodi::public.prodi_enum,
    100
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 5. Pasang ulang trigger (drop dulu kalau sudah ada)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Cek cepat: fungsi valid?
select 'trigger siap ✓' as status;
