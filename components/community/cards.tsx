"use client";

// ============================================================
// Kartu-kartu Community: Circle, Skill Room, Event, Buddy mini
// ============================================================

import Link from "next/link";
import { useCommunity } from "@/lib/communityStore";
import {
  ROOM_STATUS_META,
  ROOM_TYPE_META,
  eventDateLabel,
  roomStatus,
  type Buddy,
  type Circle,
  type CommunityEvent,
  type SkillRoom,
} from "@/lib/communityData";
import { Avatar, AvatarStack } from "./ui";

const BUDDY_TYPE_LABEL: Record<Buddy["buddyTypes"][number], { label: string; chip: string }> = {
  learning: { label: "Belajar Bareng", chip: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  project: { label: "Partner Project", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  discussion: { label: "Diskusi", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  random: { label: "Kenalan Baru", chip: "bg-rose-50 text-rose-600 border-rose-200" },
};

export function CircleCard({ circle }: { circle: Circle }) {
  const { joinedCircles, toggleCircle } = useCommunity();
  const joined = !!joinedCircles[circle.id];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
      <Link href={`/dashboard/community/circles/${circle.id}`} className="block">
        <div className={`relative h-20 bg-gradient-to-br ${circle.gradient} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white/90 text-[34px]">{circle.icon}</span>
          {joined && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Joined
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/dashboard/community/circles/${circle.id}`} className="group">
          <h3 className="font-headline-sm text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {circle.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{circle.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {circle.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-400">group</span>
            {circle.members} member
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600 font-semibold">{circle.weeklyPosts} post/minggu</span>
          </span>
          <button
            type="button"
            onClick={() => toggleCircle(circle.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              joined
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
            }`}
          >
            {joined ? "✓ Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoomCard({ room }: { room: SkillRoom }) {
  const { joinedRooms } = useCommunity();
  const status = roomStatus(room, !!joinedRooms[room.id]);
  const meta = ROOM_STATUS_META[status];
  const count = room.participantNames.length;

  return (
    <Link
      href={`/dashboard/community/skill-rooms/${room.id}`}
      className="flex flex-col h-full p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROOM_TYPE_META[room.type].chip}`}>
          {ROOM_TYPE_META[room.type].label}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>
      <h3 className="font-headline-sm text-sm font-bold text-slate-900 leading-snug">{room.title}</h3>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
        <Avatar name={room.host} size="xs" />
        Host: <strong className="text-slate-700 font-semibold">{room.host}</strong>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
          {room.dayLabel}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-slate-400">sell</span>
          {room.skill} · {room.level}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AvatarStack names={room.participantNames} max={4} />
          <span className="text-[11px] font-label-code text-slate-500 shrink-0">{count} / {room.capacity}</span>
        </div>
        <span
          className={`text-[11px] font-bold shrink-0 ${
            status === "open" ? "text-indigo-600" : status === "almost" ? "text-amber-600" : status === "full" ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {joinedRooms[room.id] ? "Kamu ikut →" : "Lihat room →"}
        </span>
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: CommunityEvent }) {
  const { toggleSaveEvent, savedEvents } = useCommunity();
  const saved = !!savedEvents[event.id];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
      <div className={`relative h-24 bg-gradient-to-br ${event.gradient} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-white/90 text-[36px]">{event.icon}</span>
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-slate-700">
          {event.category}
        </span>
        <button
          type="button"
          aria-label={saved ? "Hapus dari tersimpan" : "Simpan event"}
          onClick={() => toggleSaveEvent(event.id)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            saved ? "bg-amber-400 text-white" : "bg-white/90 text-slate-500 hover:text-amber-500"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{saved ? "bookmark" : "bookmark_border"}</span>
        </button>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/dashboard/community/events/${event.id}`}>
          <h3 className="font-headline-sm text-sm font-bold text-slate-900 leading-snug hover:text-indigo-700 transition-colors">
            {event.name}
          </h3>
        </Link>
        <p className="mt-1 text-[11px] text-slate-500">oleh {event.organizer}</p>
        <div className="mt-2.5 flex flex-col gap-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_month</span>
            {eventDateLabel(event.inDays)} · {event.timeLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              {event.isOnline ? "videocam" : "location_on"}
            </span>
            {event.location}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-500">favorite</span>
            {event.interested} tertarik
          </span>
          <div className="flex items-center gap-1.5">
            <InterestedButton eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuddyMiniCard({ buddy }: { buddy: Buddy }) {
  const { hiSent, sendHi } = useCommunity();
  const sent = !!hiSent[buddy.id];
  const type = BUDDY_TYPE_LABEL[buddy.buddyTypes[0]];

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-start gap-3">
        <Avatar name={buddy.name} size="md" />
        <div className="min-w-0">
          <h3 className="font-headline-sm text-sm font-bold text-slate-900 truncate">{buddy.name}</h3>
          <p className="font-label-code text-[10px] text-slate-400">
            {buddy.prodi} · Semester {buddy.semester}
          </p>
        </div>
      </div>
      <span className={`mt-3 self-start px-2 py-0.5 rounded-full text-[10px] font-bold border ${type.chip}`}>
        {type.label}
      </span>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
        Sedang belajar: <strong className="text-slate-700 font-semibold">{buddy.learning.slice(0, 2).join(", ")}</strong>
      </p>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => sendHi(buddy.id)}
          disabled={sent}
          className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
            sent
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
          }`}
        >
          {sent ? "👋 Hi terkirim" : "👋 Say Hi"}
        </button>
        <Link
          href={`/dashboard/community/buddy?focus=${buddy.id}`}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Profil
        </Link>
      </div>
    </div>
  );
}

function InterestedButton({ eventId }: { eventId: string }) {
  const { eventStatus, setEventStatus } = useCommunity();
  const status = eventStatus[eventId];
  const interested = status === "interested";
  const going = status === "going";
  return (
    <button
      type="button"
      onClick={() => setEventStatus(eventId, going ? "interested" : interested ? null : "interested")}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
        interested
          ? "bg-amber-50 text-amber-700 border-amber-300"
          : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600"
      }`}
    >
      {going ? "✓ Ikut" : interested ? "★ Tertarik" : "☆ Tertarik"}
    </button>
  );
}
