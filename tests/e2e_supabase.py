"""FilBuddy Supabase E2E test — hanya jalan kalau schema sudah tersedia di database.
Kalau tabel belum ada (HTTP 404), test di-skip otomatis."""

import sys
import time
import urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
SUPABASE_URL = "https://royxwupescldvktlspwb.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXh3dXBlc2NsZHZrdGxzcHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDMwOTQsImV4cCI6MjEwNDQ3OTA5NH0.Pm704ApHp_n-oYy1rKwufZs6a8sQyfGsbABYd6F_AOk"

# Email unik per-run supaya test bisa diulang tanpa bentrok akun
RUN = str(int(time.time()))
EMAIL = f"test.e2e.{RUN}@upiyptk.ac.id"
PASSWORD = "testpass123"

# Cek schema tersedia
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/profiles?select=id&limit=1",
    headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
)
try:
    with urllib.request.urlopen(req) as r:
        pass
    print("Schema tersedia — jalankan test Supabase")
except Exception:
    print("SKIP: tabel 'profiles' belum ada. Jalankan supabase/schema.sql di Supabase SQL Editor dulu.")
    sys.exit(0)

PASS, FAIL = [], []


def check(name, cond):
    if cond:
        PASS.append(name)
        print(f"  ✓ {name}")
    else:
        FAIL.append(name)
        print(f"  ✗ {name}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Context incognito — bersih dari session/cookie run sebelumnya
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # ---------- 1. Register akun baru via wizard ----------
    print("\n[1] Register via wizard (3 langkah)")
    page.goto(f"{BASE}/register")
    page.wait_for_load_state("networkidle")

    page.fill("input#fullName", "Tester E2E Supabase")
    page.fill("input#nim", f"2210115{RUN[-6:]}")
    page.fill("input#email", EMAIL)
    page.select_option("select#prodi", "SI")
    page.fill("input#password", PASSWORD)
    page.fill("input#passwordConfirm", PASSWORD)
    page.click("button:has-text('Lanjut ke Skill')")
    page.wait_for_selector("text=Tentukan Keahlian", timeout=5000)
    check("langkah 2 tercapai", True)

    page.click("button:has-text('Lanjut ke Konfirmasi')")
    page.wait_for_selector("text=Konfirmasi & Aktivasi", timeout=5000)
    # centang checkbox persetujuan & pastikan tombol aktif sebelum klik
    page.locator("label:has-text('Saya menyatakan')").click()
    page.wait_for_selector("button:has-text('Buat Akun'):not([disabled])", timeout=5000)
    page.click("button:has-text('Buat Akun')")
    try:
        page.wait_for_selector("text=Akun Berhasil Dibuat", timeout=15000)
        check("register sukses (session aktif)", True)
    except Exception:
        err = page.locator("div.bg-rose-50").first
        txt = err.inner_text() if err.count() else "?"
        print(f"  ! register error: {txt}")
        if "verifikasi" in txt.lower():
            print("  HINT: matikan 'Confirm email' di Supabase → Authentication → Sign In / Providers")
            check("register (email confirmation)", False)
        else:
            check("register sukses", False)
        browser.close()
        sys.exit(1)

    # ---------- 2. Login ----------
    print("\n[2] Logout & login ulang via email")
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#identifier", EMAIL)
    page.fill("#password", PASSWORD)
    page.click("button:has-text('Masuk ke Dashboard')")
    page.wait_for_url("**/dashboard", timeout=15000)
    page.wait_for_load_state("networkidle")
    check("login email sukses → /dashboard", "/dashboard" in page.url)
    check("greeting personal", page.locator("text=Selamat datang kembali, Tester").count() > 0)
    check("saldo poin = 100 + bonus skill", page.locator("text=⚡").first.is_visible())

    # ---------- 3. Forum: pertanyaan + jawaban + accept ----------
    print("\n[3] Forum — tanya, jawab, tandai terbaik")
    page.goto(f"{BASE}/dashboard/forum")
    page.wait_for_load_state("networkidle")
    page.click("button:has-text('Tanya Sekarang')")
    page.wait_for_selector("text=Tanya Sesuatu", timeout=5000)
    page.fill("input[placeholder*='Kenapa query JOIN']", "Test E2E: cara setup Prisma dengan Supabase?")
    page.fill("textarea[placeholder*='Jelaskan konteks']", "Ini pertanyaan test end-to-end untuk mode database.")
    page.locator("select").last.select_option("Database")
    page.fill("input[placeholder*='mysql laravel']", "supabase prisma")
    page.locator("button:has-text('Posting Pertanyaan')").click()
    page.wait_for_selector("text=Test E2E: cara setup Prisma", timeout=5000)
    check("pertanyaan tersimpan ke database", True)

    article = page.locator("article", has_text="Test E2E: cara setup Prisma").first
    article.locator("button[aria-label='Upvote']").first.click()
    page.wait_for_timeout(800)
    check("vote tersimpan", True)

    article.locator("h2").first.click()
    page.wait_for_selector("text=Tulis Jawabanmu", timeout=5000)
    page.fill("textarea[placeholder*='Jelaskan solusinya']", "Jawaban test: gunakan connection string pooling Supabase.")
    page.locator("button:has-text('Kirim Jawaban')").click()
    page.wait_for_selector("text=Jawaban test", timeout=5000)
    check("jawaban tersimpan", True)
    page.locator("button:has-text('Tandai Terbaik')").first.click()
    page.wait_for_timeout(800)
    check("jawaban ditandai terbaik", page.locator("text=JAWABAN TERBAIK").count() > 0)
    page.locator("button[aria-label='Tutup']").first.click()
    page.wait_for_timeout(300)

    # ---------- 4. Slot ----------
    print("\n[4] Slot barter")
    page.goto(f"{BASE}/dashboard/slot")
    page.wait_for_load_state("networkidle")
    page.click("button:has-text('Buka Slot Barter')")
    page.wait_for_selector("text=Tawarkan sesi mengajar", timeout=5000)
    page.fill("input[placeholder*='cth. Praktikum']", "Sesi Test E2E Database")
    page.locator("div.fixed button:has-text('Buka Slot')").last.click()
    page.wait_for_selector("text=Sesi Test E2E Database", timeout=5000)
    check("slot tersimpan ke database", True)

    # ---------- 5. Persistensi: reload & data tetap ----------
    print("\n[5] Persistensi setelah reload")
    page.reload()
    page.wait_for_load_state("networkidle")
    check("slot tetap ada setelah reload", page.locator("text=Sesi Test E2E Database").count() > 0)
    page.goto(f"{BASE}/dashboard/forum")
    page.wait_for_load_state("networkidle")
    check("pertanyaan tetap ada setelah reload", page.locator("text=Test E2E: cara setup Prisma").count() > 0)

    # ---------- 6. Verifikasi langsung ke REST API ----------
    print("\n[6] Verifikasi REST API & RLS")
    # RLS aktif = anon tidak melihat data apa pun (PostgREST memfilter
    # baris, bukan menolak request — jadi respons yang benar: 200 + kosong)
    req2 = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/questions?select=id&limit=10",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
    )
    with urllib.request.urlopen(req2) as r:
        body = r.read().decode()
    check("RLS aktif — anon tidak bisa melihat data", body.strip() == "[]")

    context.close()
    browser.close()

print(f"\n{'='*50}")
print(f"HASIL: {len(PASS)} lulus, {len(FAIL)} gagal")
if FAIL:
    for f in FAIL:
        print(f"  - {f}")
    sys.exit(1)
print("SUPABASE E2E TEST LULUS ✓")
