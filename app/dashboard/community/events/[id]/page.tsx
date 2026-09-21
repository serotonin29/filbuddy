"use client";

// ============================================================
// Event Detail — poster, aksi Interested/Going/Save, buddies going
// ============================================================

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { eventDateLabel } from "@/lib/communityData";
import { Avatar, AvatarStack, EmptyState } from "@/components/community/ui";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { events, eventStatus, setEventStatus, savedEvents, toggleSaveEvent } = useCommunity();

  const event = events.find((e) => e.id === params.id);
  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <EmptyState
          icon="event_busy"
          title="Event tidak ditemukan"
          description="Event ini mungkin sudah berlalu atau tautannya salah."
          action={
            <Link
              href="/dashboard/community/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Events
            </Link>
          }
        />
      </div>
    );
  }

  const status = eventStatus[event.id];
  const interested = status === "interested";
  const going = status === "going";
  const saved = !!savedEvents[event.id];
  const happeningToday = event.inDays === 0;
  const quota = event.capacity;
  const quotaFull = quota !== undefined && event.goingNames.length >= quota && !going;
  const quotaLeft = quota !== undefined ? Math.max(0, quota - event.goingNames.length) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Reveal>
        <button
          type="button"
          onClick={() => router.push("/dashboard/community/events")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Semua Events
        </button>
      </Reveal>

      {/* Poster */}
      <Reveal>
        <div className={`relative h-40 sm:h-52 rounded-3xl bg-gradient-to-br ${event.gradient} overflow-hidden flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white/90 text-[72px]">{event.icon}</span>
          <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold text-slate-700">
            {event.category}
          </span>
          {happeningToday && (
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Hari ini
            </span>
          )}
          <button
            type="button"
            aria-label={saved ? "Hapus dari simpanan" : "Simpan event"}
            onClick={() => toggleSaveEvent(event.id)}
            className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              saved ? "bg-amber-400 text-white" : "bg-white/90 text-slate-500 hover:text-amber-500"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{saved ? "bookmark" : "bookmark_border"}</span>
          </button>
        </div>
      </Reveal>

      <Reveal>
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{event.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Diselenggarakan oleh {event.organizer}</p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-400">calendar_month</span>
              <div>
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Tanggal</p>
                <p className="text-xs font-bold text-slate-800">{eventDateLabel(event.inDays)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[20px] text-slate-400">schedule</span>
              <div>
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Waktu</p>
                <p className="text-xs font-bold text-slate-800">{event.timeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                {event.isOnline ? "videocam" : "location_on"}
              </span>
              <div className="min-w-0">
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Lokasi</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {event.location}
                  {event.isOnline && " — tautan dikirim ke peserta terdaftar"}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed">{event.description}</p>

          {/* Kuota */}
          {quota !== undefined && (
            <div className={`mt-4 p-3.5 rounded-xl border text-xs ${quotaFull ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">{quotaFull ? "group_off" : "groups"}</span>
                  Kuota peserta: {event.goingNames.length} / {quota}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${quotaFull ? "bg-rose-100 border-rose-300" : "bg-white border-slate-200"}`}>
                  {quotaFull ? "PENUH" : `sisa ${quotaLeft} tempat`}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${quotaFull ? "bg-rose-500" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(100, Math.round((event.goingNames.length / quota) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Aksi */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {quotaFull ? (
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">block</span>
                Kuota penuh — coba event lain
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setEventStatus(event.id, going ? "interested" : "going")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  going
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/25"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/25"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{going ? "check_circle" : "event_available"}</span>
                {going ? "✓ Kamu ikut event ini" : "Ikut Event"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setEventStatus(event.id, interested ? null : "interested")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                interested ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{interested ? "star" : "star_border"}</span>
              {interested ? "Tertarik" : "Tandai Tertarik"}
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
              <span className="material-symbols-outlined text-[14px] text-amber-500">favorite</span>
              {event.interested} orang tertarik
            </span>
          </div>
        </div>
      </Reveal>

      {/* Buddies going */}
      <Reveal>
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-headline-sm text-base font-bold text-slate-900">Buddies yang ikut</h2>
            <AvatarStack names={event.goingNames} max={5} />
          </div>
          {goingNamesHelper(event, going)}
          <p className="mt-3 text-xs text-slate-500">
            {!going
              ? "Ikut event ini biar kamu muncul di daftar, lalu kenalan sebelum acara dimulai."
              : "Say hi ke mereka sebelum acara — datang bareng bikin lebih nyaman."}
          </p>
          <Link
            href="/dashboard/community/buddy"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span className="material-symbols-outlined text-[16px]">person_search</span>
            Cari buddy buat nemenin
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function goingNamesHelper(event: { goingNames: string[] }, going: boolean) {
  if (event.goingNames.length === 0 && !going) {
    return <p className="mt-2 text-sm text-slate-400 italic">Belum ada yang mendaftar — jadilah yang pertama!</p>;
  }
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {event.goingNames.slice(0, 6).map((n) => (
        <div key={n} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <Avatar name={n} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{n}</p>
            <p className="font-label-code text-[9px] text-slate-400">peserta</p>
          </div>
        </div>
      ))}
    </div>
  );
}
