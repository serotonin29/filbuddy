import Link from "next/link";

const RULES = [
  {
    icon: "handshake",
    title: "Saling menghormati",
    desc: "Berkomentar sesuai adab kampus. Kritik idenya, bukan orangnya. Pelecehan, ujaran kebencian, dan bullying akan ditindak moderat.",
  },
  {
    icon: "school",
    title: "Berbagi dengan niat mengajar",
    desc: "Saat mengajar di Skill Room atau menjawab forum, utamakan penjelasan yang membantu orang belajar — bukan sekadar memberi jawaban jadi.",
  },
  {
    icon: "verified_user",
    title: "Data diri yang jujur",
    desc: "Gunakan NIM dan email kampus yang valid. Akun palsu atau menyalahgunakan identitas orang lain akan dinonaktifkan.",
  },
  {
    icon: "copyright",
    title: "Hormati karya orang lain",
    desc: "Kutip sumber saat membagikan catatan, soal, atau kode milik orang lain. Jangan menjual ulang materi tanpa izin.",
  },
  {
    icon: "report",
    title: "Gunakan tombol lapor dengan bijak",
    desc: "Laporkan konten yang melanggar pedoman. Laporan palsu berulang juga merupakan pelanggaran.",
  },
  {
    icon: "balance",
    title: "Barter yang adil",
    desc: "Slot barter dan reward poin mengikat secara sosial. Selesaikan komitmenmu; kalau ada kendala, komunikasikan lebih awal.",
  },
];

export default function PedomanPage() {
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
          Pedoman Komunitas FilBuddy
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          FilBuddy hanya sebaik komunitasnya. Enam prinsip ini berlaku untuk semua forum, circle,
          skill room, dan pesan di dalam FilBuddy. Dengan membuat akun, kamu menyetujui semuanya.
        </p>

        <div className="mt-8 space-y-4">
          {RULES.map((r, i) => (
            <div
              key={r.title}
              className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-indigo-600">{r.icon}</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {i + 1}. {r.title}
                </h2>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            Konsekuensi pelanggaran
          </h2>
          <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
            Pelanggaran ringan: peringatan dari moderat. Pelanggaran berat atau berulang:
            pembekuan akun dan pencabutan akses ke semua fitur komunitas. Laporan ditinjau
            maksimal 1×24 jam dan setiap keputusan dapat diajukan banding via halaman{" "}
            <Link href="/bantuan" className="font-bold underline">
              Bantuan
            </Link>
            .
          </p>
        </div>

        <p className="mt-8 text-[11px] text-slate-400">
          Terakhir diperbarui: September 2026 · FilBuddy UPI YPTK Padang
        </p>
      </div>
    </main>
  );
}
