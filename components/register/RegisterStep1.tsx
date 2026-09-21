"use client";

import { useState } from "react";
import { usePasswordStrength } from "./usePasswordStrength";
import type { RegisterData } from "./types";

const prodiOptions = [
  { value: "IF", label: "Teknik Informatika (S1)" },
  { value: "SI", label: "Sistem Informasi (S1)" },
  { value: "SK", label: "Sistem Komputer (S1)" },
  { value: "MI", label: "Manajemen Informatika (D3)" },
];

const inputClass =
  "w-full bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all";

const labelClass = "block text-xs font-bold text-slate-700 tracking-wide uppercase mb-1.5";

export function RegisterStep1({
  data,
  onChange,
  onNext,
}: {
  data: RegisterData;
  onChange: (patch: Partial<RegisterData>) => void;
  onNext: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirm, setConfirm] = useState("");
  const strength = usePasswordStrength(data.password);

  const nimOk = /^\d{10,14}$/.test(data.nim.trim());
  const emailOk = /^[^\s@]+@upiyptk\.ac\.id$/i.test(data.email.trim());

  const valid =
    data.fullName.trim() !== "" &&
    nimOk &&
    emailOk &&
    data.prodi !== "" &&
    data.password.length >= 8 &&
    confirm === data.password;

  return (
    <div className="max-w-md mx-auto w-full animate-[fade-up_0.4s_ease-out_both]">
      <div className="mb-6">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Buat Akun FilBuddy 🚀
        </h1>
        <p className="mt-2 font-body-md text-sm text-slate-600">
          Lengkapi data mahasiswa untuk aktivasi akun &amp; klaim poin pembuka.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onNext();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                person
              </span>
              <input
                type="text"
                id="fullName"
                required
                autoComplete="name"
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                placeholder="cth. Sarah Azzahra Putri"
                className={`${inputClass} pl-10 pr-4 py-2.5`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="nim" className={labelClass}>
              NIM Mahasiswa
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                badge
              </span>
              <input
                type="text"
                id="nim"
                required
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                value={data.nim}
                onChange={(e) => onChange({ nim: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                placeholder="22101152610xxx"
                aria-invalid={data.nim !== "" && !nimOk}
                className={`${inputClass} pl-10 pr-20 py-2.5 font-label-code tracking-wide`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <span className="px-2 py-0.5 text-[10px] font-label-code font-bold rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                  FILKOM
                </span>
              </div>
            </div>
            {data.nim !== "" && !nimOk && (
              <p className="text-[11px] text-rose-600 mt-1">NIM harus 10–14 digit angka.</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Kampus
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              mail
            </span>
            <input
              type="email"
              id="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="nama@upiyptk.ac.id"
              aria-invalid={data.email !== "" && !emailOk}
              className={`${inputClass} pl-10 pr-4 py-2.5`}
            />
          </div>
          {data.email !== "" && !emailOk ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Email harus menggunakan domain kampus @upiyptk.ac.id.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-slate-400">info</span>
              Gunakan email aktif universitas untuk verifikasi status mahasiswa.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="prodi" className={labelClass}>
            Program Studi
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              school
            </span>
            <select
              id="prodi"
              required
              value={data.prodi}
              onChange={(e) => onChange({ prodi: e.target.value })}
              className={`${inputClass} pl-10 pr-10 py-2.5 appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                Pilih Program Studi FILKOM...
              </option>
              {prodiOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className={labelClass}>
              Kata Sandi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={data.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="••••••••"
                className={`${inputClass} pl-10 pr-10 py-2.5`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="passwordConfirm" className={labelClass}>
              Konfirmasi Sandi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                lock_reset
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                id="passwordConfirm"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pl-10 pr-10 py-2.5`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-label-code text-slate-500">
            <span>Kekuatan Sandi</span>
            <span key={strength.label} className={`font-semibold ${strength.labelClass}`}>
              {strength.label}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-full w-1/3 rounded-full transition-colors duration-300 ${
                  i < strength.score
                    ? strength.score === 1
                      ? "bg-rose-500"
                      : strength.score === 2
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Minimal 8 karakter, kombinasi huruf besar, angka &amp; simbol.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!valid}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 disabled:hover:from-indigo-600 disabled:hover:to-indigo-800 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Lanjut ke Skill &amp; Minat</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
