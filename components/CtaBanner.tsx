"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";

export function CtaBanner() {
  const [nim, setNim] = useState("");

  return (
    <section id="login" className="max-w-[1440px] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-12 mb-16">
      <Reveal>
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 overflow-hidden p-8 sm:p-14 text-center shadow-xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-indigo-300 border border-white/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Siap Naik Level Bareng Teman Seangkatan?
          </h2>
          <p className="font-body-md text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
            Gabung sekarang menggunakan akun email mahasiswa atau NIM UPI YPTK
            Padang dan klaim{" "}
            <span className="text-emerald-400 font-bold">100 BuddyPoints pertamamu</span>{" "}
            secara instan!
          </p>
          <form
            className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md mb-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-label-code text-xs font-semibold">
                NIM:
              </span>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="22101152610xxx"
                className="w-full bg-white text-slate-900 pl-14 pr-4 py-3 rounded-xl font-label-code text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-headline-sm text-xs sm:text-sm font-bold whitespace-nowrap shadow-md transition-all"
            >
              Daftar via NIM
            </button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2.5 font-label-karma text-xs text-slate-300">
            <span>✓ Mahasiswa Aktif S1/D3</span>
            <span>•</span>
            <span>✓ Bebas Biaya Rupiah</span>
            <span>•</span>
            <span>✓ Portal Mahasiswa UPI YPTK</span>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
