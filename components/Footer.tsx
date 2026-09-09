import { Brand } from "@/components/Brand";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 pt-12 pb-8">
      <div className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Brand className="h-8 w-auto" />
            </div>
            <p className="font-body-md text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
              &ldquo;Dari Mahasiswa Filkom, Untuk Mahasiswa Filkom.&rdquo; Ekosistem
              kolaborasi pertukaran keahlian coding, pemecahan masalah algoritma,
              dan bimbingan proyek akademik antarmahasiswa UPI YPTK Padang.
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="font-label-karma text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">INFORMATIKA</span>
              <span className="font-label-karma text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">SISTEM INFORMASI</span>
              <span className="font-label-karma text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">SISTEM KOMPUTER</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-headline-sm text-xs font-bold text-slate-900 uppercase tracking-wider">Program Studi</span>
            <ul className="flex flex-col gap-1.5 font-body-sm text-xs sm:text-sm text-slate-600">
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Teknik Informatika (S1)</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Sistem Informasi (S1)</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Sistem Komputer (S1)</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Manajemen Informatika (D3)</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-headline-sm text-xs font-bold text-slate-900 uppercase tracking-wider">Fitur Platform</span>
            <ul className="flex flex-col gap-1.5 font-body-sm text-xs sm:text-sm text-slate-600">
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Skill Matrix Lab</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Bursa Barter Tugas Akhir</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Leaderboard Karma Kampus</li>
              <li className="hover:text-indigo-600 transition-colors cursor-pointer">Pedoman Komunitas</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-headline-sm text-xs font-bold text-slate-900 uppercase tracking-wider">UPI YPTK Padang</span>
            <p className="font-body-sm text-xs text-slate-500 leading-relaxed">
              Fakultas Ilmu Komputer (FILKOM)
              <br />
              Universitas Putra Indonesia &quot;YPTK&quot;
              <br />
              Jl. Raya Lubuk Begalung, Padang, Sumbar
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition-colors" href="#">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
              </a>
              <a className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition-colors" href="#">
                <span className="material-symbols-outlined text-[16px]">code</span>
              </a>
              <a className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 flex items-center justify-center transition-colors" href="#">
                <span className="material-symbols-outlined text-[16px]">forum</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="font-body-sm text-xs text-slate-500">
            © 2025 FilBuddy UPI YPTK Padang. Mahasiswa Filkom Berkarya. Hak Cipta Dilindungi.
          </div>
          <div className="font-label-code text-xs text-emerald-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
            <span>Autentikasi Terintegrasi NIM Portal Mahasiswa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
