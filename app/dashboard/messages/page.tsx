"use client";

// ============================================================
// Messages — inbox, thread, permintaan pesan, blokir/bisukan/lapor
// ============================================================

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMessages } from "@/lib/messagesStore";
import { useStore } from "@/lib/store";
import { avatarColor, initialsOf2 } from "@/lib/communityData";
import { ReportDialog } from "@/components/community/ReportDialog";

function PageInner() {
  const { user } = useStore();
  const params = useSearchParams();
  const activeParam = params.get("thread");
  const { threads, totalUnread, requests, send, accept, markRead, markAllRead, toggleMute, toggleBlock, report } = useMessages();
  const [tab, setTab] = useState<"semua" | "permintaan">("semua");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (tab === "permintaan" ? threads.filter((t) => t.status === "request") : threads),
    [threads, tab]
  );

  const active = useMemo(() => threads.find((t) => t.id === (activeId ?? activeParam)) ?? null, [threads, activeId, activeParam]);

  useEffect(() => {
    if (activeParam) {
      setActiveId(activeParam);
      markRead(activeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParam]);

  useEffect(() => {
    if (active) markRead(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [active?.msgs.length, active?.id]);

  const submit = () => {
    const content = draft.trim();
    if (!content || !active || active.blocked || active.status === "request") return;
    send(active.id, content);
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pesan</h1>
          <p className="mt-1 text-sm text-slate-600">
            Koordinasi dengan buddy, partner barter, dan anggota room.
            {totalUnread > 0 && <span className="ml-1.5 font-bold text-indigo-600">{totalUnread} belum dibaca</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          Tandai semua dibaca
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(
          [
            { id: "semua", label: "Semua" },
            { id: "permintaan", label: `Permintaan${requests > 0 ? ` (${requests})` : ""}` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              tab === t.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        {/* Inbox */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {visible.length === 0 ? (
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300">forum</span>
              <p className="mt-2 text-sm font-bold text-slate-700">{tab === "permintaan" ? "Tidak ada permintaan pesan" : "Belum ada percakapan"}</p>
              <p className="mt-1 text-xs text-slate-500">
                Mulai kenalan lewat <Link href="/dashboard/community/buddy" className="text-indigo-600 font-semibold hover:underline">Find a Buddy</Link> — tombol Say Hi otomatis membuka pesan.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {visible.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(t.id);
                      markRead(t.id);
                    }}
                    className={`w-full text-left flex items-start gap-3 p-3.5 transition-colors ${active?.id === t.id ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${avatarColor(t.person)} text-white flex items-center justify-center font-headline-sm text-sm font-bold shrink-0`}>
                      {initialsOf2(t.person)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{t.person}</p>
                        {t.unread > 0 && !t.muted && (
                          <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {t.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {t.status === "request" ? "⚠️ Ingin memulai percakapan" : t.blocked ? "Diblokir" : t.msgs[t.msgs.length - 1]?.content}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-label-code text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 truncate max-w-full">
                        {t.contextLabel}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thread */}
        {!active ? (
          <div className="hidden lg:flex rounded-2xl border border-dashed border-slate-300 bg-white/60 min-h-[420px] flex-col items-center justify-center text-center p-8">
            <span className="material-symbols-outlined text-5xl text-slate-300">chat</span>
            <p className="mt-3 text-sm font-bold text-slate-700">Pilih percakapan</p>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">Percakapan dari Say Hi, barter slot, dan room akan muncul di sini dengan konteksnya.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white flex flex-col min-h-[420px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-3.5 border-b border-slate-100">
              <div className={`w-10 h-10 rounded-xl ${avatarColor(active.person)} text-white flex items-center justify-center font-headline-sm text-sm font-bold`}>
                {initialsOf2(active.person)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{active.person}</p>
                {active.contextHref ? (
                  <Link href={active.contextHref} className="text-[11px] text-indigo-600 font-semibold hover:underline truncate block">
                    {active.contextLabel}
                  </Link>
                ) : (
                  <span className="text-[11px] text-slate-400 truncate block">{active.contextLabel}</span>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Menu percakapan"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((m) => !m)}
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-20">
                    <button type="button" onClick={() => { toggleMute(active.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                      {active.muted ? "🔓 Aktifkan notifikasi" : "🔇 Bisukan percakapan"}
                    </button>
                    <button type="button" onClick={() => { setReportFor(active.person); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-700 hover:bg-amber-50">
                      🚩 Lapor percakapan
                    </button>
                    <button type="button" onClick={() => { toggleBlock(active.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50">
                      {active.blocked ? "Buka blokir" : "🚫 Blokir pengguna"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {active.reported && (
              <div className="mx-3.5 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Laporan <span className="font-label-code font-bold">{active.reported}</span> terkirim — moderator akan meninjau.
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 max-h-[380px]">
              {active.msgs.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      m.mine ? "bg-indigo-600 text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {!m.mine && <p className="text-[10px] font-bold text-slate-500 mb-0.5">{m.author}</p>}
                    {m.content}
                    <span className={`block mt-0.5 text-[10px] ${m.mine ? "text-indigo-200" : "text-slate-400"}`}>{m.time}</span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Composer / state */}
            {active.blocked ? (
              <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Kamu memblokir {active.person} — pesan tidak dapat dikirim.</p>
                <button type="button" onClick={() => toggleBlock(active.id)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  Buka blokir
                </button>
              </div>
            ) : active.status === "request" ? (
              <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Permintaan pesan — {active.person} tidak melihat balasanmu sampai kamu menerima.</p>
                <button type="button" onClick={() => accept(active.id)} className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
                  Terima percakapan
                </button>
              </div>
            ) : (
              <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  aria-label={`Kirim pesan ke ${active.person}`}
                  placeholder="Tulis pesan…"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={!draft.trim()}
                  aria-label="Kirim pesan"
                  className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {reportFor && active && (
        <ReportDialog
          title={`Percakapan dengan ${reportFor}`}
          onClose={() => setReportFor(null)}
          onSubmit={(_reason, _detail, ref) => report(active.id, ref)}
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
