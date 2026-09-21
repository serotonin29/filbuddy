"""Seed konten forum FilBuddy — akun & data realistis (bukan pola e2e.*).

Idempoten: kalau pertanyaan seed sudah ada, tidak menambah apa-apa.
Jalankan: python tests\\seed_forum.py
"""

import json
import time
import urllib.error
import urllib.parse
import urllib.request

from helpers import SUPABASE_URL, ANON_KEY, supabase_ready, rest_login

PASSWORD = "SeedOnly2026!"

USERS = [
    {"email": "sarah.azzahra@upiyptk.ac.id", "name": "Sarah Azzahra Putri", "nim": "22101152610047", "prodi": "SI"},
    {"email": "rizky.pratama@upiyptk.ac.id", "name": "Rizky Pratama", "nim": "22101152610058", "prodi": "IF"},
    {"email": "nadia.salsabila@upiyptk.ac.id", "name": "Nadia Salsabila", "nim": "22101152610063", "prodi": "SI"},
    {"email": "fajar.nurrohman@upiyptk.ac.id", "name": "Fajar Nur Rohman", "nim": "22101152610071", "prodi": "IF"},
]

# (author, title, excerpt, category, tags, reward, [(penjawab, konten, accepted)])
CONTENT = [
    (
        0,
        "Error hydration React: Text content does not match server HTML, gimana solusinya?",
        "Sering dapat warning hydration mismatch di Next.js App Router, terutama setelah pakai data tanggal. Udah coba suppressHydrationWarning tapi kerasa hack banget.",
        "Web Dev",
        ["react", "nextjs"],
        0,
        [
            (
                1,
                "Penyebab paling umum: render server dan client menghasilkan HTML berbeda. Kalau pakai `new Date().getFullYear()` atau `Date.now()`, pindahkan ke dalam `useEffect`, atau render tanggal di komponen server saja.\n\nKalau butuh nilai acak/localStorage, pakai pola `mounted` state:\n\n```jsx\nconst [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;\n```\n\n`suppressHydrationWarning` cuma men suppress satu level, jadi memang bukan solusi beneran.",
                True,
            ),
            (2, "Tambahan: cek juga extension browser yang manipulasi DOM kayak Grammarly, sering bikin mismatch false positive.", False),
        ],
    ),
    (
        1,
        "Cara optimasi query PostgreSQL biar gak lemot pas tabel udah ratusan ribu baris?",
        "Query SELECT dengan JOIN 3 tabel udah makin lambat sejak data absensi numpuk. EXPLAIN bilang Sequential Scan di tabel transaksi.",
        "Database",
        ["postgresql", "index", "performa"],
        20,
        [
            (
                2,
                "Langkah praktis:\n\n1. Jalankan `EXPLAIN (ANALYZE, BUFFERS)` — lihat baris mana yang Sequential Scan dan estimasinya jauh dari aktual.\n2. Tambah index di kolom JOIN dan filter: `CREATE INDEX idx_absensi_mhs ON absensi(mahasiswa_id, created_at);`\n3. Kalau filter berdasarkan rentang tanggal, pertimbangkan index B-tree komposit (kolom filter dulu, baru sort).\n4. `VACUUM ANALYZE` agar statistik planner update.\n\nSetelah ada index, planner biasanya pindah ke Index Scan dan waktu turun drastis.",
                True,
            ),
        ],
    ),
    (
        2,
        "Rekomendasi cara belajar DP buat yang gak gifted, dari nol?",
        "Tiap ketemu soal DP langsung blank. Udah baca teori knapsack berkali-kali tapi pas coding tetep gak bisa nentuin state dan transisinya.",
        "Algoritma",
        ["dp", "strategi-belajar"],
        0,
        [
            (
                0,
                "Yang work buat saya: jangan mulai dari teori, mulai dari soal yang SUDAH pernah diselesaikan pakai rekursi biasa, lalu ubah pelan-pelan:\n\n1. Tulis solusi rekursif brute force-nya dulu.\n2. Tambah `memo` (dictionary) — selesai, itu sudah top-down DP.\n3. Baru latih konversi ke bottom-up (tabulasi) di 3-4 soal yang sama.\n\nKuncinya: latih pola yang sama sampai otomatis (Fibonacci → climbing stairs → min cost), bukan lompat ke knapsack langsung.",
                True,
            ),
            (3, "Setuju, plus catat tiap soal di notion: state-nya apa, transisinya apa. Pas ujian kemarin tinggal buka catatan pola.", False),
        ],
    ),
    (
        3,
        "Struktur folder Next.js App Router yang rapi buat proyek kelompok, ada contoh?",
        "Kami ber4 komponen di `src/components` semua numpuk, udah 40+ file. Mau rapikan sebelum pembimbingan berikutnya.",
        "Web Dev",
        ["nextjs", "struktur-proyek"],
        0,
        [
            (
                1,
                "Pola yang enak buat tim kecil: pisahkan berdasarkan fitur, bukan tipe.\n\n```\nsrc/\n  app/            # route only, sesingkat mungkin\n  features/\n    forum/\n      components/\n      hooks/\n    slot/\n      components/\n  components/ui/  # Button, Card, Modal — dipakai lintas fitur\n  lib/            # klien supabase, helper\n```\n\nAturan mainnya satu: file di `features/a` gak boleh import dari `features/b`; kalau butuh, berarti komponennya harus naik ke `components/ui`.",
                True,
            ),
        ],
    ),
]


def rest(method: str, path: str, token: str, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        data=data,
        headers={
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        method=method,
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def main():
    if not supabase_ready():
        print("Supabase belum siap — seed dilewati.")
        return
    tokens = {}
    uids = {}
    for u in USERS:
        try:
            tokens[u["email"]] = rest_login(u["email"], PASSWORD)
        except Exception:
            # signup baru (auto-confirm aktif di project ini)
            body = json.dumps(
                {
                    "email": u["email"],
                    "password": PASSWORD,
                    "data": {"name": u["name"], "nim": u["nim"], "prodi": u["prodi"]},
                }
            ).encode()
            req = urllib.request.Request(
                f"{SUPABASE_URL}/auth/v1/signup",
                data=body,
                headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req) as r:
                session = json.load(r)
            tokens[u["email"]] = session["access_token"]
        tok = tokens[u["email"]]
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": ANON_KEY, "Authorization": f"Bearer {tok}"},
        )
        uids[u["email"]] = json.load(urllib.request.urlopen(req))["id"]
        # pastikan profile row ada (409 = sudah dibuat trigger — abaikan)
        try:
            rest("POST", "profiles", tok, {"id": uids[u["email"]], "name": u["name"], "nim": u["nim"], "email": u["email"], "prodi": u["prodi"]})
        except urllib.error.HTTPError as e:
            if e.code != 409:
                raise
    print(f"{len(tokens)} akun seed siap.")

    qtok = tokens[USERS[0]["email"]]
    titles_q = ",".join(json.dumps(c[1]) for c in CONTENT)
    existing = rest("GET", f"questions?select=title&title=in.({urllib.parse.quote(titles_q)})", qtok)
    have = {row["title"] for row in existing}
    if len(have) >= len(CONTENT):
        print("Data seed sudah lengkap — tidak ada yang ditambahkan.")
        return

    qids = []
    for author, title, excerpt, cat, tags, reward, answers in CONTENT:
        tok = tokens[USERS[author]["email"]]
        rows = rest(
            "POST",
            "questions",
            tok,
            {"author_id": uids[USERS[author]["email"]], "title": title, "excerpt": excerpt, "category": cat, "tags": tags, "reward": reward, "status": "menunggu"},
        )
        q = rows[0]
        qids.append(q["id"])
        for penjawab, konten, accepted in answers:
            rest(
                "POST",
                "answers",
                tokens[USERS[penjawab]["email"]],
                {"question_id": q["id"], "author_id": uids[USERS[penjawab]["email"]], "content": konten, "accepted": accepted},
            )
        if accepted_answer_exists(answers):
            rest("PATCH", f"questions?id=eq.{q['id']}", tok, {"status": "terjawab"})
        time.sleep(0.3)
    print(f"Seeded {len(qids)} pertanyaan + jawaban.")


def accepted_answer_exists(answers) -> bool:
    return any(a[2] for a in answers)


if __name__ == "__main__":
    main()
