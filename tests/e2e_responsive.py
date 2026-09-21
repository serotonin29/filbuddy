"""FilBuddy responsive test: mobile & tablet viewports, no horizontal overflow."""

from playwright.sync_api import sync_playwright
from helpers import BASE, make_account, login

VIEWPORTS = [("mobile-390", 390, 844), ("tablet-768", 768, 1024)]
PUBLIC_PAGES = ["/", "/login", "/register"]
APP_PAGES = ["/dashboard", "/dashboard/forum", "/dashboard/leaderboard", "/dashboard/slot"]

account = make_account()
print(f"Mode: {account['mode']} (akun: {account['email']})")
failures = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for label, w, h in VIEWPORTS:
        print(f"\n=== {label} ({w}x{h}) ===")
        page = browser.new_page(viewport={"width": w, "height": h})

        for path in PUBLIC_PAGES:
            page.goto(BASE + path)
            page.wait_for_load_state("networkidle")
            overflow = page.evaluate(
                "document.documentElement.scrollWidth - document.documentElement.clientWidth"
            )
            ok = overflow <= 1
            print(f"  {'✓' if ok else '✗'} {path} (overflow {overflow}px)")
            if not ok:
                failures.append(f"{label}{path}: overflow {overflow}px")

        # login & cek halaman app
        login(page, account)
        page.wait_for_load_state("networkidle")

        for path in APP_PAGES:
            page.goto(BASE + path)
            page.wait_for_load_state("networkidle")
            overflow = page.evaluate(
                "document.documentElement.scrollWidth - document.documentElement.clientWidth"
            )
            ok = overflow <= 1
            print(f"  {'✓' if ok else '✗'} {path} (overflow {overflow}px)")
            if not ok:
                failures.append(f"{label}{path}: overflow {overflow}px")

        # logo tampil & terlihat
        logo_ok = page.locator("svg[aria-label*='FilBuddy']").first.is_visible()
        print(f"  {'✓' if logo_ok else '✗'} logo terlihat")
        if not logo_ok:
            failures.append(f"{label}: logo tidak terlihat")

        # leaderboard menampilkan banner peringkat (badge "Kamu" hanya
        # kalau akun sudah berkontribusi; fresh akun → empty state jujur)
        page.goto(f"{BASE}/dashboard/leaderboard")
        page.wait_for_load_state("networkidle")
        lb_ok = page.locator("text=Peringkatmu").count() > 0 and (
            page.locator("text=Kamu").count() > 0
            or page.locator("text=Belum berkontribusi").count() > 0
            or page.locator("text=Belum ada kontribusi").count() > 0
        )
        print(f"  {'✓' if lb_ok else '✗'} leaderboard sinkron (banner peringkat / empty-state)")
        if not lb_ok:
            failures.append(f"{label}: leaderboard tidak sinkron")

        page.close()

    browser.close()

print(f"\n{'='*50}")
if failures:
    print(f"GAGAL: {len(failures)} masalah")
    for f in failures:
        print(f"  - {f}")
    raise SystemExit(1)
print("RESPONSIVE TEST LULUS ✓")
