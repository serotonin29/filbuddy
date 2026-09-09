"use client";

import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";

export function DashboardStats() {
  const { user, slots } = useStore();
  if (!user) return null;

  const done = slots.filter((s) => s.status === "scheduled").length + user.sessionsDone;

  const stats = [
    {
      label: "Poin Aktif",
      icon: "bolt",
      value: `⚡ ${user.points} Pts`,
      sub: "Saldo BuddyPoints-mu",
      iconWrapClass: "bg-amber-50 text-amber-600 border-amber-200/60",
    },
    {
      label: "Jam Mengajar",
      icon: "schedule",
      value: `📚 ${user.teachingHours} Jam`,
      sub: `${user.teachSkills.length} skill ditawarkan`,
      iconWrapClass: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    },
    {
      label: "Sesi Selesai",
      icon: "task_alt",
      value: `✅ ${done}x Barter`,
      sub: "100% tepat waktu",
      iconWrapClass: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    },
    {
      label: "Karma Rating",
      icon: "star",
      value: `⭐ ${user.rating.toFixed(1)} / 5.0`,
      sub: `${user.ratingCount} ulasan positif`,
      iconWrapClass: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 90} className="h-full">
          <div className="h-full p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-ui text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {s.label}
              </span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${s.iconWrapClass}`}>
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              </div>
            </div>
            <span className="font-headline-lg text-xl sm:text-2xl font-extrabold text-slate-900">{s.value}</span>
            <span className="text-[11px] font-medium text-slate-500">{s.sub}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
