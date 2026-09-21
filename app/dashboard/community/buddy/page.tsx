"use client";

// ============================================================
// Find a Buddy — match personal + detail modal, tanpa vibe dating app
// ============================================================

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { circleById, type Buddy, type BuddyType } from "@/lib/communityData";
import { useStore } from "@/lib/store";
import { Avatar, CommunityHeader, CommunityNav, EmptyState } from "@/components/community/ui";

const MODES: { id: BuddyType; label: string; icon: string; hint: string }[] = [
  { id: "learning", label: "Belajar Bareng", icon: "menu_book", hint: "Temukan yang sedang menempuh skill yang sama" },
  { id: "project", label: "Partner Project", icon: "handyman", hint: "Cari rekan untuk tugas besar atau portfolio" },
  { id: "discussion", label: "Diskusi", icon: "forum", hint: "Ngobrol santai soal topik yang kamu suka" },
  { id: "random", label: "Kejutan", icon: "shuffle", hint: "Biarkan FilBuddy memilihkan buddy untukmu" },
];

const TYPE_CHIP: Record<BuddyType, string> = {
  learning: "bg-indigo-50 text-indigo-600 border-indigo-200",
  project: "bg-emerald-50 text-emerald-700 border-emerald-200",
  discussion: "bg-amber-50 text-amber-700 border-amber-200",
  random: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function BuddyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-20 flex justify-center">
          <span className="material-symbols-outlined text-3xl text-indigo-400 animate-spin">progress_activity</span>
        </div>
      }
    >
      <BuddyPageInner />
    </Suspense>
  );
}

function BuddyPageInner() {
  const { user } = useStore();
  const { buddies, circles, joinedCircles, hiSent, sendHi } = useCommunity();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");

  const [mode, setMode] = useState<BuddyType>("learning");
  const [cursor, setCursor] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(focusId);

  const pool = useMemo(() => buddies.filter((b) => b.buddyTypes.includes(mode)), [buddies, mode]);
  const buddy: Buddy | undefined = pool.length > 0 ? pool[cursor % pool.length] : undefined;
  const detail = buddies.find((b) => b.id === detailId) ?? null;

  const matchReasons = useMemo(() => {
    if (!buddy || !user) return [] as string[];
    const reasons: string[] = [];
    const learningNames = user.learnSkills.map((s) => s.name.toLowerCase());
    const knowsLower = buddy.knows.map((k) => k.toLowerCase());
    const overlapLearn = learningNames.filter((l) => knowsLower.some((k) => k.includes(l) || l.includes(k)));
    if (overlapLearn.length > 0) {
      reasons.push(`Sedang bisa ${overlapLearn.join(" & ")} — skill yang sedang kamu pelajari`);
    }
    const teachNames = user.teachSkills.map((s) => s.name.toLowerCase());
    const learningLower = buddy.learning.map((k) => k.toLowerCase());
    const overlapTeach = teachNames.filter((t) => learningLower.some((k) => k.includes(t) || t.includes(k)));
    if (overlapTeach.length > 0) {
      reasons.push(`Ingin belajar ${overlapTeach.join(" & ")} — kamu bisa membagikannya`);
    }
    const sharedCircles = buddy.circles.filter((cid) => joinedCircles[cid]);
    if (sharedCircles.length > 0) {
      reasons.push(`Sekcircle di ${sharedCircles.map((c) => circleById(c)?.name ?? c).join(" & ")}`);
    }
    const sharedInterests = buddy.interests.filter((i) => i.toLowerCase().includes("filkom") || user.teachSkills.some((t) => t.name.toLowerCase().includes(i.split(" ")[0].toLowerCase())));
    if (sharedInterests.length > 0) reasons.push(`Suka topik: ${sharedInterests.slice(0, 2).join(", ")}`);
    if (reasons.length === 0) reasons.push("Bukan dari prodi yang sama dengan mayoritas circle kamu — perspektif baru untuk diskusi");
    return reasons;
  }, [buddy, user, joinedCircles]);

  const switchMode = (m: BuddyType) => {
    setMode(m);
    setCursor(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4">
          <CommunityHeader subtitle="Temukan buddy yang cocok untuk belajar, project, atau diskusi — mulai dari satu sapaan." />
          <CommunityNav />
        </div>
      </Reveal>

      {/* Mode */}
      <Reveal>
        <section aria-label="Mode pencarian buddy" className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  aria-pressed={active}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "bg-white border-slate-200/90 text-slate-700 hover:border-indigo-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  <p className="mt-1 text-xs font-bold">{m.label}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">{MODES.find((m) => m.id === mode)?.hint}</p>
        </section>
      </Reveal>

      {/* Kartu match */}
      <Reveal>
        {buddy ? (
          <section aria-label="Saran buddy" className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-start gap-4">
              <Avatar name={buddy.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-headline-lg text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{buddy.name}</h2>
                <p className="font-label-code text-[11px] text-slate-400">
                  {buddy.prodi} · Semester {buddy.semester}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {buddy.buddyTypes.map((t) => (
                    <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TYPE_CHIP[t]}`}>
                      {MODES.find((m) => m.id === t)?.label ?? t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed italic">&ldquo;{buddy.goals}&rdquo;</p>

            {/* Alasan match */}
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
              <p className="font-label-code text-[10px] font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Kenapa dicocokkan
              </p>
              <ul className="space-y-1.5">
                {matchReasons.map((r) => (
                  <li key={r} className="text-xs text-indigo-900 flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-indigo-400 mt-0.5 shrink-0">check</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Circle", value: buddy.stats.joined + buddy.circles.length },
                { label: "Membantu", value: buddy.stats.helped },
                { label: "Project", value: buddy.stats.projects },
              ].map((s) => (
                <div key={s.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-headline-sm text-base font-extrabold text-slate-900">{s.value}</p>
                  <p className="font-label-code text-[9px] text-slate-400 uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => sendHi(buddy.id)}
                disabled={!!hiSent[buddy.id]}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  hiSent[buddy.id]
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/25"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{hiSent[buddy.id] ? "mark_email_read" : "waving_hand"}</span>
                {hiSent[buddy.id] ? "Hi terkirim — tunggu balasan" : "Say Hi"}
              </button>
              <button
                type="button"
                onClick={() => setDetailId(buddy.id)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Lihat Profil Lengkap
              </button>
              <button
                type="button"
                onClick={() => setCursor((c) => c + 1)}
                className="ml-auto px-4 py-2.5 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">shuffle</span>
                Buddy lain
              </button>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              {pool.length > 1 ? `Menampilkan ${((cursor % pool.length) + 1)} dari ${pool.length} buddy mode ini` : "Buddy mode ini baru satu — coba mode lain untuk pilihan lebih banyak"}
            </p>
          </section>
        ) : (
          <EmptyState
            icon="person_search"
            title="Belum ada match untuk mode ini"
            description="Semua buddy mode ini sudah kamu lihat, atau belum ada yang cocok sekarang. Coba mode lain — atau bagikan skill-mu supaya buddy menemukan kamu."
            action={
              <button
                type="button"
                onClick={() => switchMode("random")}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                Coba mode Kejutan
              </button>
            }
          />
        )}
      </Reveal>

      {/* Etika */}
      <Reveal>
        <p className="text-center text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
          Buddy matching di FilBuddy berbasis minat & skill — bukan penilaian popularitas. Mulailah dengan sopan, dan
          hormati kalau buddy sedang tidak tersedia.
        </p>
      </Reveal>

      {/* Modal detail */}
      {detail && <BuddyDetailModal buddy={detail} sharedCircleIds={detail.circles.filter((c) => joinedCircles[c])} onClose={() => setDetailId(null)} onHi={() => sendHi(detail.id)} hiSent={!!hiSent[detail.id]} totalCircles={circles.length} />}
    </div>
  );
}

function BuddyDetailModal({
  buddy,
  sharedCircleIds,
  onClose,
  onHi,
  hiSent,
}: {
  buddy: Buddy;
  sharedCircleIds: string[];
  onClose: () => void;
  onHi: () => void;
  hiSent: boolean;
  totalCircles: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`Profil ${buddy.name}`}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" />
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <h2 className="font-headline-sm text-base font-bold text-slate-900">Profil Buddy</h2>
          <button type="button" onClick={onClose} aria-label="Tutup modal" className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={buddy.name} size="lg" />
            <div>
              <p className="font-headline-lg text-lg font-extrabold text-slate-900">{buddy.name}</p>
              <p className="font-label-code text-[11px] text-slate-400">
                {buddy.prodi} · Semester {buddy.semester}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {buddy.buddyTypes.map((t) => (
                  <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TYPE_CHIP[t]}`}>
                    {MODES.find((m) => m.id === t)?.label ?? t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{buddy.goals}&rdquo;</p>

          {[
            { title: "Bisa membantu dengan", items: buddy.knows, accent: "emerald" },
            { title: "Sedang belajar", items: buddy.learning, accent: "indigo" },
            { title: "Minat", items: buddy.interests, accent: "slate" },
          ].map((sec) => (
            <div key={sec.title}>
              <p className="font-label-code text-[10px] text-slate-400 uppercase mb-1.5">{sec.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {sec.items.map((i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      sec.accent === "emerald"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : sec.accent === "indigo"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="font-label-code text-[10px] text-slate-400 uppercase mb-1.5">Circle yang diikuti</p>
            <div className="flex flex-wrap gap-1.5">
              {buddy.circles.map((cid) => {
                const c = circleById(cid);
                const shared = sharedCircleIds.includes(cid);
                return (
                  <span
                    key={cid}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      shared ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {c?.name ?? cid}
                    {shared ? " · sama" : ""}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={hiSent ? undefined : onHi}
            disabled={hiSent}
            className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              hiSent ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/25"
            }`}
          >
            {hiSent ? "👋 Hi sudah terkirim" : "👋 Say Hi untuk mulai percakapan"}
          </button>
        </div>
      </div>
    </div>
  );
}
