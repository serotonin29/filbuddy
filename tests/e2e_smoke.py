"""FilBuddy E2E smoke test — otomatis menyesuaikan mode (demo / supabase)."""

from playwright.sync_api import sync_playwright
from helpers import BASE, make_account, login, cleanup_account

PASS = []
FAIL = []


def check(name, cond):
    if cond:
        PASS.append(name)
        print(f"  ✓ {name}")
    else:
        FAIL.append(name)
        print(f"  ✗ {name}")


account = make_account()
print(f"Mode: {account['mode']} (akun: {account['email']})")
# Judul unik per-run — questions lama dari run sebelumnya masih terlihat di forum
Q_TITLE = f"Bagaimana cara deploy Next.js ke Vercel? [{account['email'].split('@')[0][-6:]}]"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)

    # ---------- 1. Landing page ----------
    print("\n[1] Landing page")
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    check("hero headline tampil", page.locator("text=Cukup Barter Ilmu").count() > 0)
    check("navbar brand tampil", page.locator("text=FilBuddy").first.is_visible())

    # ---------- 2. Login: validasi salah ----------
    print("\n[2] Login validasi - password salah")
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#identifier", account["email"])
    page.fill("#password", "salahbanget")
    page.click("button:has-text('Masuk ke Dashboard')")
    page.wait_for_selector("text=salah", timeout=5000)
    check("pesan error password salah muncul", True)
    check("masih di halaman login", "/login" in page.url)

    # ---------- 3. Login: sukses ----------
    print("\n[3] Login sukses")
    login(page, account)
    check("redirect ke /dashboard", "/dashboard" in page.url)
    # tunggu data user termuat (async: loadAll dari database)
    page.wait_for_selector("text=Selamat datang kembali", timeout=10000)
    check("greeting personal", True)
    points_str = f"⚡ {account['points']} Pts"
    check(f"chip poin di navbar ({points_str})", page.locator(f"text={points_str}").count() > 0)

    # ---------- 4. Dashboard: buka slot ----------
    print("\n[4] Dashboard - buka slot barter")
    page.click("button:has-text('Buka Slot Barter Baru')")
    page.wait_for_selector("text=Tawarkan sesi mengajar", timeout=5000)
    modal = page.locator("div.fixed button:has-text('Buka Slot')").locator("xpath=ancestor::div[2]")
    modal.locator("input[placeholder*='cth. Praktikum']").fill("Sesi React Hooks dasar")
    page.locator("div.fixed button:has-text('Buka Slot')").last.click()
    page.wait_for_selector("text=Sesi React Hooks dasar", timeout=8000)
    check("slot baru muncul di daftar", True)
    page.wait_for_selector("text=Slot barter dibuka", timeout=8000)
    check("aktivitas tercatat", True)

    # ---------- 5. Forum: buat pertanyaan ----------
    print("\n[5] Forum - buat pertanyaan dengan reward")
    page.goto(f"{BASE}/dashboard/forum")
    page.wait_for_load_state("networkidle")
    page.click("button:has-text('Tanya Sekarang')")
    page.wait_for_selector("text=Tanya Sesuatu", timeout=5000)
    page.fill("input[placeholder*='Kenapa query JOIN']", Q_TITLE)
    page.fill("textarea[placeholder*='Jelaskan konteks']", "Udah push ke GitHub tapi build gagal di Vercel, error module not found.")
    page.locator("select").last.select_option("Web Dev")
    page.fill("input[placeholder*='mysql laravel']", "vercel nextjs")
    page.locator("button:has-text('⚡ 20 Pts')").click()
    page.locator("button:has-text('Posting Pertanyaan')").click()
    page.wait_for_selector(f"text={Q_TITLE}", timeout=8000)
    check("pertanyaan baru tampil", True)
    check("badge 'Pertanyaanku' tampil", page.locator("text=Pertanyaanku").count() > 0)
    after = account["points"] - 20
    page.wait_for_selector(f"header >> text=⚡ {after} Pts", timeout=8000)
    check(f"poin terpotong jadi {after}", True)

    # ---------- 6. Forum: vote ----------
    print("\n[6] Forum - vote pertanyaan")
    article = page.locator("article", has_text=Q_TITLE).first
    votes_before = int(article.locator(".font-label-code.text-sm").first.inner_text())
    article.locator("button[aria-label='Upvote']").first.click()
    page.wait_for_timeout(400)
    votes_after = int(article.locator(".font-label-code.text-sm").first.inner_text())
    check(f"vote naik {votes_before} -> {votes_after}", votes_after == votes_before + 1)

    # ---------- 7. Forum: jawab + tandai terbaik ----------
    print("\n[7] Forum - jawab & tandai jawaban terbaik")
    article.locator("h2").first.click()
    page.wait_for_selector("text=Tulis Jawabanmu", timeout=5000)
    page.fill("textarea[placeholder*='Jelaskan solusinya']", "Cek file .gitignore, kemungkinan folder node_modules atau package-lock ikut ke-push. Hapus lalu redeploy.")
    page.locator("button:has-text('Kirim Jawaban')").click()
    page.wait_for_selector("text=Cek file .gitignore", timeout=5000)
    check("jawaban terkirim", True)
    page.locator("button:has-text('Tandai Terbaik')").first.click()
    page.wait_for_timeout(800)
    check("jawaban ditandai terbaik", page.locator("text=JAWABAN TERBAIK").count() > 0)
    page.locator("button[aria-label='Tutup']").first.click()
    page.wait_for_timeout(300)

    # ---------- 8. Slot page + logout ----------
    print("\n[8] Slot page & logout")
    page.goto(f"{BASE}/dashboard/slot")
    page.wait_for_load_state("networkidle")
    check("halaman slot tampil", page.locator("text=Slot Barter Saya").count() > 0)
    page.locator("header button:has-text('E2E')").first.click()
    page.wait_for_selector("text=Keluar", timeout=5000)
    page.get_by_role("button", name="Keluar").click()
    page.wait_for_url("**/login", timeout=10000)
    check("logout kembali ke /login", "/login" in page.url)

    # ---------- 9. Console errors ----------
    print("\n[9] Console errors")
    real_errors = [e for e in console_errors if not e.startswith("Failed to load resource")]
    check(f"tidak ada console error ({len(real_errors)} ditemukan)", len(real_errors) == 0)

    context.close()
    browser.close()

print(f"\n{'='*50}")
print(f"HASIL: {len(PASS)} lulus, {len(FAIL)} gagal")
if account["mode"] == "supabase":
    cleanup_account(account["email"], account["password"])
if FAIL:
    print("GAGAL di:")
    for f in FAIL:
        print(f"  - {f}")
    raise SystemExit(1)
print("SEMUA TEST LULUS ✓")
