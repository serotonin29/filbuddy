"use client";

// ============================================================
// Community Home — For You: ringkasan seluruh aktivitas community
// ============================================================

import { useMemo } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import { circleById } from "@/lib/communityData";
import { CircleCard, EventCard, RoomCard, BuddyMiniCard } from "@/components/community/cards";
import { PostCard } from "@/components/community/PostCard";
import { CommunityHeader, CommunityNav, EmptyState, SectionHeader } from "@/components/community/ui";

export default function CommunityHomePage() {
  const { circles, rooms, events, posts, buddies, joinedCircles } = useCommunity();

  const myCircles = useMemo(() => circles.filter((c) => joinedCircles[c.id]), [circles, joinedCircles]);

  const happeningRooms = useMemo(
    () =>
      rooms
        .filter((r) => {
          const isOpen = r.participantNames.length < r.capacity;
          return isOpen && ["Hari ini", "Besok"].some((d) => r.dayLabel.startsWith(d));
        })
        .slice(0, 2),
    [rooms]
  );

  const upcomingEvents = useMemo(() => [...events].sort((a, b) => a.inDays - b.inDays).slice(0, 2), [events]);
  const latestPosts = useMemo(() => [...posts].sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, 4), [posts]);
  const newBuddies = useMemo(() => buddies.slice(0, 3), [buddies]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
      <Reveal>
        <div className="flex flex-col gap-4">
          <CommunityHeader subtitle="Learn, share, and grow together with FILKOM buddies." />
          <CommunityNav />
        </div>
      </Reveal>

      {/* Your Circles */}
      <Reveal>
        <section aria-labelledby="your-circles" className="space-y-4">
          <SectionHeader title="Circle kamu" action="Jelajahi semua" href="/dashboard/community/circles" />
          {myCircles.length === 0 ? (
            <EmptyState
              icon="diversity_3"
              title="Kamu belum join circle"
              description="Circle adalah tempat ngobrol, berbagi resource, dan saling membantu sesuai minat. Pilih yang paling cocok buat kamu."
              action={
                <Link
                  href="/dashboard/community/circles"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  Jelajahi Buddy Circles
                </Link>
              }
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {myCircles.map((c) => (
                <div key={c.id} className="w-64 shrink-0 sm:w-72">
                  <CircleCard circle={c} />
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Skill Rooms Happening */}
      <Reveal>
        <section aria-labelledby="rooms-happening" className="space-y-4">
          <SectionHeader title="Skill Rooms yang sedang berjalan" action="Semua rooms" href="/dashboard/community/skill-rooms" />
          {happeningRooms.length === 0 ? (
            <EmptyState
              icon="cast_for_education"
              title="Belum ada room terjadwal dekat"
              description="Cek daftar skill room lengkap, atau buat room sendiri dan ajak buddies belajar bareng."
              action={
                <Link
                  href="/dashboard/community/skill-rooms/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Buat Skill Room
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {happeningRooms.map((r) => (
                <RoomCard key={r.id} room={r} />
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Upcoming Events */}
      <Reveal>
        <section aria-labelledby="upcoming-events" className="space-y-4">
          <SectionHeader title="Event FILKOM terdekat" action="Semua event" href="/dashboard/community/events" />
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon="event_busy"
              title="Belum ada event terjadwal"
              description="Panitia sedang menyiapkan agenda berikutnya. Sambil menunggu, cek skill room yang buka, yuk."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Community Activity */}
      <Reveal>
        <section aria-labelledby="community-activity" className="space-y-4">
          <SectionHeader title="Aktivitas community" action="Circle kamu" href="/dashboard/community/circles" />
          <div className="space-y-4">
            {latestPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                showCircleName
                circleName={circleById(p.circleId)?.name}
              />
            ))}
          </div>
        </section>
      </Reveal>

      {/* Meet New Buddies */}
      <Reveal>
        <section aria-labelledby="meet-buddies" className="space-y-4">
          <SectionHeader title="Kenalan dengan buddy baru" action="Cari buddy" href="/dashboard/community/buddy" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newBuddies.map((b) => (
              <BuddyMiniCard key={b.id} buddy={b} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* CTA Find a Buddy */}
      <Reveal>
        <section aria-labelledby="find-buddy-cta">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-10 text-white">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
            <div className="relative max-w-lg">
              <h2 className="font-headline-lg text-xl sm:text-2xl font-extrabold tracking-tight">
                Belajar itu lebih seru bareng buddy
              </h2>
              <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
                Temukan buddy yang cocok buat belajar bareng, ngerjain project, atau sekadar diskusi. Mulai dari satu
                &ldquo;Hi&rdquo; saja.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/community/buddy"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 shadow-lg shadow-indigo-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_search</span>
                  Find a Buddy
                </Link>
                <Link
                  href="/dashboard/community/skill-rooms/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/25 text-white text-sm font-bold hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Buat Skill Room
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
