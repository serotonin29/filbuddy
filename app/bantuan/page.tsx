import Link from "next/link";

const FAQ = [
  {
    q: "Saya tidak menerima email verifikasi saat daftar.",
    a: "Cek folder spam dengan alamat @upiyptk.ac.id sebagai pengirim. Kalau setelah 5 menit belum sampai, coba daftar ulang dengan ejaan email yang sama — sistem akan mengirim ulang.",
  },
  {
    q: "Saya lupa password.",
    a: "Buka halaman Masuk, tekan “Lupa password?”, lalu ikuti tautan yang dikirim ke email kampusmu. Tautan berlaku 60 menit.",
  },
  {
    q: "Kenapa poin bonus skill saya belum masuk?",
    a: "Bonus skill (+50 per skill yang ditawarkan) sengaja dibuat pending untuk mencegah klaim semu. Poin cair otomatis setelah kontribusi pertamamu, misalnya menjawab satu pertanyaan di forum.",
  },
  {
    q: "Link Google Meet room tidak bisa diklik.",
    a: "Tombol Join Meet baru aktif 10 menit sebelum jadwal sesi sampai sesi selesai. Pastikan juga kamu sudah join room. Kalau masih terkunci setelah waktunya, ping host lewat diskusi room.",
  },
  {
    q: "Bagaimana cara melapor konten bermasalah?",
    a: "Tekan tombol “Lapor” di post, pertanyaan, pesan, atau room yang bermasalah, pilih kategori, dan kirim. Kamu dapat nomor tiket (FB-xxxxxx); moderat meninjau maksimal 1×24 jam.",
  },
  {
    q: "Saya ingin menghapus akun saya.",
    a: "Kirim permintaan lewat pesan ke tim moderat atau email tim FilBuddy dari email kampus terdaftarmu. Semua data dihapus permanen dalam 7 hari kerja.",
  },
];

export default function BantuanPage() {
  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali
        </Link>

        <h1 className="mt-6 font-headline-lg text-3xl font-extrabold text-slate-900 tracking-tight">
          Bantuan Teknis
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Jawaban cepat untuk masalah yang paling sering dialami mahasiswa baru FilBuddy.
        </p>

        <div className="mt-8 space-y-3">
          {FAQ.map((f, i) => (
            <details
              key={f.q}
              className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-sm font-bold text-slate-900">
                <span>
                  {i + 1}. {f.q}
                </span>
                <span className="material-symbols-outlined text-[20px] text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
          <h2 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Masih belum terjawab?
          </h2>
          <p className="mt-1.5 text-xs text-indigo-900/80 leading-relaxed">
            Kirim email ke{" "}
            <span className="font-label-code font-bold">bantuan@upiyptk.ac.id</span> dari email
            kampusmu, sebutkan NIM dan deskripsi masalah. Respons maksimal 1 hari kerja.
          </p>
        </div>

        <p className="mt-8 text-[11px] text-slate-400">
          FilBuddy UPI YPTK Padang ·{" "}
          <Link href="/pedoman" className="hover:text-indigo-600 font-semibold">
            Pedoman Komunitas
          </Link>{" "}
          ·{" "}
          <Link href="/privasi" className="hover:text-indigo-600 font-semibold">
            Privasi
          </Link>
        </p>
      </div>
    </main>
  );
}
