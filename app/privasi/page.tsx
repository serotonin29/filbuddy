import Link from "next/link";

const SECTIONS = [
  {
    icon: "badge",
    title: "Data yang kami kumpulkan",
    desc: "Nama, NIM, program studi, email kampus, daftar skill, dan aktivitas belajar-mengajarmu di dalam FilBuddy (pertanyaan forum, slot barter, feedback sesi).",
  },
  {
    icon: "lock",
    title: "Apa yang TIDAK kami lakukan",
    desc: "Kami tidak menjual data, tidak membagikan email/NIM ke pengguna lain selain yang tampil di profilmu, dan tidak memakai datamu untuk iklan.",
  },
  {
    icon: "visibility",
    title: "Siapa yang bisa melihat",
    desc: "Profil dan kontribusimu terlihat oleh mahasiswa UPI YPTK terverifikasi. Email kampus tidak pernah ditampilkan publik — hanya nama, prodi, dan angkatan.",
  },
  {
    icon: "delete",
    title: "Hapus akun & data",
    desc: "Kamu bisa meminta penghapusan akun kapan saja lewat halaman Bantuan. Semua pertanyaan, jawaban, dan aktivitas akan dihapus permanen dalam 7 hari kerja.",
  },
];

export default function PrivasiPage() {
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
          Privasi Mahasiswa
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          FilBuddy dikelola untuk komunitas internal UPI YPTK Padang. Ini ringkasan praktik
          privasi kami dalam bahasa manusia — bukan bahasa hukum.
        </p>

        <div className="mt-8 space-y-4">
          {SECTIONS.map((s) => (
            <div key={s.title} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">{s.icon}</span>
                {s.title}
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
          <p className="text-xs text-indigo-900 leading-relaxed">
            <strong>Catatan penting:</strong> Jangan pernah membagikan password, data kartu,
            atau dokumen sensitif di forum maupun pesan. Moderator tidak akan pernah meminta
            password-mu.
          </p>
        </div>

        <p className="mt-8 text-[11px] text-slate-400">
          Terakhir diperbarui: September 2026 · FilBuddy UPI YPTK Padang
        </p>
      </div>
    </main>
  );
}
