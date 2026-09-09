-- ============================================================
-- FilBuddy — FIX #2: "invalid input value for enum prodi_enum: 'if'"
-- Penyebab: function men-lowercase prodi ("if") padahal enum
-- bertipe UPPERCASE ('IF','SI','SK','MI'). Enum = case-sensitive.
-- Jalankan seluruh file ini di SQL Editor.
-- ============================================================

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
  -- Normalisasi ke UPPERCASE, validasi terhadap daftar enum
  v_prodi := upper(trim(coalesce(new.raw_user_meta_data->>'prodi', 'IF')));
  if v_prodi not in ('IF', 'SI', 'SK', 'MI') then
    v_prodi := 'IF';
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
    v_prodi::public.prodi_enum,   -- sekarang selalu 'IF'/'SI'/'SK'/'MI' valid
    100
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Pastikan trigger memakai function terbaru (drop & recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

select 'trigger diperbaiki — signup seharusnya berfungsi sekarang' as status;
