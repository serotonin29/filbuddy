"use client";

// ============================================================
// Contribution Profile — dampak nyata user di FilBuddy + badges
// ============================================================

import { useMemo } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useStore, levelOf } from "@/lib/store";
import { useCommunity } from "@/lib/communityStore";
import { badgesOf } from "@/lib/communityData";
import { Avatar } from "@/components/community/ui";

export default function ProfilePage() {
  const store = useStore();
  const { user, questions, slots, activities } = store;
  const { circles, rooms, events, joinedCircles, joinedRooms, eventStatus } = useCommunity();

  const myCircles = useMemo(() => circles.filter((c) => joinedCircles[c.id]), [circles, joinedCircles]);
  const myRooms = useMemo(() => rooms.filter((r) => joinedRooms[r.id]), [rooms, joinedRooms]);
  const myEvents = useMemo(() => events.filter((e) => eventStatus[e.id] === "going"), [events, eventStatus]);
  const myPosts = useMemo(() => {
    const name = user?.name ?? "";
    return [
      ...questions.flatMap((q) =>
        q.answers
          .filter((a) => a.author === name)
          .map((a) => ({
            key: `a-${a.id}`,
            icon: "question_answer",
            iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
            title: `Menjawab "${q.title.slice(0, 48)}${q.title.length > 48 ? "…" : ""}"`,
            desc: a.accepted ? "Jawaban diterima sebagai solusi" : `${a.votes} vote membantu`,
            time: a.time,
          }))
      ),
      ...activities.slice(0, 4).map((a) => ({ key: `act-${a.id}`, icon: a.icon, iconClass: a.iconClass, title: a.title, desc: a.desc, time: a.time })),
      ...slots.slice(0, 3).map((s) => ({
        key: `slot-${s.id}`,
        icon: "swap_horiz",
        iconClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        title: s.status === "live" ? `Sesi live: ${s.title}` : `Slot barter: ${s.title}`,
        desc: `dengan ${s.partnerLabel}`,
        time: s.schedule,
      })),
    ].slice(0, 7);
  }, [user, questions, activities, slots]);

  if (!user) return null;

  const answeredCount = questions.reduce((n, q) => n + q.answers.filter((a) => a.author === user.name).length, 0);
  const level = levelOf(user.points);

  // Statistik dihitung dari aktivitas nyata — tanpa angka tampilan yang mengada-ada.
  const stats = {
    helped: answeredCount + user.teachingHours,
    hosted: rooms.filter((r) => r.host === user.name).length,
    joined: user.sessionsDone + myRooms.length + myEvents.length,
    answers: answeredCount,
    projects: slots.filter((s) => s.status !== "waiting" && s.partner !== "—").length,
    resources: myPosts.filter((p) => p.icon === "folder_open").length + Math.min(2, myCircles.length),
  };
  const badges = badgesOf(stats);
  const earnedBadges = badges.filter((b) => b.earned);
  const progressPct = Math.min(100, Math.round((user.points / level.next) * 100));

  const hasAnyActivity =
    answeredCount > 0 ||
    user.teachingHours > 0 ||
    user.sessionsDone > 0 ||
    myCircles.length > 0 ||
    myRooms.length > 0 ||
    myEvents.length > 0 ||
    slots.length > 0 ||
    activities.length > 0;

  const contributionStats = [
    { icon: "bolt", label: "Poin", value: user.points, accent: "text-amber-600 bg-amber-50 border-amber-200" },
    { icon: "history_edu", label: "Jam mengajar", value: user.teachingHours, accent: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { icon: "event_available", label: "Sesi selesai", value: user.sessionsDone, accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { icon: "question_answer", label: "Jawaban forum", value: answeredCount, accent: "text-violet-600 bg-violet-50 border-violet-200" },
    { icon: "diversity_3", label: "Circle diikuti", value: myCircles.length, accent: "text-sky-600 bg-sky-50 border-sky-200" },
    { icon: "cast_for_education", label: "Room diikuti", value: myRooms.length, accent: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header profil */}
      <Reveal>
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
              <p className="font-label-code text-[11px] text-slate-400">
                {user.nim} · {user.prodi} · {user.studyMode.toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  Lv.{level.level} {level.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">star</span>
                  {user.rating} ({user.ratingCount} ulasan)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  {earnedBadges.length} badge didapat
                </span>
              </div>
            </div>
          </div>

          {/* Progress level */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Progress ke Level {level.level + 1}</span>
              <span className="font-label-code">
                {user.points} / {level.next} pts
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-label-code text-[10px] text-slate-400 uppercase mb-1.5">Skill yang diajarkan</p>
              <div className="flex flex-wrap gap-1.5">
                {user.teachSkills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Belum ada — tambahkan di profil skill</span>
                ) : (
                  user.teachSkills.map((s) => (
                    <span key={s.name} className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
                      {s.name} · {s.level}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="font-label-code text-[10px] text-slate-400 uppercase mb-1.5">Skill yang dipelajari</p>
              <div className="flex flex-wrap gap-1.5">
                {user.learnSkills.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Belum ada — tambahkan di profil skill</span>
                ) : (
                  user.learnSkills.map((s) => (
                    <span key={s.name} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                      {s.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Statistik kontribusi */}
      <Reveal>
        <section aria-label="Statistik kontribusi">
          <h2 className="font-headline-sm text-base font-bold text-slate-900 mb-1">Kontribusi kamu</h2>
          <p className="text-[11px] text-slate-500 mb-3">
            Semua angka dihitung dari aktivitas nyata di FilBuddy — poin sambutan dari pendaftaran tidak dihitung sebagai kontribusi.
          </p>
          {!hasAnyActivity && (
            <p className="mb-3 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              Kamu punya saldo poin dari bonus pendaftaran, tapi belum ada kontribusi tercatat — itu normal. Mulai dari
              menjawab satu pertanyaan di forum, dan statistik di bawah akan ikut berkembang.
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {contributionStats.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2 ${s.accent}`}>
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </div>
                <p className="font-headline-lg text-xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Badges */}
      <Reveal>
        <section aria-label="Badge kontribusi" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-base font-bold text-slate-900">Badge</h2>
            <span className="font-label-code text-[10px] text-slate-400">
              {earnedBadges.length} / {badges.length} didapat
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  b.earned
                    ? "bg-white border-amber-200 shadow-xs"
                    : "bg-slate-50 border-slate-200/70 opacity-70"
                }`}
              >
                <span className={`text-2xl ${b.earned ? "" : "grayscale opacity-50"}`} aria-hidden>
                  {b.emoji}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${b.earned ? "text-slate-900" : "text-slate-500"}`}>{b.label}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{b.desc}</p>
                </div>
                {b.earned && <span className="material-symbols-outlined text-[18px] text-emerald-500 ml-auto shrink-0">check_circle</span>}
              </div>
            ))}
          </div>
          {earnedBadges.length === 0 && (
            <p className="text-xs text-slate-500 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5">
              💡 Mulai dari yang kecil: jawab 1 pertanyaan di forum, atau join 1 skill room — badge pertama kamu menyusul.
            </p>
          )}
        </section>
      </Reveal>

      {/* Timeline kontribusi */}
      <Reveal>
        <section aria-label="Kontribusi terbaru" className="space-y-3">
          <h2 className="font-headline-sm text-base font-bold text-slate-900">Kontribusi terbaru</h2>
          {myPosts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <p className="text-sm text-slate-500">
                Belum ada kontribusi tercatat. Coba{" "}
                <Link href="/dashboard/forum" className="font-bold text-indigo-600 hover:underline">
                  jawab pertanyaan di forum
                </Link>{" "}
                atau{" "}
                <Link href="/dashboard/community/circles" className="font-bold text-indigo-600 hover:underline">
                  join sebuah circle
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-0">
              {myPosts.map((p, i) => (
                <div key={p.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${p.iconClass}`}>
                      <span className="material-symbols-outlined text-[16px]">{p.icon}</span>
                    </div>
                    {i < myPosts.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" aria-hidden />}
                  </div>
                  <div className={`min-w-0 ${i === myPosts.length - 1 ? "pb-1" : "pb-4"}`}>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                    <p className="font-label-code text-[10px] text-slate-400 mt-0.5">{p.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Lainnya */}
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/community/buddy"
            className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-colors group"
          >
            <span className="material-symbols-outlined text-[22px] text-indigo-600">person_search</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-900">Find a Buddy</p>
              <p className="text-[11px] text-indigo-600">Perluas jaringan belajar kamu</p>
            </div>
            <span className="material-symbols-outlined text-indigo-400 group-hover:translate-x-0.5 transition-transform">chevron_right</span>
          </Link>
          <Link
            href="/dashboard/community"
            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-colors group"
          >
            <span className="material-symbols-outlined text-[22px] text-emerald-600">diversity_3</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">Kembali ke Community</p>
              <p className="text-[11px] text-emerald-600">Lihat aktivitas terbaru</p>
            </div>
            <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-0.5 transition-transform">chevron_right</span>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
