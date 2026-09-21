"use client";

// ============================================================
// Skill Room Detail — join/leave/full/finished, topik, resource, diskusi, feedback
// ============================================================

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import {
  ROOM_TYPE_META,
  ROOM_STATUS_META,
  roomStatus,
  meetStateOf,
  formatSessionAt,
  minutesUntil,
  generateMeetCode,
  downloadIcs,
} from "@/lib/communityData";
import { Avatar, AvatarStack, EmptyState } from "@/components/community/ui";
import { useStore } from "@/lib/store";

const KIND_ICON: Record<string, string> = {
  pdf: "picture_as_pdf",
  link: "link",
  video: "smart_display",
  repo: "code_blocks",
};

const MEET_CHIP: Record<string, string> = {
  belum: "bg-slate-100 text-slate-600 border-slate-200",
  hampir: "bg-amber-50 text-amber-700 border-amber-200",
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  selesai: "bg-slate-100 text-slate-500 border-slate-200",
  "tanpa-link": "bg-slate-100 text-slate-500 border-slate-200",
};

function MEET_LABEL(state: string, minutes: number): string {
  if (state === "live") return "SEDANG BERLANGSUNG";
  if (state === "hampir") return `MULAI ${minutes} MENIT LAGI`;
  if (state === "selesai") return "SESI SELESAI";
  if (state === "belum") return `J-${Math.ceil(minutes / 60)} JAM`;
  return "BELUM ADA LINK";
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useStore();
  const myName = user?.name ?? "Kamu";
  const { rooms, joinedRooms, joinRoom, leaveRoom, addRoomMessage, savedResources, toggleSaveResource, roomFeedback, submitRoomFeedback, setRoomMeet } = useCommunity();
  const [tab, setTab] = useState<"topics" | "discussion">("topics");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [stars, setStars] = useState(0);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Perbarui jam tiap 30 detik supaya status Meet akurat.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const room = rooms.find((r) => r.id === params.id);
  const joined = room ? !!joinedRooms[room.id] : false;
  const status = room ? roomStatus(room, joined) : "open";
  const meta = room ? ROOM_STATUS_META[status] : null;
  const count = room?.participantNames.length ?? 0;
  const pct = room ? Math.min(100, Math.round((count / room.capacity) * 100)) : 0;
  const feedbackGiven = room ? !!roomFeedback[room.id] : false;

  const discussion = useMemo(() => (room ? [...room.discussion].sort((a, b) => a.minutesAgo - b.minutesAgo) : []), [room]);

  const isHost = room ? room.host === myName : false;
  const meet = useMemo(() => {
    if (!room) return { state: "tanpa-link" as const, minutes: 0, canJoin: false };
    const state = meetStateOf(room, now);
    return {
      state,
      minutes: room.sessionAt ? minutesUntil(room.sessionAt, now) : 0,
      canJoin: state === "hampir" || state === "live",
    };
  }, [room, now]);

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <EmptyState
          icon="wrong_location"
          title="Room tidak ditemukan"
          description="Room ini mungkin sudah ditutup. Cek daftar skill room lain yang masih buka."
          action={
            <Link
              href="/dashboard/community/skill-rooms"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Skill Rooms
            </Link>
          }
        />
      </div>
    );
  }

  const sendDiscussion = () => {
    const content = draft.trim();
    if (!content) return;
    addRoomMessage(room.id, content, myName);
    setDraft("");
    setNotice("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Reveal>
        <button
          type="button"
          onClick={() => router.push("/dashboard/community/skill-rooms")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Semua Skill Rooms
        </button>
      </Reveal>

      <Reveal>
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROOM_TYPE_META[room.type].chip}`}>
                  {ROOM_TYPE_META[room.type].label}
                </span>
                {meta && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-headline-lg text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {room.title}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-xl">{room.description}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Avatar name={room.host} size="sm" />
              <div className="min-w-0">
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Host</p>
                <p className="text-xs font-bold text-slate-800 truncate">{room.host}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
              <div>
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Jadwal</p>
                <p className="text-xs font-bold text-slate-800">{room.dayLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-slate-400">sell</span>
              <div>
                <p className="font-label-code text-[9px] text-slate-400 uppercase">Level</p>
                <p className="text-xs font-bold text-slate-800">{room.skill} · {room.level}</p>
              </div>
            </div>
          </div>

          {/* Kapasitas */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <AvatarStack names={room.participantNames} max={4} />
                {count} / {room.capacity} peserta
              </span>
              <span className="font-label-code">{pct}% terisi</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  status === "full" ? "bg-rose-400" : status === "almost" ? "bg-amber-400" : "bg-indigo-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Kesiapan sesi / Google Meet */}
          {room.sessionAt && room.mode !== "offline" && (
            <div className={`mt-4 p-4 rounded-2xl border ${meet.state === "live" ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-slate-50/70"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${meet.state === "live" ? "text-emerald-700" : "text-slate-700"}`}>
                    <span className="material-symbols-outlined text-[16px]">videocam</span>
                    Google Meet · {room.mode === "hybrid" ? "Hybrid" : "Online"}
                    {room.recurring === "mingguan" && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-label-code text-[9px] font-bold border border-indigo-200">
                        MINGGUAN
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatSessionAt(room.sessionAt)} · {room.durationMin ?? 60} menit
                    {room.location ? ` · ${room.location}` : ""}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${MEET_CHIP[meet.state]}`}>
                  {MEET_LABEL(meet.state, meet.minutes)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {room.meetLink ? (
                  <>
                    {meet.canJoin ? (
                      <a
                        href={room.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">videocam_on</span>
                        Join Google Meet
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed">
                        <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                        Buka 10 menit sebelum sesi
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          void navigator.clipboard.writeText(room.meetLink!);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } catch {
                          /* clipboard tidak tersedia */
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      {copied ? "Link tersalin!" : "Salin link"}
                    </button>
                  </>
                ) : isHost ? (
                  <button
                    type="button"
                    onClick={() => setRoomMeet(room.id, `https://meet.google.com/${generateMeetCode()}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_link</span>
                    Tautkan Google Meet
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">hourglass_top</span>
                    Host belum menautkan link Meet — nanti muncul di sini.
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => downloadIcs({ ...room })}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  Simpan ke kalender
                </button>
              </div>
            </div>
          )}

          {/* Aksi */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {joined ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Kamu tergabung
                </span>
                <button
                  type="button"
                  onClick={() => leaveRoom(room.id, myName)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Keluar dari room
                </button>
              </>
            ) : status === "full" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">block</span>
                Room penuh — lihat room lain atau buat sendiri
              </span>
            ) : status === "finished" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Sesi sudah selesai — resource tetap bisa diakses
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const res = joinRoom(room.id, myName);
                  if (!res.ok) setNotice(res.error ?? "");
                  else setNotice("");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                Gabung Room
              </button>
            )}
          </div>
          {notice && (
            <p className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {notice}
            </p>
          )}
        </div>
      </Reveal>

      {/* Tabs */}
      <Reveal>
        <div className="flex items-center gap-1 border-b border-slate-200">
          {(["topics", "discussion"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "topics" ? "Topik & Resource" : `Diskusi (${discussion.length})`}
            </button>
          ))}
        </div>
      </Reveal>

      {tab === "topics" && (
        <section className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h2 className="font-headline-sm text-sm font-bold text-slate-900 mb-3">Topik yang dibahas</h2>
            <div className="flex flex-wrap gap-1.5">
              {room.topics.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h2 className="font-headline-sm text-sm font-bold text-slate-900 mb-3">Resource</h2>
            {room.resources.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Host biasanya membagikan resource setelah sesi pertama.</p>
            ) : (
              <div className="space-y-2.5">
                {room.resources.map((r) => {
                  const saved = !!savedResources[r.id];
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="material-symbols-outlined text-[20px] text-slate-500">{KIND_ICON[r.kind] ?? "link"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-400">oleh {r.by}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={saved ? "Hapus dari simpanan" : "Simpan resource"}
                        onClick={() => toggleSaveResource(r.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          saved ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{saved ? "bookmark" : "bookmark_border"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback untuk sesi selesai */}
          {(status === "finished" || room.finished) && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <h2 className="font-headline-sm text-sm font-bold text-amber-900">Beri feedback sesi ini</h2>
              <p className="mt-1 text-xs text-amber-700">Feedback membantu host memperbaiki sesi berikutnya.</p>
              {feedbackGiven ? (
                <p className="mt-3 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Terima kasih, feedback kamu terkirim!
                </p>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating bintang">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={stars === n}
                        aria-label={`${n} bintang`}
                        onClick={() => setStars(n)}
                        className={`text-[22px] transition-transform hover:scale-110 ${n <= stars ? "text-amber-500" : "text-amber-200"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={stars === 0}
                    onClick={() => submitRoomFeedback(room.id)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold disabled:opacity-40 hover:bg-amber-600 transition-colors"
                  >
                    Kirim feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {tab === "discussion" && (
        <section className="space-y-4">
          {joined ? (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <Avatar name={myName} size="sm" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendDiscussion()}
                placeholder="Tanya host atau sapa peserta lain..."
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={sendDiscussion}
                disabled={!draft.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                Kirim
              </button>
            </div>
          ) : (
            <p className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-600 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-400">lock</span>
              Gabung room dulu untuk ikut diskusi.
            </p>
          )}
          {discussion.length === 0 ? (
            <EmptyState icon="forum" title="Diskusi masih sepi" description="Mulai percakapan — sapa peserta lain atau tanya apa yang akan dibahas di sesi pertama." />
          ) : (
            discussion.map((d) => (
              <div key={d.id} className="flex items-start gap-3">
                <Avatar name={d.author} size="sm" />
                <div className="min-w-0 flex-1 bg-white rounded-2xl rounded-tl-md border border-slate-200/90 shadow-xs px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{d.author}</span>
                    <span className="font-label-code text-[9px] text-slate-400">{d.prodi}</span>
                    {d.minutesAgo === 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-label-code text-[9px] font-bold border border-indigo-200">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{d.content}</p>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
