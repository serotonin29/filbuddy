"use client";

// ============================================================
// SearchCommand — pencarian global lintas entitas:
// skill/buddy, forum, circle, room, event. Recent search,
// loading, no-result, reset, ⌘K, a11y combobox.
// Hanya SATU input di DOM: desktop inline, mobile overlay.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { SEED_BUDDIES, SEED_CIRCLES, SEED_ROOMS, SEED_EVENTS } from "@/lib/communityData";

type Hit = { kind: string; icon: string; label: string; sub: string; href: string };

const LS_RECENT = "filbuddy-recent-search";

function tokenize(s: string) {
  return s.toLowerCase().split(/[^a-z0-9+]+/i).filter(Boolean);
}

function useMediaQuery(mq: string) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia(mq);
    const fn = () => setOk(m.matches);
    fn();
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, [mq]);
  return ok;
}

export function useGlobalSearch(query: string): Hit[] {
  const { questions } = useStore();
  const q = query.trim().toLowerCase();
  return useMemo(() => {
    if (q.length < 2) return [];
    const tokens = tokenize(q);
    const match = (text: string) => {
      const t = text.toLowerCase();
      return tokens.every((tok) => t.includes(tok));
    };
    const hits: Hit[] = [];

    for (const b of SEED_BUDDIES) {
      const skills = [...b.knows, ...b.learning].join(" ");
      if (match(b.name) || match(skills)) {
        hits.push({
          kind: "Buddy",
          icon: "person",
          label: b.name,
          sub: `${b.knows.join(", ")} · ${b.prodi} · Sem ${b.semester}`,
          href: `/dashboard/community/buddy?focus=${b.id}`,
        });
      }
    }

    for (const qst of questions) {
      if (match(qst.title) || match(qst.tags.join(" ")) || match(qst.excerpt)) {
        hits.push({
          kind: "Forum",
          icon: "forum",
          label: qst.title,
          sub: `${qst.category} · ${qst.answers.length} jawaban${qst.reward ? ` · ⚡ ${qst.reward} Pts` : ""}`,
          href: `/dashboard/forum?q=${encodeURIComponent(qst.title)}`,
        });
      }
    }

    for (const c of SEED_CIRCLES) {
      if (match(c.name) || match(c.tags.join(" ")) || match(c.description)) {
        hits.push({ kind: "Circle", icon: "diversity_3", label: c.name, sub: `${c.members} anggota · ${c.tags.join(", ")}`, href: `/dashboard/community/circles/${c.id}` });
      }
    }

    for (const r of SEED_ROOMS) {
      if (match(r.title) || match(r.skill) || match(r.topics.join(" "))) {
        hits.push({ kind: "Skill Room", icon: "group", label: r.title, sub: `${r.skill} · ${r.dayLabel}`, href: `/dashboard/community/skill-rooms/${r.id}` });
      }
    }

    for (const e of SEED_EVENTS) {
      if (match(e.name) || match(e.organizer) || match(e.description)) {
        hits.push({ kind: "Event", icon: "event", label: e.name, sub: `${e.category} · ${e.location}`, href: `/dashboard/community/events/${e.id}` });
      }
    }

    return hits.slice(0, 12);
  }, [q, questions]);
}

export function SearchCommand({ mode, onCloseMobile }: { mode: "desktop" | "mobile"; onCloseMobile: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hits = useGlobalSearch(query);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(LS_RECENT) ?? "[]") as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [query]);

  // ⌘K / Ctrl+K → fokus/buka pencarian
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        if (mode === "mobile") onCloseMobile();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onCloseMobile]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const saveRecent = (qy: string) => {
    const next = [qy, ...recent.filter((r) => r !== qy)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(LS_RECENT, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const go = (hit: Hit) => {
    saveRecent(query.trim());
    setOpen(false);
    setQuery("");
    if (mode === "mobile") onCloseMobile();
    router.push(hit.href);
  };

  const submit = () => {
    if (hits.length > 0) go(hits[0]);
    else if (query.trim()) {
      saveRecent(query.trim());
      setOpen(false);
      if (mode === "mobile") onCloseMobile();
      router.push(`/dashboard/katalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const listId = mode === "desktop" ? "search-listbox-desktop" : "search-listbox-mobile";
  const ariaLabel = "Cari skill, buddy, forum, circle, room, atau event";

  const panel = (
    <div
      role="listbox"
      aria-label="Hasil pencarian"
      id={listId}
      className="absolute left-0 right-0 top-12 max-h-[420px] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-[fade-up_0.2s_ease-out_both]"
    >
      {loading && (
        <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Mencari…
        </div>
      )}

      {!loading && query.trim().length >= 2 && hits.length === 0 && (
        <div className="px-3 py-4 text-center">
          <p className="text-sm font-bold text-slate-700">Tidak ada hasil untuk “{query.trim()}”</p>
          <p className="mt-1 text-xs text-slate-500">Coba kata kunci lain, atau tanyakan langsung di forum.</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (mode === "mobile") onCloseMobile();
              router.push("/dashboard/forum");
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
          >
            Tanya di Forum
          </button>
        </div>
      )}

      {!loading && query.trim().length < 2 && recent.length > 0 && (
        <div className="p-1">
          <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            Pencarian terakhir
            <button type="button" onClick={() => { setRecent([]); localStorage.removeItem(LS_RECENT); }} className="text-[10px] font-semibold text-indigo-600 hover:underline">
              Reset
            </button>
          </p>
          {recent.map((r) => (
            <button
              key={r}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => { setQuery(r); setOpen(true); inputRef.current?.focus(); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">history</span>
              {r}
            </button>
          ))}
        </div>
      )}

      {!loading &&
        hits.map((h) => (
          <button
            key={`${h.kind}-${h.href}-${h.label}`}
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => go(h)}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-slate-50 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">{h.icon}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 truncate">{h.label}</span>
              <span className="block text-xs text-slate-500 truncate">{h.sub}</span>
            </span>
            <span className="shrink-0 text-[10px] font-label-code font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">{h.kind}</span>
          </button>
        ))}
    </div>
  );

  const input = (autoFocus?: boolean) => (
    <div className="relative w-full">
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">search</span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Cari skill, buddy, forum, circle, room, event…"
        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-16 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
      />
      {query ? (
        <button
          type="button"
          aria-label="Reset pencarian"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      ) : (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-code text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>
      )}
    </div>
  );

  if (mode === "mobile") {
    return (
      <div className="fixed inset-0 z-[60] bg-white" ref={wrapRef}>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Tutup pencarian" onClick={onCloseMobile} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div className="flex-1">{input(true)}</div>
          </div>
          {open && <div className="relative mt-2">{panel}</div>}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
      {input(false)}
      {open && panel}
    </div>
  );
}
