"use client";

import { Reveal } from "@/components/Reveal";
import { useStore } from "@/lib/store";

export function RecentActivity() {
  const { activities } = useStore();

  return (
    <Reveal delay={200}>
      <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-headline-sm text-base font-bold text-slate-900">⚡ Aktivitas Terbaru</h3>
          <span className="material-symbols-outlined text-[18px] text-slate-400">history</span>
        </div>

        <div className="flex flex-col">
          {activities.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada aktivitas.</p>
          )}
          {activities.slice(0, 6).map((a, i) => (
            <div key={a.id} className={`flex items-start gap-3 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${a.iconClass}`}>
                <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-snug">
                  <strong className="font-headline-sm font-bold text-slate-900">{a.title}</strong>{" "}
                  <span className="text-slate-600">{a.desc}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-label-code">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
