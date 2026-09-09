import { Reveal } from "@/components/Reveal";

const steps = [
  {
    num: "01",
    tag: "NIM AUTH",
    title: "Daftar & Klaim 100 Poin",
    description:
      "Masuk memakai NIM kampus (@upiyptk.ac.id). Sistem langsung memberikan 100 Starter BuddyPoints gratis agar kamu bisa langsung mulai barter.",
    icon: "check_circle",
    iconClass: "text-emerald-600",
    note: "+100 Welcome Points",
    noteClass: "font-semibold text-emerald-700",
    numWrapClass: "bg-indigo-50 border-indigo-100 text-indigo-700",
    tagClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
    hoverBorderClass: "hover:border-indigo-300",
  },
  {
    num: "02",
    tag: "OFFER SKILL",
    title: "Buka Slot Barter",
    description:
      "Posting skill apa yang bisa kamu ajarkan: kodingan Java, konfigurasi Mikrotik, desain poster himpunan, atau troubleshooting error terminal.",
    icon: "schedule",
    iconClass: "text-emerald-600",
    note: "Atur jadwal luangmu",
    noteClass: "text-slate-600",
    numWrapClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    hoverBorderClass: "hover:border-emerald-300",
  },
  {
    num: "03",
    tag: "1-ON-1 SWAP",
    title: "Tukar Poin & Belajar",
    description:
      "Gunakan poin untuk dibimbing kawan sejurusan yang kamu pilih. Belajar privat santai di kantin, selasar FILKOM, atau Discord kampus.",
    icon: "bolt",
    iconClass: "text-amber-600",
    note: "Poin otomatis tertransfer",
    noteClass: "text-slate-600",
    numWrapClass: "bg-amber-50 border-amber-100 text-amber-700",
    tagClass: "bg-amber-50 text-amber-700 border-amber-100",
    hoverBorderClass: "hover:border-amber-300",
  },
  {
    num: "04",
    tag: "KARMA BADGE",
    title: "Review & Reputasi",
    description:
      "Beri review bintang dan apresiasi. Kumpulkan skor Karma untuk meraih titel \u201CFilBuddy Mentor of the Month\u201D di leaderboard kampus.",
    icon: "workspace_premium",
    iconClass: "text-indigo-600",
    note: "Portofolio Peer Mentor",
    noteClass: "font-semibold text-indigo-700",
    numWrapClass: "bg-indigo-50 border-indigo-100 text-indigo-700",
    tagClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
    hoverBorderClass: "hover:border-indigo-300",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-label-code text-xs text-indigo-600 font-bold uppercase tracking-widest block mb-1">
            {"//"} SIMPLE 4-STEP LOOP
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Cara Kerja Sistem BuddyPoints (Zero Rupiah)
          </h2>
          <p className="font-body-md text-sm sm:text-base text-slate-600">
            Mekanisme pertukaran keahlian tertutup yang aman, terverifikasi otomatis
            melalui portal akademik Filkom UPI YPTK.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <Reveal key={s.num} delay={i * 130} className="h-full">
            <div
              className={`h-full p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg ${s.hoverBorderClass} hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-10 h-10 rounded-xl border ${s.numWrapClass} flex items-center justify-center font-label-code text-sm font-bold group-hover:scale-110 transition-transform duration-300`}>
                    {s.num}
                  </span>
                  <span className={`font-label-karma text-[10px] font-bold px-2 py-0.5 rounded border ${s.tagClass}`}>
                    {s.tag}
                  </span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="font-body-sm text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{s.description}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className={`material-symbols-outlined ${s.iconClass} text-base`}>{s.icon}</span>
                <span className={`font-label-code text-xs ${s.noteClass}`}>{s.note}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
