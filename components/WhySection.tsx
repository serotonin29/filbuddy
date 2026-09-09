import { Reveal } from "@/components/Reveal";

const reasons = [
  {
    icon: "school",
    code: "01 • KURIKULUM RELEVAN",
    title: "Dari Mahasiswa, Untuk Mahasiswa",
    description:
      "Didesain persis dengan silabus mata kuliah Filkom UPI YPTK Padang. Dari kodingan C++ semester 1, Algoritma Pemrograman, Pemrograman Web, Rekayasa Perangkat Lunak hingga Skripsi.",
    footer: "Mencakup: IF, SI, SK, & MI",
    footerClass: "font-semibold text-slate-500",
    checkIcon: "check",
    iconWrapClass: "bg-indigo-50 text-indigo-600",
    codeClass: "text-indigo-600",
    hoverBorderClass: "hover:border-indigo-200",
    checkClass: "text-indigo-400",
  },
  {
    icon: "currency_exchange",
    code: "02 • TANPA BIAYA RUPIAH",
    title: "Bukan Bayar Uang, Tapi BuddyPoints",
    description:
      "Semua mahasiswa punya hak yang sama untuk berkembang. Hilangkan hambatan finansial; modalmu cukup kemauan berbagi wawasan dan waktu 1 jam luang di sela jam kuliah.",
    footer: "1 Jam Mengajar = Poin Belajar Fleksibel",
    footerClass: "font-bold text-emerald-700",
    checkIcon: "bolt",
    iconWrapClass: "bg-emerald-50 text-emerald-600",
    codeClass: "text-emerald-600",
    hoverBorderClass: "hover:border-emerald-200",
    checkClass: "text-emerald-500",
  },
  {
    icon: "handshake",
    code: "03 • SOLIDARITAS KAMPUS",
    title: "Saling Melengkapi & Anti-Insecure",
    description:
      "Kamu merasa kurang jago ngoding logika? Mungkin kamu jago desain presentasi, instalasi OS, atau dokumentasi laporan teknis. Tiap mahasiswa punya nilai tambah berharga.",
    footer: "Zero Judgment, Full Support",
    footerClass: "font-bold text-amber-700",
    checkIcon: "favorite",
    iconWrapClass: "bg-amber-50 text-amber-600",
    codeClass: "text-amber-600",
    hoverBorderClass: "hover:border-amber-200",
    checkClass: "text-amber-500",
  },
] as const;

export function WhySection() {
  return (
    <section className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="font-label-code text-xs text-emerald-600 font-bold uppercase tracking-widest block mb-1">
            {"//"} FILKOM ECOSYSTEM
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-slate-900">
            Mengapa FilBuddy Lahir Khusus di Filkom UPI YPTK?
          </h2>
        </div>
        <p className="font-body-md text-slate-600 text-sm sm:text-base max-w-md">
          Kuliah IT penuh tantangan praktikum, tugas besar mingguan, dan teknologi
          yang terus berkembang. Jalan terbaik bukan joki—melainkan saling
          membimbing antarmahasiswa.
        </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reasons.map((r, i) => (
          <Reveal key={r.code} delay={i * 140} className="h-full">
            <div
              className={`h-full p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg ${r.hoverBorderClass} hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${r.iconWrapClass} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-2xl">{r.icon}</span>
                </div>
                <span className={`font-label-code text-xs ${r.codeClass} font-bold block mb-1`}>{r.code}</span>
                <h3 className="font-headline-sm text-lg font-bold text-slate-900 mb-2">{r.title}</h3>
                <p className="font-body-md text-sm text-slate-600 leading-relaxed">{r.description}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`font-label-karma text-xs ${r.footerClass}`}>{r.footer}</span>
                <span className={`material-symbols-outlined ${r.checkClass} text-base`}>{r.checkIcon}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
