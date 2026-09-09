import { Brand } from "@/components/Brand";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="h-16 max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <a className="flex items-center group" href="#">
            <Brand className="h-9 sm:h-10 w-auto rounded-lg group-hover:scale-105 transition-transform" />
          </a>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-1">
            UPI YPTK Padang
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <a className="px-3 py-1.5 rounded-lg font-label-ui text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors" href="#cara-kerja">
            Cara Kerja
          </a>
          <a className="px-3 py-1.5 rounded-lg font-label-ui text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors" href="#katalog-skill">
            Katalog Skill
          </a>
          <a className="px-3 py-1.5 rounded-lg font-label-ui text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors" href="#kalkulator-section">
            Simulasi Poin
          </a>
          <a className="px-3 py-1.5 rounded-lg font-label-ui text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors" href="#testimoni">
            Testimoni
          </a>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-label-code text-xs font-semibold shadow-xs">
            <span>🎁</span>
            <span>+100 BuddyPoints</span>
          </div>
          <a
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-label-ui text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
            href="/login"
          >
            <span className="hidden sm:inline">Masuk Akun Kampus</span>
            <span className="sm:hidden">Masuk</span>
            <div className="w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white/60 flex items-center justify-center text-[10px] font-headline-sm font-bold text-white">
              FB
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}
