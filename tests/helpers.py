"""Helper bersama untuk E2E test FilBuddy — deteksi mode & akun fresh."""

import json
import time
import urllib.request

BASE = "http://localhost:3000"
SUPABASE_URL = "https://royxwupescldvktlspwb.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveXh3dXBlc2NsZHZrdGxzcHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDMwOTQsImV4cCI6MjEwNDQ3OTA5NH0.Pm704ApHp_n-oYy1rKwufZs6a8sQyfGsbABYd6F_AOk"


def supabase_ready() -> bool:
    """True kalau tabel profiles tersedia (mode database aktif)."""
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/profiles?select=id&limit=1",
        headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status == 200
    except Exception:
        return False


def make_account():
    """Buat akun fresh. Return dict {email, password, name, nim, points}.
    Di mode supabase: signup via REST (poin 100). Di mode demo: akun demo bawaan."""
    if supabase_ready():
        run = str(int(time.time() * 1000))[-10:]
        email = f"e2e.{run}@upiyptk.ac.id"
        password = "testpass123"
        body = json.dumps(
            {
                "email": email,
                "password": password,
                "data": {"name": "E2E Runner", "nim": f"2210115{run[-6:]}", "prodi": "SI"},
            }
        ).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/signup",
            data=body,
            headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req) as r:
            json.load(r)
        return {"mode": "supabase", "email": email, "password": password, "points": 100}
    return {
        "mode": "demo",
        "email": "22101152610001",
        "password": "password123",
        "points": 240,
    }


def login(page, account):
    """Login via UI dengan akun yang sesuai mode."""
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#identifier", account["email"])
    page.fill("#password", account["password"])
    page.click("button:has-text('Masuk ke Dashboard')")
    page.wait_for_url("**/dashboard", timeout=15000)
    page.wait_for_load_state("networkidle")
