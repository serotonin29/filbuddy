"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Brand } from "@/components/Brand";

type Method = "nim" | "email";

const prodiOptions = [
  { value: "if", label: "Teknik Informatika (S1)" },
  { value: "si", label: "Sistem Informasi (S1)" },
  { value: "sk", label: "Sistem Komputer (S1)" },
  { value: "mi", label: "Manajemen Informatika (D3)" },
];

const features = [
  {
    icon: "hub",
    wrapClass: "bg-indigo-500/30 border-indigo-400/30 text-indigo-300",
    title: "Terhubung 4 Jurusan Kampus",
    desc: "Teknik Informatika, Sistem Informasi, SK, & Manajemen Informatika",
  },
  {
    icon: "bolt",
    wrapClass: "bg-emerald-500/30 border-emerald-400/30 text-emerald-300",
    title: "Sistem BuddyPoints Terpercaya",
    desc: "Bantu coding, bantu revisi UI/UX, atau sharing materi UAS",
  },
  {
    icon: "lock",
    wrapClass: "bg-amber-500/30 border-amber-400/30 text-amber-300",
    title: "Verifikasi Kampus Aman",
    desc: "Ekosistem privat tertutup khusus mahasiswa UPI YPTK Padang",
  },
] as const;

export function LoginPage() {
  const router = useRouter();
  const { login, mode } = useStore();
  const [method, setMethod] = useState<Method>("nim");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(res.error ?? "Terjadi kesalahan.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 transition-transform active:scale-95"
          >
            <Brand className="h-10 sm:h-12 w-auto" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-slate-600">
                arrow_back
              </span>
              <span className="hidden sm:inline">Kembali ke</span> Beranda
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SSO Portal Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Main Auth Split View */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 mesh-gradient py-8 sm:py-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[640px] animate-[fade-up_0.7s_ease-out_both]">
          {/* Left Column: Marketing / Peer Ecosystem Highlights */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-[float_10s_ease-in-out_infinite]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-[float-reverse_12s_ease-in-out_infinite]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/10 text-xs font-semibold text-emerald-300 mb-6">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                Khusus Mahasiswa FILKOM
              </div>

              <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-4">
                Tukar ilmu, lulus bareng teman se-FilKom!
              </h2>
              <p className="font-body-md text-slate-300 text-sm leading-relaxed mb-6">
                Masuk dengan akun NIM kampus kamu dan dapatkan modal{" "}
                <strong className="text-emerald-300 font-bold">100 BuddyPoints</strong> instan untuk
                langsung barter belajar tanpa keluar uang sepeserpun.
              </p>

              <div className="hidden sm:flex flex-col gap-3.5 border-t border-white/10 pt-6">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-md ${f.wrapClass} flex items-center justify-center shrink-0 mt-0.5 border`}>
                      <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{f.title}</p>
                      <p className="text-[11px] text-slate-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 hidden lg:flex items-center gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 ring-2 ring-emerald-400/60 shadow-md flex items-center justify-center font-headline-sm text-sm font-bold text-white shrink-0">
                SA
              </div>
              <div className="text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  Sarah Azzahra
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SI &apos;23
                  </span>
                </p>
                <p className="text-slate-400 text-[11px] italic">
                  &ldquo;Udah barter 4x sesi Figma dengan teman IF, kebantu banget!&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form Interface */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang Kembali 👋
                </h1>
                <p className="mt-2 font-body-md text-sm text-slate-600">
                  Masuk ke akun <span className="font-bold text-indigo-600">FilBuddy</span> kamu
                  menggunakan kredensial mahasiswa.
                </p>
              </div>

              {/* Method Selector Tabs */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 mb-6 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setMethod("nim")}
                  className={
                    method === "nim"
                      ? "flex-1 py-2 px-3 rounded-lg bg-white text-indigo-700 shadow-sm border border-slate-200/80 text-center transition-all whitespace-nowrap"
                      : "flex-1 py-2 px-3 rounded-lg hover:text-slate-900 text-center transition-all text-slate-500 hover:bg-slate-200/60 whitespace-nowrap"
                  }
                >
                  <span className="sm:hidden">NIM</span>
                  <span className="hidden sm:inline">Nomor Induk Mahasiswa (NIM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={
                    method === "email"
                      ? "flex-1 py-2 px-3 rounded-lg bg-white text-indigo-700 shadow-sm border border-slate-200/80 text-center transition-all whitespace-nowrap"
                      : "flex-1 py-2 px-3 rounded-lg hover:text-slate-900 text-center transition-all text-slate-500 hover:bg-slate-200/60 whitespace-nowrap"
                  }
                >
                  <span className="sm:hidden">Email Kampus</span>
                  <span className="hidden sm:inline">Email Kampus (@upiyptk.ac.id)</span>
                </button>
              </div>

              {/* Login Form */}
              <form className="space-y-4" onSubmit={submit}>
                {/* Input NIM / Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="identifier" className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
                      {method === "nim" ? "NIM Mahasiswa" : "Email Kampus"}
                    </label>
                    {method === "nim" && (
                      <span className="text-[11px] text-slate-500">
                        Contoh: <code className="font-label-code text-indigo-600 font-semibold">22101152610xxx</code>
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        {method === "nim" ? "person" : "mail"}
                      </span>
                    </div>
                    {method === "nim" ? (
                      <input
                        type="text"
                        id="identifier"
                        name="nim"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Masukkan 14 digit NIM Filkom"
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-label-code"
                      />
                    ) : (
                      <input
                        type="email"
                        id="identifier"
                        name="email"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="nama.mahasiswa@upiyptk.ac.id"
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                      />
                    )}
                    {method === "nim" && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          FILKOM
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Jurusan Dropdown */}
                <div>
                  <label htmlFor="prodi" className="block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5">
                    Program Studi
                  </label>
                  <div className="relative">
                    <select
                      id="prodi"
                      name="prodi"
                      className="block w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    >
                      {prodiOptions.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-500">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-700 tracking-wide uppercase">
                      Kata Sandi
                    </label>
                    <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                      Lupa kata sandi?
                    </a>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Security Check */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600">Ingat perangkat ini (30 hari)</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">https</span>
                SSL 256-bit
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-[fade-up_0.3s_ease-out_both]">
                <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
                {error}
              </div>
            )}

            {/* Mode hint */}
            <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">info</span>
              <span>
                {mode === "supabase" ? (
                  <>
                    Masuk dengan <strong className="text-slate-700">NIM</strong> atau{" "}
                    <strong className="text-slate-700">email kampus</strong> — data tersimpan online di database
                    FilBuddy. Belum punya akun?{" "}
                    <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
                      Daftar sekarang
                    </Link>{" "}
                    — gratis 100 BuddyPoints.
                  </>
                ) : (
                  <>
                    Mode demo (data tersimpan di perangkat ini). Akun demo:{" "}
                    <code className="font-label-code text-indigo-600 font-semibold">22101152610001</code> / sandi{" "}
                    <code className="font-label-code text-indigo-600 font-semibold">password123</code>.
                  </>
                )}
              </span>
            </div>

            {/* CTA Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Memeriksa akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard FilBuddy</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

                {/* SSO Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                      Atau Masuk Melalui
                    </span>
                  </div>
                </div>

                {/* Portal SSO Button */}
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:border-slate-400 active:scale-[0.99] cursor-not-allowed opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px] text-indigo-600">school</span>
                  <span>Single Sign-On (SSO) Portal Akademik UPI YPTK (COMING SOON)</span>
                </button>
              </form>

              {/* Footer Register Link */}
              <div className="mt-8 text-center pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Belum terdaftar di FilBuddy?{" "}
                  <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1">
                    Klaim 100 Starter Poin Sekarang
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">+100 Pts</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Campus Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FilBuddy © 2025</span>
            <span>•</span>
            <span>Fakultas Ilmu Komputer UPI YPTK Padang</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-indigo-600 transition-colors">Pedoman Komunitas</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Bantuan Teknis</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privasi Mahasiswa</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
