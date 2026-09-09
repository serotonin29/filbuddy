-- ============================================================
-- FilBuddy — DIAGNOSTIK trigger signup
-- Jalankan di SQL Editor. Output akan menunjukkan penyebab error
-- pada baris "HASIL".
-- ============================================================

-- Uji function secara langsung dengan data dummy layaknya auth.users baru
do $$
declare
  fake_meta jsonb := '{"name":"Diag User","nim":"22101152666666","prodi":"SI"}'::jsonb;
  fake_id uuid := gen_random_uuid();
  v_err text;
begin
  begin
    -- Simulasikan isi trigger secara manual
    insert into public.profiles (id, name, nim, email, prodi, points)
    values (
      fake_id,
      coalesce(nullif(trim(fake_meta->>'name'), ''), 'Mahasiswa Baru'),
      coalesce(nullif(trim(fake_meta->>'nim'), ''), 'NIM-' || substr(fake_id::text, 1, 8)),
      'diag.' || substr(fake_id::text, 1, 6) || '@upiyptk.ac.id',
      coalesce(lower(fake_meta->>'prodi'), 'if')::public.prodi_enum,
      100
    );
    raise notice 'INSERT OK — tabel profiles sehat. Hapus baris tes...';
    delete from public.profiles where id = fake_id;
  exception when others then
    v_err := sqlerrm;
    raise notice 'GAGAL INSERT: %', v_err;
  end;

  -- Cek eksistensi & definisi trigger
  raise notice 'TRIGGER ada: %', (
    select count(*) > 0 from pg_trigger
    where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass
  );
  raise notice 'FUNCTION ada: %', (
    select count(*) > 0 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'handle_new_user' and n.nspname = 'public'
  );
  raise notice 'Kolom profiles: %', (
    select string_agg(column_name || '(' || data_type || ')', ', ' order by ordinal_position)
    from information_schema.columns
    where table_schema='public' and table_name='profiles'
  );
end $$;

-- Kalau baris "GAGAL INSERT" muncul di atas, itu penyebabnya.
-- Kalau semua OK tapi signup masih error → jalankan blok re-create trigger di bawah:

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

select 'diagnosa selesai — lihat tab Messages/Notices untuk hasil' as status;
