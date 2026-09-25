# PRD — FilBuddy

**Product Requirement Document**

| | |
|---|---|
| Produk | FilBuddy — Platform barter skill mahasiswa Filkom UPI YPTK Padang |
| Versi dokumen | 1.0 |
| Status produk | v1.0 (live — implementasi selesai & teruji) |
| Penulis | Tim FilBuddy |
| Tanggal | 22 September 2026 |
| Repo | https://github.com/serotonin29/filbuddy |
| Domain | https://filbuddy.space |

---

## 1. Ringkasan Eksekutif

FilBuddy adalah platform web untuk mahasiswa Filkom UPI YPTK Padang yang mempertemukan mereka untuk **saling bertukar keahlian** (barter skill): kamu mengajar apa yang kamu kuasai, dan belajar apa yang kamu butuhkan — tanpa uang, dibayar dengan poin karma.

Produk ini lahir dari masalah nyata di kampus: banyak mahasiswa punya keahlian (coding, desain, video editing, public speaking) yang tidak diajarkan mendalam di kelas, dan tidak tahu ke mana mencari teman belajar atau mentor sesama mahasiswa.

FilBuddy menyediakan forum tanya-jawab bergaya komunitas, slot barter 1-on-1, ruang kelas virtual (Google Meet-ready), komunitas topik, dan sistem poin yang mengukur kontribusi nyata — **tanpa angka palsu**.

---

## 2. Latar Belakang & Masalah

| # | Masalah | Bukti/hipotesis |
|---|---|---|
| M1 | Mahasiswa sulit menemukan mentor/teman belajar yang keahliannya cocok | Grup WhatsApp kampus tidak terstruktur & pertanyaan tenggelam |
| M2 | Pertanyaan akademik/teknis berulang di grup, tidak tersimpan & tidak bisa dicari | Tidak ada arsip tanya-jawab per prodi |
| M3 | Barter skill terjadi informal dan tidak adil (satu pihak sering "lebih banyak memberi") | Tidak ada mekanisme escrow/kredit kontribusi |
| M4 | Tidak ada insentif terukur untuk berbagi ilmu | Kontributor tidak terlihat, tidak ada apresiasi |

**Solusi FilBuddy:** ekosistem tertutup (hanya mahasiswa UPI YPTK terverifikasi) dengan mata uang sosial "Karma Pts", forum yang terarsip, dan pertemuan virtual terjadwal.

---

## 3. Tujuan & Metrik Sukses

### Tujuan produk
1. Menjadi tempat pertama mahasiswa Filkom mencari/bertukar keahlian.
2. Membangun budaya kontribusi yang diukur jujur (karma dari aktivitas nyata).
3. Menjaga kualitas & keamanan lingkungan (verifikasi NIM, moderasi, RLS).

### KPI (diukur setelah 3 bulan rilis)

| Metrik | Target |
|---|---|
| Akun terverifikasi @upiyptk.ac.id | ≥ 300 |
| Pertanyaan forum terjawab ≤ 24 jam | ≥ 60% |
| Slot barter yang tuntas (status live → selesai) | ≥ 100 |
| Skill Room yang benar-benar berjalan di Meet | ≥ 20 sesi |
| Retensi pengguna mingguan (kembali ≥ 1×/minggu) | ≥ 30% |

---

## 4. Target Pengguna & Persona

**Persona 1 — "Pemula Bingung" (mayoritas)**
Mahasiswa semester 1–3 yang butuh bantuan belajar (dasar programming, desain, dsb.). Datang untuk bertanya, mencari buddy, ikut Skill Room. Nilai: jawaban cepat & ramah, jalur onboarding mudah.

**Persona 2 — "Kontributor Ambisius"**
Mahasiswa semester 3–5 yang sudah punya keahlian dan ingin dikenal (portfolio, reputasi, leaderboard). Datang untuk menjawab, mengajar, hosting Skill Room. Nilai: karma terukur, badge level, tampil di leaderboard.

**Persona 3 — "Moderator Komunitas"**
Mahasiswa aktif yang menjaga kualitas tiap circle. Datang untuk memantau laporan, membuat pengumuman. Nilai: alat moderasi ringkas (lapor → ref → tindakan).

**Batasan audiens:** hanya mahasiswa Filkom UPI YPTK Padang (email `@upiyptk.ac.id` + NIM valid 10–14 digit).

---

## 5. Ruang Lingkup

### In-scope (v1.0 — selesai diimplementasikan)
- Auth & registrasi terverifikasi (NIM, email kampus, prodi IF/SI/SK/MI)
- Forum tanya-jawab (vote, jawaban terbaik + escrow reward, edit/hapus milik sendiri, lapor, saran duplikat, pagination, autosave draft)
- Slot barter 1-on-1 (buat, batalkan, status live/scheduled/waiting)
- Skill Room (kelas virtual: jadwal, durasi, mode online/offline/hybrid, link Google Meet, ICS, state join gated)
- Komunitas/Circle per topik (join, post, komentar, pengumuman khusus moderator)
- Events komunitas dengan kuota kapasitas
- Katalog buddy & rekomendasi match (request barter)
- Pesan langsung antar pengguna (thread, unread, request)
- Profil kontribusi jujur (statistik dari data nyata, tanpa angka palsu)
- Leaderboard karma berbasis periode (7 hari / 30 hari / semester) dari data forum nyata
- Halaman publik: /pedoman (aturan), /privasi, /bantuan (FAQ)
- Dashboard dengan search global, notifikasi aktivitas, bottom nav mobile

### Out-of-scope (ditunda)
- SSO Google (placeholder "Segera Hadir" — butuh verifikasi domain kampus di Google Console)
- Notifikasi push/email
- Aplikasi mobile native (saat ini responsive web + PWA-ready)
- Pembayaran/uang nyata (secara prinsip produk tidak pernah menangani uang)
- Chat real-time (websocket) — pesan saat ini refresh-based

---

## 6. User Flow Utama

```
Register (3 langkah: identitas → skill → konfirmasi)
   → dashboard (poin starter 100, bonus skill pending)
   → forum: tanya / jawab → dapat karma
   → slot barter / skill room: jadwal pertemuan
   → kontribusi pertama → bonus skill dicairkan
   → naik level Pemula → Buddy → Expert
```

**Flow escrow reward:**
```
Tanya (pilih reward 10/20/50 Pts) → poin dipotong & "ditahan"
→ dijawab → penanya tandai jawaban terbaik → reward transfer ke penjawab
→ pertanyaan dihapus sebelum terjawab → reward dikembalikan
```

---

## 7. Functional Requirements

Prioritas: **P0** = wajib rilis, **P1** = penting, **P2** = peningkatan.

### 7.1 Autentikasi & Registrasi (P0)
| ID | Requirement |
|---|---|
| AUTH-1 | Registrasi 3 langkah: data diri (nama, NIM, email, prodi) → skill (yang diajar & dipelajari) → konfirmasi |
| AUTH-2 | Validasi NIM 10–14 digit angka; email harus `@upiyptk.ac.id`; password min. 6 karakter |
| AUTH-3 | Prodi terbatas: IF, SI, SK, MI (enum di DB) |
| AUTH-4 | Poin awal 100 Karma Pts + bonus pending 50/skill yang diajar (dicairkan setelah kontribusi pertama — anti-fraud) |
| AUTH-5 | Login via NIM **atau** email; sesi persisten (Supabase Auth) |
| AUTH-6 | SSO Google: tampil "Segera Hadir" (non-fungsional) |

### 7.2 Forum Tanya-Jawab (P0)
| ID | Requirement |
|---|---|
| FRM-1 | Buat pertanyaan: judul, detail (mendukung blok kode + copy), komunitas/kategori, tag, reward opsional |
| FRM-2 | Escrow reward: dipotong saat posting, transfer otomatis ke penjawab terbaik saat ditandai |
| FRM-3 | Vote up/down 1 user 1 vote (tabel `question_votes`, unik) |
| FRM-4 | Jawab, tandai jawaban terbaik (hanya penanya), balasan bertingkat pada jawaban |
| FRM-5 | Edit & hapus jawaban sendiri (jawaban terbaik terkunci); hapus pertanyaan sendiri dengan refund reward, terkunci setelah status "terjawab" |
| FRM-6 | Lapor konten (report ref `FB-xxxxxx` tersimpan lokal sebagai jejak) |
| FRM-7 | Saran duplikat: judul ≥ 12 karakter dengan kemiripan ≥ 50% menampilkan max 2 pertanyaan serupa |
| FRM-8 | Filter: kategori, "Belum Terjawab", "Komunitasku"; sort: Hot / Terbaru / Top |
| FRM-9 | Pagination client-side 10/halaman + "Muat N pertanyaan lainnya" |
| FRM-10 | Autosave draft (judul, detail, tag) ke localStorage; pulih otomatis; bersih saat posting sukses |
| FRM-11 | Validasi komposer: judul min. 8 karakter, isi min. 20 karakter |
| FRM-12 | Search global (Ctrl+K) mencari judul, isi, tag pertanyaan |

### 7.3 Slot Barter & Skill Room (P0)
| ID | Requirement |
|---|---|
| SRT-1 | Buat slot barter: judul, jadwal, partner, mode (online Meet / offline) |
| SRT-2 | Slot punya status: waiting → scheduled → live; bisa dibatalkan pemilik |
| SKR-1 | Skill Room: tipe sesi, jadwal (datetime), durasi, mode online/offline/hybrid, lokasi, recurring, kapasitas |
| SKR-2 | Link Google Meet: dibuat otomatis untuk sesi online; host bisa memasang/mengganti link |
| SKR-3 | Tombol "Join Meet" hanya aktif dari 10 menit sebelum mulai sampai durasi berakhir (mencegah link bocor ke non-peserta sebelum waktunya) |
| SKR-4 | Unduh jadwal sebagai file .ics (kalender) |
| SKR-5 | Status room: open / almost / full / finished berdasarkan peserta terdaftar |

### 7.4 Komunitas, Events, Buddy (P1)
| ID | Requirement |
|---|---|
| CIR-1 | Circle per topik dengan kategori (teknologi, desain, akademik, karier, santai); join/leave tersimpan |
| CIR-2 | Post circle: discussion / question / resource / buddy / project / **announcement (khusus moderator circle)** |
| CIR-3 | Komentar & balasan pada post |
| EVT-1 | Events komunitas dengan **kapasitas**; penuh → tombol ikut diblok + indikator kuota |
| BDY-1 | Katalog buddy berdasarkan skill yang diajar/dipelajari + request barter |

### 7.5 Pesan, Profil, Leaderboard (P1)
| ID | Requirement |
|---|---|
| MSG-1 | Thread pesan antar pengguna, badge unread, mute thread, permintaan chat masuk |
| PRF-1 | Profil menampilkan statistik jujur: helped (jawaban + jam mengajar), hosted (room), jawaban, pertanyaan; empty-state jujur jika belum ada aktivitas; catatan transparansi poin starter |
| LB-1 | Leaderboard dengan periode 7 hari / 30 hari / semester (semester mulai 1 Agustus) |
| LB-2 | Skor kontribusi dihitung dari data forum nyata: **+5/pertanyaan, +10/jawaban, +25/jawaban terbaik** — formula ditampilkan terbuka |
| LB-3 | Level: Pemula (<100), Buddy (100–499), Expert (≥500) |

### 7.6 Moderasi & Keamanan Konten (P0)
| ID | Requirement |
|---|---|
| MOD-1 | Setiap konten publik punya tombol "Lapor" dengan dialog berstruktur (alasan + detail) |
| MOD-2 | Announcement circle hanya bisa dibuat moderator (RBAC berdasarkan `memberNames[].moderator`) |
| MOD-3 | Semua operasi tulis DB divalidasi RLS: user hanya bisa mengubah/menghapus miliknya |
| MOD-4 | Aturan komunitas dipublikasikan di /pedoman beserta konsekuensi pelanggaran |

---

## 8. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Keamanan** | RLS aktif di semua tabel (anon tidak bisa baca — diverifikasi e2e); anon key saja di client (bukan service_role); password distandarkan Supabase Auth; tanpa kredensial di repo (`.env*` di-ignore) |
| **Anti-fraud** | Bonus skill tidak langsung jadi poin (pending sampai kontribusi nyata); reward escrow; vote unik per user |
| **Performa** | Build Next.js; aset statis hashed di-cache 1 tahun via nginx; halaman utama tampil < 2 detik pada koneksi kampus |
| **Responsif** | Bebas horizontal-overflow di 390px, 768px, 1280px (diverifikasi otomatis); bottom-nav di mobile |
| **Keandalan** | PM2 auto-restart + auto-start saat reboot; health via `pm2 status`; log terstruktur di /var/log/filbuddy |
| **Aksesibilitas** | Semua tombol interaktif punya `aria-label`; kontras teks memenuhi minimum; navigasi keyboard pada modal |
| **Kejujuran data** | Tidak ada angka statis palsu di UI (statistik & leaderboard dari DB nyata; mode demo menampilkan disclaimer) |
| **Bahasa** | Seluruh UI Bahasa Indonesia |

---

## 9. Arsitektur & Teknologi

```
Browser (React 19 / Next.js 15.5 App Router, Tailwind v4)
        │ HTTPS
        ▼
Cloudflare (DNS + CDN + proxy, Origin Certificate, SSL Full strict)
        ▼
Nginx (reverse proxy :80/:443 → :3000, cache /_next/static)
        ▼
PM2 → next start (Node 20, user ubuntu, auto-restart & boot)
        ▼
Supabase (PostgreSQL + Auth + Row Level Security)
```

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 15.5.25, React 19.2.8, Tailwind CSS v4, Material Symbols |
| State | React Context — dua provider: `DemoStore` (localStorage) & `SupabaseStore` (DB), kontrak interface `Store` identik |
| Backend | Supabase: 6 tabel (profiles, questions, answers, question_votes, slots, activities) + trigger `handle_new_user` |
| Deploy | VPS Ubuntu, PM2 (`ecosystem.config.cjs`), Nginx, Cloudflare; `deploy/deploy.sh` untuk setup & update |
| CI/QA | `tsc --noEmit` + 3 suite Playwright (lihat §12) |

**Mode ganda:** bila Supabase belum dikonfigurasi/tabel belum ada, aplikasi otomatis fallback ke mode demo (localStorage) — memungkinkan demo offline tanpa DB.

---

## 10. Model Data (ringkas)

| Tabel | Kolom kunci | Catatan |
|---|---|---|
| `profiles` | id (FK auth.users), name, nim (unique), email, prodi (enum), points, teaching_hours, teach_skills/learn_skills (jsonb) | dibuat otomatis via trigger saat signup |
| `questions` | author_id, title, excerpt, category, tags[], reward, votes, status (terjawab/menunggu/hot) | reward = escrow |
| `answers` | question_id, author_id, content, votes, accepted | 1 accepted per question |
| `question_votes` | (question_id, user_id) PK, dir ±1 | cegah vote ganda |
| `slots` | owner_id, title, schedule, partner, status | barter 1-on-1 |
| `activities` | user_id, icon, title, description, created_at | feed privat per user |

Policies RLS: select publik untuk konten komunitas; insert/update/delete hanya milik sendiri (jawaban juga bisa di-update oleh penanya — untuk tandai terbaik).

---

## 11. Aturan Bisnis (Poin & Moderasi)

1. Poin starter 100 Pts sekali per akun.
2. Bonus skill = 50 Pts × jumlah skill yang diajar saat register, status **pending**; dicairkan otomatis saat kontribusi pertama (menjawab forum) — mencegah akun fiktif menimbun poin.
3. Reward pertanyaan dipotong saat posting (escrow) dan hanya berpindah saat penanya menandai jawaban terbaik.
4. Hapus pertanyaan: hanya sebelum ada jawaban terbaik; reward dikembalikan penuh.
5. Hapus jawaban: boleh selama bukan jawaban terbaik.
6. Skor leaderboard = 5·pertanyaan + 10·jawaban + 25·jawaban terbaik dalam periode; tidak memengaruhi saldo poin (saldo = barter, skor = reputasi kontribusi).
7. Pelaporan: ref `FB-xxxxxx` dicatat di perangkat pelapor; tindakan moderasi (peringatan → mute → banned) mengikuti /pedoman.
8. Pengumuman di circle hanya oleh moderator circle tersebut.

---

## 12. Testing & QA

| Suite | Cakupan | Hasil terakhir |
|---|---|---|
| `tests/e2e_smoke.py` | Alur inti demo: login salah/benar, greeting, saldo, buat pertanyaan + reward, vote, jawab, tandai terbaik, slot, logout, bebas console-error | 18/18 ✓ |
| `tests/e2e_supabase.py` | Mode database: registrasi + bonus pending, logout/login, forum + vote + best-answer persisten, slot, reload persistence, RLS anon | 13/13 ✓ |
| `tests/e2e_responsive.py` | Overflow 0px di 390px & 768px pada semua halaman, logo, leaderboard sinkron | 14/14 ✓ |
| Type check | `npx tsc --noEmit` | 0 error ✓ |

Setiap rilis: jalankan ketiga suite + `npm run build` sebelum `deploy/deploy.sh`.

---

## 13. Rencana Rilis

| Versi | Isi | Status |
|---|---|---|
| v0.1–v0.9 | Iterasi internal (audit 7 must-have: moderasi, Meet-ready, register, profil jujur, dll.) | ✓ selesai |
| **v1.0 (kini)** | Fitur lengkap §7 + deploy produksi VPS + Cloudflare | ✓ live di filbuddy.space |
| v1.1 | SSO Google (@upiyptk.ac.id), notifikasi email saat pertanyaan dijawab, seed data kampus resmi | rencana |
| v1.2 | Notifikasi in-app real-time, pencarian semantik, PWA installable | rencana |
| v2.0 | Rating sesi mengajar aktif (rating bintang nyata), sertifikat kontribusi semesteran | idea |

---

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Akun fiktif menimbang bonus poin | Ekonomi poin rusak | Bonus pending — hanya cair setelah kontribusi nyata |
| Spam/ujaran di forum | Lingkungan tidak sehat | Tombol lapor di semua konten + /pedoman + moderator circle |
| Link Meet bocor ke non-peserta | Sesi diceroboh | Join gated ±10 menit window; link hanya terlihat peserta terdaftar |
| Trafik tak terduga menumbangkan VPS 1-core | Downtime | Cloudflare cache + PM2 max_memory_restart; opsi scale-up |
| Supabase free tier limit | DB berhenti | Monitoring kuota; fallback mode demo menjaga aplikasi tetap bisa didemokan |
| Kehilangan akses server | Downtime panjang | Semua kode di GitHub + deploy.sh → VPS baru siap < 30 menit |

---

## 15. Glosarium

| Istilah | Arti |
|---|---|
| **Barter skill** | Pertukaran keahlian antar mahasiswa tanpa uang |
| **Karma Pts** | Mata uang sosial FilBuddy; diperoleh dari kontribusi, dipakai untuk reward |
| **Escrow** | Mekanisme menahan reward sampai jawaban terbaik ditandai |
| **Slot** | Jadwal barter 1-on-1 antara dua mahasiswa |
| **Skill Room** | Kelas virtual terjadwal dengan link Google Meet |
| **Circle** | Komunitas topik (r/style) tempat post & diskusi |
| **Pending bonus** | Bonus skill yang belum dicairkan sampai kontribusi pertama |
| **RLS** | Row Level Security — kebijakan akses baris di level database |

---

*Dokumen ini mencerminkan keadaan implementasi per 22 September 2026. Perubahan scope wajib memperbarui dokumen ini.*
