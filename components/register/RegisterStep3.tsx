"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { RegisterData, StudyMode } from "./types";

const prodiLabels: Record<string, string> = {
  IF: "Teknik Informatika (S1)",
  SI: "Sistem Informasi (S1)",
  SK: "Sistem Komputer (S1)",
  MI: "Manajemen Informatika (D3)",
};

const studyModeLabels: Record<StudyMode, string> = {
  online: "Online (Meet/Discord)",
  offline: "Tatap Muka Kampus",
  hybrid: "Fleksibel (Hybrid)",
};

export function RegisterStep3({
  data,
  onBack,
  onEdit,
}: {
  data: RegisterData;
  onBack: () => void;
  onEdit: (step: 1 | 2) => void;
}) {
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useStore();

  const bonus = data.teachSkills.length * 50;
  const total = 100 + bonus;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    const res = await register({
      name: data.fullName,
      nim: data.nim,
      email: data.email,
      prodi: data.prodi,
      password: data.password,
      teachSkills: data.teachSkills,
      learnSkills: data.learnSkills,
      studyMode: data.studyMode,
      availability: data.availability,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error ?? "Terjadi kesalahan.");
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto w-full text-center animate-[fade-up_0.5s_ease-out_both] py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[44px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Akun Berhasil Dibuat! 🎉
        </h1>
        <p className="font-body-md text-sm text-slate-600 leading-relaxed mb-6">
          Selamat datang di FilBuddy, <strong className="text-slate-900">{data.fullName || "Buddy"}</strong>!
          Jangan lupa cek email kampus untuk verifikasi akun.
        </p>
        <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 mb-8">
          <span className="material-symbols-outlined text-amber-500">redeem</span>
          <span className="font-label-code text-sm font-bold text-amber-700">
            +{total} BuddyPoints masuk ke saldo-mu!
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Masuk ke FilBuddy</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all"
          >
            Jelajahi Beranda
          </Link>
        </div>
        <p className="text-[11px] text-slate-400 mt-4">
          Gunakan NIM/email dan kata sandi yang kamu daftarkan untuk masuk.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full animate-[fade-up_0.4s_ease-out_both]">
      <div className="mb-6">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Konfirmasi &amp; Aktivasi Akun ✅
        </h1>
        <p className="mt-2 font-body-md text-sm text-slate-600">
          Cek kembali datamu sebelum akun FilBuddy dibuat.
        </p>
      </div>

      <div className="space-y-4">
        {/* Ringkasan Data Diri */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-label-code uppercase tracking-wider text-indigo-600 font-bold">
              Data Diri
            </span>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Ubah
            </button>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Nama</dt>
              <dd className="font-semibold text-slate-900 text-right">{data.fullName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">NIM</dt>
              <dd className="font-label-code text-slate-900">{data.nim}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-900 text-right break-all">{data.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Prodi</dt>
              <dd className="font-semibold text-slate-900 text-right">{prodiLabels[data.prodi] ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {/* Ringkasan Skill */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-label-code uppercase tracking-wider text-indigo-600 font-bold">
              Skill &amp; Minat
            </span>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Ubah
            </button>
          </div>
          <div className="space-y-2.5">
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">Bisa diajarkan:</p>
              <div className="flex flex-wrap gap-1.5">
                {data.teachSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                    {s.name}
                    <span className="text-[9px] font-label-code px-1 py-0.5 rounded bg-indigo-600 text-white font-semibold">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">Ingin dipelajari:</p>
              <div className="flex flex-wrap gap-1.5">
                {data.learnSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-indigo-500">event</span>
                {studyModeLabels[data.studyMode]}
              </span>
              {data.availability.map((a) => (
                <span key={a} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-indigo-500">schedule</span>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Poin */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-label-code uppercase tracking-wider text-indigo-300 font-bold">
              Saldo Awal BuddyPoints
            </span>
            <span className="material-symbols-outlined text-[18px] text-amber-300">savings</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Starter bonus pendaftaran</span>
              <span className="font-label-code font-bold text-emerald-400">+100 Pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">
                Skill ditawarkan ({data.teachSkills.length} × 50)
              </span>
              <span className="font-label-code font-bold text-emerald-400">+{bonus} Pts</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="font-semibold">Total saldo awal</span>
              <span key={total} className="font-label-code font-bold text-amber-300 animate-[fade-up_0.35s_ease-out_both]">
                {total} Pts
              </span>
            </div>
          </div>
        </div>

        {/* Setuju */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 rounded text-indigo-600 bg-slate-100 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 w-4 h-4 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-snug">
            Saya menyatakan data di atas benar dan setuju dengan{" "}
            <a href="#" className="text-indigo-600 font-semibold hover:underline">
              Pedoman Komunitas
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-indigo-600 font-semibold hover:underline">
              Privasi Mahasiswa FilBuddy
            </a>
            .
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-headline-sm font-semibold text-sm transition-all text-center inline-flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali</span>
          </button>
          <button
            type="button"
            disabled={!agree || submitting}
            onClick={submit}
            className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline-sm font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Membuat akun...</span>
              </>
            ) : (
              <>
                <span>Buat Akun &amp; Klaim {total} Poin</span>
                <span className="text-base">🎁</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
