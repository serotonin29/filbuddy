"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { RegisterStepper } from "./register/RegisterStepper";
import { RegisterStep1 } from "./register/RegisterStep1";
import { RegisterStep2 } from "./register/RegisterStep2";
import { RegisterStep3 } from "./register/RegisterStep3";
import { initialRegisterData, type RegisterData } from "./register/types";
import { Brand } from "@/components/Brand";

const leftPanels = {
  1: {
    badge: { icon: "verified", text: "Khusus Mahasiswa FILKOM" },
    title: "Mulai Perjalanan Barter Ilmumu!",
    copy: "Daftar dengan NIM kampus, klaim 100 BuddyPoints gratis, dan langsung tukar keahlian dengan teman se-Filkom tanpa biaya sepeserpun.",
    features: [
      {
        icon: "volunteer_activism",
        iconClass: "text-emerald-300",
        title: "Gratis 100% Tanpa Rupiah",
        desc: "Sistem poin barter, bukan uang. 1 jam mengajar = 1 jam belajar",
      },
      {
        icon: "groups",
        iconClass: "text-indigo-300",
        title: "Match dengan Teman Sekelas",
        desc: "Terhubung ke mahasiswa IF, SI, SK & MI se-kampus",
      },
      {
        icon: "military_tech",
        iconClass: "text-amber-300",
        title: "Reputasi Karma Kampus",
        desc: "Kumpulkan bintang & jadi Mentor of the Month",
      },
    ],
    testimonial: {
      initials: "RD",
      name: "Rahmat Danu",
      tag: "IF '22",
      meta: "Teknik Informatika",
      quote:
        "Barter pertamaku lancar, dapat teman ngoding Laravel dan aku bantu dia di kalkulus informatika!",
    },
  },
  2: {
    badge: { icon: "hub", text: "Sistem Peer Learning FILKOM" },
    title: "Saling Bantu, Tumbuh Bareng!",
    copy: "Keahlianmu di satu mata kuliah bernilai tinggi bagi teman lain. Tentukan apa yang bisa kamu ajarkan dan apa yang ingin kamu kuasai.",
    features: [
      {
        icon: "bolt",
        iconClass: "text-emerald-300",
        title: "+50 BuddyPoints Tambahan",
        desc: "Setiap skill terverifikasi yang kamu tawarkan menambah saldo awal belajarmu.",
      },
      {
        icon: "handshake",
        iconClass: "text-indigo-300",
        title: "Algoritma Smart Matching",
        desc: "Otomatis temukan teman seangkatan atau kating dengan jadwal barter yang pas.",
      },
      {
        icon: "school",
        iconClass: "text-amber-300",
        title: "Portfolio & Badges",
        desc: "Setiap sesi barter sukses tercatat sebagai kontribusi komunitas peer-tutor.",
      },
    ],
    testimonial: {
      initials: "RA",
      name: "Rizky Ananda",
      tag: "SI '21",
      meta: "Sistem Informasi",
      quote:
        "Dulu mentok di mata kuliah Basis Data Lanjutan, ketemu teman IF yang jago SQL lewat FilBuddy. Barter dengan bantu dia bikin UI aplikasi!",
    },
  },
  3: {
    badge: { icon: "flag", text: "Langkah Terakhir" },
    title: "Satu Klik Menuju Komunitas!",
    copy: "Periksa data pendaftaranmu, klaim saldo BuddyPoints, dan langsung masuk ke ekosistem barter skill terbesar di FILKOM.",
    features: [
      {
        icon: "mark_email_read",
        iconClass: "text-emerald-300",
        title: "Verifikasi Email Cepat",
        desc: "Tautan aktivasi dikirim ke email kampus @upiyptk.ac.id.",
      },
      {
        icon: "redeem",
        iconClass: "text-amber-300",
        title: "Saldo Awal Langsung Cair",
        desc: "Starter 100 poin + bonus per skill yang kamu tawarkan.",
      },
      {
        icon: "diversity_3",
        iconClass: "text-indigo-300",
        title: "Komunitas Anti-Judgment",
        desc: "Semua mahasiswa setara: saling mengajar, saling menguatkan.",
      },
    ],
    testimonial: {
      initials: "SA",
      name: "Sarah Azzahra",
      tag: "SI '23",
      meta: "Sistem Informasi",
      quote:
        "Udah barter 4x sesi Figma dengan teman IF, kebantu banget buat tugas besar!",
    },
  },
} as const;

export function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<RegisterData>(initialRegisterData);
  const { user, ready } = useStore();
  const router = useRouter();

  // Sudah login sejak awal? /register tidak relevan — redirect ke dashboard.
  // Step > 1 berarti registrasi sedang berjalan: user baru muncul dari
  // pendaftaran sendiri, jadi biarkan success screen tampil.
  useEffect(() => {
    if (ready && user && step === 1) router.replace("/dashboard");
  }, [ready, user, step, router]);

  const patch = (p: Partial<RegisterData>) => setData((d) => ({ ...d, ...p }));
  const panel = leftPanels[step];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              SSO Portal — Segera Hadir
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 mesh-gradient py-8 sm:py-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[640px] animate-[fade-up_0.7s_ease-out_both]">
          {/* Left: Marketing Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-[float_10s_ease-in-out_infinite]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-[float-reverse_12s_ease-in-out_infinite]" />

            <div className="relative z-10" key={step}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/10 text-xs font-semibold text-emerald-300 mb-6 animate-[fade-up_0.5s_ease-out_both]">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">
                  {panel.badge.icon}
                </span>
                {panel.badge.text}
              </div>

              <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-4 animate-[fade-up_0.5s_ease-out_both] [animation-delay:80ms]">
                {panel.title}
              </h2>
              <p className="font-body-md text-slate-300 text-sm leading-relaxed mb-6 animate-[fade-up_0.5s_ease-out_both] [animation-delay:160ms]">
                {panel.copy}
              </p>

              <div className="hidden sm:flex flex-col gap-3.5 border-t border-white/10 pt-6">
                {panel.features.map((f, i) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3.5 animate-[fade-up_0.5s_ease-out_both]"
                    style={{ animationDelay: `${240 + i * 100}ms` }}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 ${f.iconClass}`}>
                      <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-[15px] font-semibold text-white">{f.title}</p>
                      <p className="font-body-sm text-[13px] text-slate-400 leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-4 hidden lg:block">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-200 hover:bg-white/10">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-headline-sm font-bold text-white text-sm">
                      {panel.testimonial.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm font-semibold text-white text-sm">
                          {panel.testimonial.name}
                        </span>
                        <span className="font-label-code text-[11px] px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white">
                          {panel.testimonial.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-body-sm">
                        {panel.testimonial.meta}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-300 text-[14px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[16px] text-amber-300"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-body-sm italic text-slate-300 text-[13px] leading-relaxed">
                  &ldquo;{panel.testimonial.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form Steps */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <RegisterStepper current={step} />
            </div>

            {step === 1 && (
              <RegisterStep1 data={data} onChange={patch} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <RegisterStep2
                data={data}
                onChange={patch}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <RegisterStep3 data={data} onBack={() => setStep(2)} onEdit={(s) => setStep(s)} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FilBuddy © 2025</span>
            <span>•</span>
            <span>Fakultas Ilmu Komputer UPI YPTK Padang</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/pedoman" className="hover:text-indigo-600 transition-colors">Pedoman Komunitas</Link>
            <Link href="/bantuan" className="hover:text-indigo-600 transition-colors">Bantuan Teknis</Link>
            <Link href="/privasi" className="hover:text-indigo-600 transition-colors">Privasi Mahasiswa</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
