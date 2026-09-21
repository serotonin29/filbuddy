"use client";

// ============================================================
// Circle Detail — feed, resource, event, member + composer post
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { roomById, type CircleResource } from "@/lib/communityData";
import { PostCard } from "@/components/community/PostCard";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { Avatar, AvatarStack, EmptyState } from "@/components/community/ui";
import { useStore } from "@/lib/store";

const TABS = [
  { id: "feed", label: "Feed", icon: "forum" },
  { id: "resources", label: "Resource", icon: "folder_open" },
  { id: "events", label: "Event", icon: "event" },
  { id: "members", label: "Member", icon: "group" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const KIND_ICON: Record<CircleResource["kind"], string> = {
  pdf: "picture_as_pdf",
  link: "link",
  video: "smart_display",
  repo: "code_blocks",
};

export default function CircleDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useStore();
  const { circles, posts, rooms, joinedCircles, toggleCircle, savedResources, toggleSaveResource } = useCommunity();
  const [tab, setTab] = useState<TabId>("feed");
  const [composerOpen, setComposerOpen] = useState(false);

  const circle = circles.find((c) => c.id === params.slug);

  const circlePosts = useMemo(
    () =>
      posts
        .filter((p) => p.circleId === params.slug)
        .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || a.minutesAgo - b.minutesAgo),
    [posts, params.slug]
  );

  const activeRoom = circle?.activeRoomId ? rooms.find((r) => r.id === circle.activeRoomId) ?? roomById(circle.activeRoomId) : undefined;

  if (!circle) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <EmptyState
          icon="wrong_location"
          title="Circle tidak ditemukan"
          description="Circle ini mungkin sudah diarsipkan atau tautan salah. Coba jelajahi daftar circle yang aktif."
          action={
            <Link
              href="/dashboard/community/circles"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Circles
            </Link>
          }
        />
      </div>
    );
  }

  const joined = !!joinedCircles[circle.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Reveal>
        <button
          type="button"
          onClick={() => router.push("/dashboard/community/circles")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Semua Circles
        </button>
      </Reveal>

      {/* Cover */}
      <Reveal>
        <div className="rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xs">
          <div className={`relative h-28 sm:h-36 bg-gradient-to-br ${circle.gradient} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white/90 text-[52px]">{circle.icon}</span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {circle.name}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-xl">{circle.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {circle.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleCircle(circle.id)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  joined
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/25"
                }`}
              >
                {joined ? "✓ Joined" : "Join Circle"}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                <strong className="text-slate-700">{circle.members}</strong> member
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">forum</span>
                <strong className="text-slate-700">{circle.weeklyPosts}</strong> post/minggu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">shield</span>
                Moderasi:{" "}
                {circle.memberNames
                  .filter((m) => m.moderator)
                  .map((m) => m.name)
                  .join(", ")}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Active room banner */}
      {activeRoom && (
        <Reveal>
          <Link
            href={`/dashboard/community/skill-rooms/${activeRoom.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-colors group"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">cast_for_education</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold font-label-code text-indigo-500 uppercase">Skill room aktif di circle ini</p>
              <p className="text-sm font-bold text-indigo-900 truncate group-hover:underline">{activeRoom.title}</p>
              <p className="text-[11px] text-indigo-600">{activeRoom.dayLabel} · {activeRoom.participantNames.length}/{activeRoom.capacity} peserta</p>
            </div>
            <span className="material-symbols-outlined text-indigo-400">chevron_right</span>
          </Link>
        </Reveal>
      )}

      {/* Tabs */}
      <Reveal>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Tab content */}
      {tab === "feed" && (
        <section className="space-y-4">
          {joined ? (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all text-left"
            >
              <Avatar name={user?.name ?? "Kamu"} size="sm" />
              <span className="flex-1 text-sm text-slate-400">Bagikan sesuatu ke {circle.name}...</span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">Buat Post</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-600 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-slate-400">lock</span>
              Join circle ini dulu untuk posting dan ikut diskusi.
              <button
                type="button"
                onClick={() => toggleCircle(circle.id)}
                className="ml-auto shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Join
              </button>
            </div>
          )}
          {circlePosts.length === 0 ? (
            <EmptyState
              icon="forum"
              title="Feed masih kosong"
              description="Jadilah yang pertama berbagi — tanya, share resource, atau cari buddy belajar di circle ini."
              action={
                joined ? (
                  <button
                    type="button"
                    onClick={() => setComposerOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Buat Post Pertama
                  </button>
                ) : undefined
              }
            />
          ) : (
            circlePosts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </section>
      )}

      {tab === "resources" && (
        <section className="space-y-3">
          {circle.resources.length === 0 ? (
            <EmptyState icon="folder_off" title="Belum ada resource" description="Resource seperti catatan, slide, atau repo akan muncul di sini setelah dibagikan member." />
          ) : (
            circle.resources.map((r) => {
              const saved = !!savedResources[r.id];
              return (
                <div key={r.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{KIND_ICON[r.kind]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{r.title}</p>
                    <p className="text-[11px] text-slate-400">dibagikan oleh {r.by}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={saved ? "Hapus dari simpanan" : "Simpan resource"}
                    onClick={() => toggleSaveResource(r.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      saved ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{saved ? "bookmark" : "bookmark_border"}</span>
                  </button>
                </div>
              );
            })
          )}
        </section>
      )}

      {tab === "events" && (
        <section className="space-y-3">
          {circle.events.length === 0 ? (
            <EmptyState icon="event_busy" title="Belum ada event circle" description="Agenda khusus circle ini akan tampil di sini. Pantau juga tab Events untuk event FILKOM antar-circle." />
          ) : (
            circle.events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">{e.mode === "Online" ? "videocam" : "location_on"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{e.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {e.dateLabel} · {e.mode}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </div>
            ))
          )}
        </section>
      )}

      {tab === "members" && (
        <section className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
            <AvatarStack names={circle.memberNames.map((m) => m.name)} max={6} />
            <p className="text-xs text-indigo-800">
              <strong className="font-bold">{circle.members}</strong> member aktif — sebagian besar dari {circle.memberNames[0]?.prodi ?? "IF"}.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {circle.memberNames.map((m) => (
              <div key={m.name} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <Avatar name={m.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {m.name}
                    {m.moderator && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-code text-[9px] font-bold border border-emerald-200">
                        <span className="material-symbols-outlined text-[10px]">shield</span> MOD
                      </span>
                    )}
                  </p>
                  <p className="font-label-code text-[10px] text-slate-400">{m.prodi}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <CreatePostModal open={composerOpen} circleId={circle.id} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
