export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50 pt-10 sm:pt-14 pb-16 sm:pb-20">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[380px] bg-indigo-200/35 rounded-full blur-[110px] pointer-events-none animate-[float_10s_ease-in-out_infinite]" />
      <div className="absolute top-48 -left-20 w-80 h-80 bg-emerald-200/30 rounded-full blur-[90px] pointer-events-none animate-[float-reverse_12s_ease-in-out_infinite]" />

      <div className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 shadow-sm mb-5 animate-[fade-up_0.6s_ease-out_both]">
            <span className="text-xs">✨</span>
            <span className="font-label-ui text-xs sm:text-sm font-semibold">
              Platform Barter Skill Mahasiswa <strong className="text-indigo-900">Filkom UPI YPTK Padang</strong>
            </span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-slate-900 font-extrabold tracking-tight leading-[1.15] mb-4 animate-[fade-up_0.7s_ease-out_both] [animation-delay:120ms]">
            Nggak Perlu Uang Buat Belajar Skill Baru.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600">
              Cukup Barter Ilmu
            </span>{" "}
            dengan Mahasiswa Filkom!
          </h1>

          <p className="font-body-lg text-slate-600 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed animate-[fade-up_0.7s_ease-out_both] [animation-delay:240ms]">
            Buntu ngerjain tugas Pemrograman Web? Butuh jago UI/UX Figma atau
            kalkulus informatika? Tukar keahlianmu, bantu teman sejurusan, dan
            kumpulkan BuddyPoints tanpa keluar uang sepeserpun.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-8 animate-[fade-up_0.7s_ease-out_both] [animation-delay:360ms]">
            <a
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 text-white font-headline-sm text-sm sm:text-base font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 shadow-md"
              href="#kalkulator-section"
            >
              <span>Mulai Barter Skill Sekarang</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/20 font-label-code text-white font-bold">+100 Pts</span>
            </a>
            <a
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-slate-700 hover:bg-slate-100/90 font-label-ui text-sm font-semibold border border-slate-200/90 shadow-sm transition-all flex items-center justify-center gap-2"
              href="#cara-kerja"
            >
              <span className="material-symbols-outlined text-indigo-600 text-lg">play_circle</span>
              <span>Lihat Simulasi Sistem Poin</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-full bg-white/90 border border-slate-200/70 shadow-xs animate-[fade-up_0.7s_ease-out_both] [animation-delay:480ms]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-label-code text-xs text-emerald-700 font-bold">1,240+</span>
              <span className="font-body-sm text-xs text-slate-500">Mahasiswa Filkom Aktif</span>
            </div>
            <span className="text-slate-300 font-label-code">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-label-code text-xs text-indigo-700 font-bold">3,400+</span>
              <span className="font-body-sm text-xs text-slate-500">Jam Barter Selesai</span>
            </div>
            <span className="text-slate-300 font-label-code">•</span>
            <div className="flex items-center gap-1 font-label-karma text-xs text-amber-600 font-bold">
              <span>⚡ 100% Bebas Biaya Rupiah</span>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-xl shadow-indigo-100/50 animate-[fade-up_0.8s_ease-out_both] [animation-delay:600ms]">
          <div className="flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-label-code text-xs text-slate-500 font-medium ml-2">
                session_live_room #0492-filkom
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-label-karma text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
              <span>VERIFIED MAHASISWA FILKOM UPI YPTK</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            <div className="md:col-span-5 rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 flex flex-col gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 font-label-code">
                  OFFERING • KAMU AJARKAN
                </span>
                <span className="font-label-karma text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                  +50 Pts Earned
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white shrink-0 ring-2 ring-white shadow-xs flex items-center justify-center font-headline-sm text-sm font-bold">
                  RD
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-sm font-bold text-slate-900 truncate">Rahmat Danu</span>
                  <span className="font-label-code text-xs text-slate-500">IF &apos;22 • Lubuk Begalung</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                <p className="font-label-code text-xs text-indigo-700 font-bold mb-1">Laravel 11 &amp; REST API Backend</p>
                <p className="font-body-sm text-xs text-slate-600 leading-relaxed">
                  Arsitektur MVC, Eloquent ORM, JWT Auth, &amp; integrasi Postman untuk praktikum semester 4.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">PHP 8</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">MySQL</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">Sanctum</span>
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
              <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm cursor-pointer hover:rotate-180 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-lg">sync_alt</span>
              </div>
              <span className="font-label-karma text-[10px] text-amber-600 font-bold mt-1.5 uppercase whitespace-nowrap">
                1:1 Barter
              </span>
            </div>

            <div className="md:col-span-5 rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 flex flex-col gap-3 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 font-label-code">
                  SEEKING • KAMU PELAJARI
                </span>
                <span className="font-label-karma text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                  -50 Pts Spent
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white shrink-0 ring-2 ring-white shadow-xs flex items-center justify-center font-headline-sm text-sm font-bold">
                  SA
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-sm font-bold text-slate-900 truncate">Sarah Azzahra</span>
                  <span className="font-label-code text-xs text-slate-500">SI &apos;23 • Kampus FILKOM Lt. 3</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                <p className="font-label-code text-xs text-emerald-700 font-bold mb-1">UI/UX Figma &amp; Interactive Prototype</p>
                <p className="font-body-sm text-xs text-slate-600 leading-relaxed">
                  Auto-layout master, component variants, wireframing cepat, &amp; prinsip Heuristic Evaluation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">Figma</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">Design System</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">Usability</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-2 font-body-sm text-xs text-slate-600">
              <span className="material-symbols-outlined text-emerald-600 text-base">schedule</span>
              <span>
                Jadwal Barter: <strong className="text-slate-800">Hari Ini, 19:30 WIB</strong> (Lab Komputer 4 / Google Meet)
              </span>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-label-ui text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors">
              Gabung Simulasi Match
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
