"use client";

// ============================================================
// Forum Tanya Jawab — ala Reddit, versi coding:
// sort Hot/Baru/Top, komunitas r/ yang bisa di-join,
// komentar bertingkat dengan vote & collapse, render blok kode.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, useStore, type Question, type ActionResult } from "@/lib/store";

// ---------- util waktu & skor ----------

function parseTimeAgo(label: string): number {
  if (!label) return 60 * 24 * 30;
  if (/baru/i.test(label)) return 0;
  let m = label.match(/(\d+)\s*menit/i);
  if (m) return Number(m[1]);
  m = label.match(/(\d+)\s*jam/i);
  if (m) return Number(m[1]) * 60;
  m = label.match(/(\d+)\s*hari/i);
  if (m) return Number(m[1]) * 60 * 24;
  m = label.match(/(\d+)\s*minggu/i);
  if (m) return Number(m[1]) * 60 * 24 * 7;
  return 60 * 24 * 30;
}

function hotScore(q: Question): number {
  const ageHours = parseTimeAgo(q.time) / 60;
  const score = q.votes + q.answers.length * 2 + (q.reward ?? 0) / 10;
  return score / Math.pow(ageHours + 2, 1.1);
}

const PAGE_SIZE = 10;

const DRAFT_KEY = "filbuddy-draft-forum";

type SortBy = "hot" | "baru" | "top";

const SORT_TABS: { id: SortBy; label: string; icon: string }[] = [
  { id: "hot", label: "Hot", icon: "local_fire_department" },
  { id: "baru", label: "Baru", icon: "schedule" },
  { id: "top", label: "Top", icon: "emoji_events" },
];

const statusMeta = {
  terjawab: { label: "Terjawab ✅", pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  menunggu: { label: "Menunggu 💤", pillClass: "bg-amber-50 text-amber-700 border-amber-200" },
  hot: { label: "Hot 🔥", pillClass: "bg-rose-50 text-rose-600 border-rose-200" },
} as const;

const COMMUNITY_META: Record<string, { icon: string; color: string }> = {
  "Web Dev": { icon: "code", color: "bg-indigo-600" },
  "Mobile": { icon: "smartphone", color: "bg-sky-500" },
  "UI/UX": { icon: "palette", color: "bg-fuchsia-500" },
  "Database": { icon: "database", color: "bg-emerald-600" },
  "Jaringan": { icon: "lan", color: "bg-amber-500" },
  "Matkul Teori": { icon: "menu_book", color: "bg-violet-600" },
  "Algoritma": { icon: "psychology", color: "bg-rose-500" },
};

const JOINED_KEY = "filbuddy-forum-joined";

function loadJoined(): string[] {
  if (typeof window === "undefined") return ["Web Dev", "Algoritma"];
  try {
    const raw = window.localStorage.getItem(JOINED_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return ["Web Dev", "Algoritma"];
}

const tips = [
  { icon: "code", text: "Bungkus kode dengan ``` agar tampil sebagai blok kode" },
  { icon: "sell", text: "Pilih komunitas yang tepat biar sampai ke ahlinya" },
  { icon: "redeem", text: "Kasih reward poin untuk jawaban terbaik" },
];

const topContributors = [
  { initials: "AD", initialsClass: "bg-indigo-600", name: "Aditya Pratama", meta: "IF '21", best: "12 jawaban terbaik", badge: "👑" },
  { initials: "RD", initialsClass: "bg-emerald-500", name: "Rahmat Danu", meta: "IF '22", best: "9 jawaban terbaik", badge: "🥈" },
  { initials: "MR", initialsClass: "bg-slate-500", name: "Maya Rosalina", meta: "SI '21", best: "7 jawaban terbaik", badge: "🥉" },
];

// ============================================================
// Renderer markdown-lite untuk konten coding
// ============================================================

export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
      return (
        <code key={`${keyPrefix}-${i}`} className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-label-code text-[12px] text-indigo-700">
          {p.slice(1, -1)}
        </code>
      );
    }
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-bold text-slate-800">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{p}</span>;
  });
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-700/50 bg-[#0d1117]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-700/50">
        <span className="font-label-code text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[13px]">terminal</span>
          {lang || "kode"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          <span className="material-symbols-outlined text-[13px]">{copied ? "check" : "content_copy"}</span>
          {copied ? "Tersalin" : "Copy"}
        </button>
      </div>
      <pre className="px-3.5 py-3 overflow-x-auto">
        <code className="font-label-code text-[12px] leading-relaxed text-emerald-300/90 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownLite({ text, compact = false }: { text: string; compact?: boolean }) {
  const blocks = useMemo(() => {
    const out: { type: "text" | "code"; lang?: string; content: string }[] = [];
    const re = /```(\w*)\n?([\s\S]*?)```/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ type: "text", content: text.slice(last, m.index) });
      out.push({ type: "code", lang: m[1], content: m[2].replace(/\n$/, "") });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: "text", content: text.slice(last) });
    return out;
  }, [text]);

  return (
    <div className={compact ? "text-sm text-slate-600 leading-relaxed" : "text-sm text-slate-700 leading-relaxed"}>
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} lang={b.lang ?? ""} code={b.content} />
        ) : (
          b.content.split(/\n{2,}/).map((para, j) =>
            para.trim() ? (
              <p key={`${i}-${j}`} className={i > 0 || j > 0 ? "mt-2" : ""}>
                {renderInline(para.trim(), `${i}-${j}`)}
              </p>
            ) : null
          )
        )
      )}
    </div>
  );
}

// ============================================================
// ForumPage
// ============================================================

type Reply = { id: number; author: string; nim: string; content: string; votes: number; mine: boolean };
type RepliesMap = Record<string, Reply[]>;

export function ForumPage() {
  const store = useStore();
  const { user, questions, myVotes, voteQuestion, addAnswer, acceptAnswer, updateAnswer, deleteAnswer, deleteQuestion } = store;
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<SortBy>("hot");
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [joined, setJoined] = useState<string[]>(loadJoined);
  const [onlyJoined, setOnlyJoined] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [mobileQuery, setMobileQuery] = useState("");

  // state komentar bertingkat — di-lift supaya bertahan selama sesi
  const [replies, setReplies] = useState<RepliesMap>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [commentVotes, setCommentVotes] = useState<Record<string, 1 | -1 | 0>>({});

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setOnlyUnanswered(false);
  }, [searchParams]);

  const toggleJoin = useCallback((c: string) => {
    setJoined((prev) => {
      const next = prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c];
      try {
        window.localStorage.setItem(JOINED_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const search = ((searchParams.get("q") || mobileQuery) ?? "").toLowerCase();

  const visible = useMemo(() => {
    let list = [...questions];
    if (category !== "Semua") list = list.filter((q) => q.category === category);
    if (onlyJoined) list = list.filter((q) => joined.includes(q.category));
    if (onlyUnanswered) list = list.filter((q) => q.status !== "terjawab");
    if (search) {
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(search) ||
          q.excerpt.toLowerCase().includes(search) ||
          q.tags.some((t) => t.toLowerCase().includes(search))
      );
    }
    if (sortBy === "top") list.sort((a, b) => b.votes - a.votes || b.id - a.id);
    else if (sortBy === "baru") list.sort((a, b) => b.id - a.id);
    else list.sort((a, b) => hotScore(b) - hotScore(a));
    return list;
  }, [questions, category, onlyJoined, joined, onlyUnanswered, search, sortBy]);

  // Pagination client-side: 10 pertanyaan per halaman, "muat selengkapnya".
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setShowCount(PAGE_SIZE);
  }, [category, sortBy, onlyUnanswered, onlyJoined, search]);
  const shown = useMemo(() => visible.slice(0, showCount), [visible, showCount]);

  const detailQuestion = questions.find((q) => q.id === detail) ?? null;
  const answeredCount = questions.filter((q) => q.status === "terjawab").length;
  const answerTotal = questions.reduce((n, q) => n + q.answers.length, 0);
  const answerRate = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const myKarma = useMemo(
    () => questions.filter((q) => q.mine).reduce((n, q) => n + q.votes, 0),
    [questions]
  );

  const addReply = useCallback((key: string, content: string) => {
    setReplies((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] ?? []),
        { id: Date.now() + Math.floor(Math.random() * 1000), author: "Kamu", nim: "", content, votes: 1, mine: true },
      ],
    }));
  }, []);

  const voteComment = useCallback((key: string) => {
    setCommentVotes((prev) => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forum Tanya Jawab 💬
          </h1>
          <p className="mt-2 font-body-md text-sm text-slate-600">
            Komunitas coding se-Filkom — tanya, jawab, vote. Bukan bot, semua dibalas manusia.
          </p>
        </div>
        <button
          onClick={() => setAskOpen(true)}
          className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-headline-sm text-sm font-bold shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Tanya Sekarang
        </button>
      </div>

      {/* Search — hanya tampil di mobile (navbar search tersembunyi di <md) */}
      <form
        className="md:hidden relative"
        onSubmit={(e) => e.preventDefault()}
      >
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={mobileQuery}
          onChange={(e) => setMobileQuery(e.target.value)}
          placeholder="Cari skill, mentor, atau mata kuliah..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
        />
      </form>

      {/* Sort tabs ala Reddit */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          {SORT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSortBy(t.id)}
              aria-pressed={sortBy === t.id}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                sortBy === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOnlyUnanswered((v) => !v)}
          aria-pressed={onlyUnanswered}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            onlyUnanswered
              ? "bg-amber-50 text-amber-700 border-amber-300"
              : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
          }`}
        >
          Belum Terjawab
        </button>
        <button
          type="button"
          onClick={() => setOnlyJoined((v) => !v)}
          aria-pressed={onlyJoined}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            onlyJoined
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
          }`}
        >
          ⭐ Komunitasku ({joined.length})
        </button>
      </div>

      {/* Komunitas chips (r/ style) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              category === c
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            {c === "Semua" ? "Semua" : `r/${c.toLowerCase().replace(/[\s/]+/g, "")}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Questions list */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {search && (
            <p className="text-xs text-slate-500">
              Hasil pencarian untuk <strong className="text-slate-800">&ldquo;{search}&rdquo;</strong> — {visible.length} pertanyaan.
            </p>
          )}
          {visible.length === 0 && (
            <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300">forum</span>
              <p className="text-sm text-slate-500 mt-2">
                {onlyJoined
                  ? "Feed komunitasmu masih sepi. Join komunitas lain atau buka filter ini."
                  : "Belum ada pertanyaan yang cocok dengan filter ini."}
              </p>
            </div>
          )}
          {shown.map((q, i) => {
            const st = statusMeta[q.status];
            const myVote = myVotes[q.id] ?? 0;
            return (
              <Reveal key={q.id} delay={Math.min(i * 60, 300)}>
                <article className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex gap-4">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => voteQuestion(q.id, 1)}
                      aria-label="Upvote"
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                        myVote === 1 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
                    </button>
                    <span className={`font-label-code text-sm font-bold ${myVote !== 0 ? "text-indigo-600" : "text-slate-700"}`}>
                      {q.votes}
                    </span>
                    <button
                      type="button"
                      onClick={() => voteQuestion(q.id, -1)}
                      aria-label="Downvote"
                      className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                        myVote === -1 ? "bg-rose-500 text-white" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className={`w-6 h-6 rounded-md text-white flex items-center justify-center font-bold text-[10px] ${COMMUNITY_META[q.category]?.color ?? "bg-indigo-600"}`}>
                        {q.author.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{q.author}</span>
                      <span className="text-[10px] text-slate-300">di</span>
                      <button
                        type="button"
                        onClick={() => setCategory(q.category)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        r/{q.category.toLowerCase().replace(/[\s/]+/g, "")}
                      </button>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{q.time}</span>
                      {q.mine && (
                        <span className="text-[9px] font-label-code font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase">
                          Pertanyaanku
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetail(q.id)}
                      className="text-left w-full"
                    >
                      <h2 className="font-headline-sm text-base font-bold text-slate-900 leading-snug hover:text-indigo-700 transition-colors mb-1">
                        {q.title}
                      </h2>
                      <p className="font-body-sm text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{q.excerpt}</p>
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-code font-bold border ${st.pillClass}`}>
                        {st.label}
                      </span>
                      {q.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        {q.answers.length} komentar
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {q.views} dilihat
                      </span>
                      {q.reward && (
                        <span className="ml-auto text-[11px] font-label-code font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          ⚡ {q.reward} Pts untuk jawaban terbaik
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
          {visible.length > PAGE_SIZE && (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-[11px] text-slate-400">
                Menampilkan {shown.length} dari {visible.length} pertanyaan
              </p>
              <button
                type="button"
                onClick={() => setShowCount((n) => n + PAGE_SIZE)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                Muat {Math.min(PAGE_SIZE, visible.length - shown.length)} pertanyaan lainnya
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Komunitas */}
          <Reveal delay={50}>
            <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-sm text-base font-bold text-slate-900">Komunitas</h3>
                <span className="font-label-code text-[10px] text-slate-400">{joined.length} diikuti</span>
              </div>
              <div className="flex flex-col gap-1">
                {CATEGORIES.filter((c) => c !== "Semua").map((c) => {
                  const isJoined = joined.includes(c);
                  const count = questions.filter((q) => q.category === c).length;
                  const meta = COMMUNITY_META[c] ?? { icon: "tag", color: "bg-indigo-600" };
                  return (
                    <div key={c} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setOnlyJoined(false);
                        }}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                      >
                        <span className={`w-8 h-8 rounded-lg ${meta.color} text-white flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-slate-800 truncate">r/{c.toLowerCase().replace(/[\s/]+/g, "")}</span>
                          <span className="block font-label-code text-[10px] text-slate-400">{count} post</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleJoin(c)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                          isJoined
                            ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                            : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                        }`}
                      >
                        {isJoined ? "✓ Joined" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </Reveal>

          <Reveal delay={100}>
            <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h3 className="font-headline-sm text-base font-bold text-slate-900 mb-3">Tanya untuk Dijawab Cepat</h3>
              <ul className="flex flex-col gap-2.5">
                {tips.map((t) => (
                  <li key={t.text} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                    </div>
                    <span className="text-xs text-slate-600 leading-snug pt-1">{t.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Saldo kamu: {user?.points ?? 0} Pts — reward diambil dari saldo BuddyPoints-mu
              </p>
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h3 className="font-headline-sm text-base font-bold text-slate-900 mb-4">Top Contributors Minggu Ini</h3>
              <div className="flex flex-col gap-3">
                {topContributors.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${c.initialsClass} text-white flex items-center justify-center font-headline-sm text-xs font-bold shrink-0`}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-sm font-bold text-slate-900 truncate">{c.name}</span>
                        <span className="text-xs">{c.badge}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {c.meta} · <span className="font-label-code">{c.best}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={300}>
            <section className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-base font-bold text-slate-900">Karma kamu</h3>
                <span className="font-label-code text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  +{myKarma} dari post-mu
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="font-label-code text-lg font-bold text-indigo-600 block">{questions.length}</span>
                  <span className="text-[10px] text-slate-500">Post</span>
                </div>
                <div>
                  <span className="font-label-code text-lg font-bold text-emerald-600 block">{answerTotal}</span>
                  <span className="text-[10px] text-slate-500">Komentar</span>
                </div>
                <div>
                  <span className="font-label-code text-lg font-bold text-amber-600 block">{answerRate}%</span>
                  <span className="text-[10px] text-slate-500">Terjawab</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-label-code text-slate-400 mb-1">
                  <span>Rate Terjawab</span>
                  <span>{answerRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${answerRate}%` }} />
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={400}>
            <section className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white shadow-lg shadow-indigo-600/20">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[28px] text-amber-300 mb-2 block">military_tech</span>
                <p className="font-headline-sm text-sm font-bold leading-snug mb-1">Jawab 1 pertanyaan = +10 Karma Poin.</p>
                <p className="text-xs text-indigo-100 mb-4">Naikkan peringkat leaderboard-mu!</p>
                <button
                  onClick={() => {
                    setSortBy("baru");
                    setOnlyUnanswered(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-indigo-700 font-label-ui text-xs font-bold hover:bg-indigo-50 transition-colors"
                >
                  Mulai Menjawab
                </button>
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      {/* Ask modal */}
      <AskModal open={askOpen} onClose={() => setAskOpen(false)} />

      {/* Detail modal */}
      {detailQuestion && (
        <QuestionDetail
          question={detailQuestion}
          myVote={myVotes[detailQuestion.id] ?? 0}
          onVote={(dir) => voteQuestion(detailQuestion.id, dir)}
          onClose={() => setDetail(null)}
          onAnswer={(content) => addAnswer(detailQuestion.id, content)}
          onAccept={(aid) => acceptAnswer(detailQuestion.id, aid)}
          onUpdateAnswer={(aid, content) => updateAnswer(detailQuestion.id, aid, content)}
          onDeleteAnswer={(aid) => deleteAnswer(detailQuestion.id, aid)}
          onDeleteQuestion={async () => {
            const r = await deleteQuestion(detailQuestion.id);
            if (r.ok) setDetail(null);
            return r;
          }}
          replies={replies}
          collapsed={collapsed}
          commentVotes={commentVotes}
          onToggleCollapse={(key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
          onVoteComment={(key) => voteComment(key)}
          onReply={(key, content) => addReply(key, content)}
        />
      )}
    </div>
  );
}

// ============================================================
// Ask modal — hooks e2e dipertahankan
// ============================================================

function AskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createQuestion, user, questions } = useStore();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>("Web Dev");
  const [tags, setTags] = useState("");
  const [reward, setReward] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const backdropDown = useRef(false);

  // Autosave draft: pulihkan saat modal dibuka.
  useEffect(() => {
    if (!open) return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { title?: string; excerpt?: string; tags?: string };
        if (d.title || d.excerpt) {
          if (d.title) setTitle(d.title);
          if (d.excerpt) setExcerpt(d.excerpt);
          if (d.tags) setTags(d.tags);
          setDraftRestored(true);
        }
      }
    } catch {}
  }, [open]);

  // Autosave draft: simpan ter-debounce saat mengetik.
  useEffect(() => {
    if (!open) return;
    if (!title.trim() && !excerpt.trim()) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, excerpt, tags }));
        setDraftRestored(true);
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [title, excerpt, tags, open]);

  // Saran duplikat: tampilkan pertanyaan serupa saat judul cukup panjang.
  const similar = useMemo(() => {
    const t = title.trim().toLowerCase();
    if (t.length < 12) return [];
    const words = t.split(/\s+/).filter((w) => w.length >= 4);
    if (words.length === 0) return [];
    return questions
      .map((q) => {
        const hay = `${q.title} ${q.tags.join(" ")}`.toLowerCase();
        const hits = words.filter((w) => hay.includes(w)).length;
        return { q, score: hits / words.length };
      })
      .filter((x) => x.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((x) => x.q);
  }, [title, questions]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedTags = tags
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    const res = await createQuestion({ title, excerpt, category, tags: parsedTags, reward });
    if (res.ok) {
      setTitle("");
      setExcerpt("");
      setTags("");
      setReward(0);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setDraftRestored(false);
      onClose();
    } else {
      setError(res.error ?? "Terjadi kesalahan.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        backdropDown.current = e.target === e.currentTarget;
      }}
      onClick={() => {
        if (backdropDown.current) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-[fade-up_0.3s_ease-out_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-slate-900">Tanya Sesuatu 👋</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sesama mahasiswa Filkom siap bantu jawab.</p>
          </div>
          {draftRestored && (title || excerpt) ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">save</span>
                Draft tersimpan otomatis
              </span>
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setExcerpt("");
                  setTags("");
                  try {
                    window.localStorage.removeItem(DRAFT_KEY);
                  } catch {}
                  setDraftRestored(false);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Hapus draft
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Judul Pertanyaan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Kenapa query JOIN saya lambat di MySQL?"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            {similar.length > 0 && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                  Mungkin sudah pernah ditanyakan:
                </p>
                <ul className="mt-1.5 space-y-1">
                  {similar.map((sq) => (
                    <li key={sq.id} className="text-[11px] text-amber-900/90 leading-snug">
                      &ldquo;{sq.title}&rdquo;{" "}
                      <span className="text-amber-700/70">({sq.answers.length} jawaban)</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[10px] text-amber-700/80">
                  Cek dulu sebelum posting — kalau pertanyaanmu berbeda, lanjutkan saja.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Detail Masalah</label>
            <textarea
              required
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Jelaskan konteks, sertakan kode/error message kalau ada..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            />
            <p className="mt-1.5 font-label-code text-[10px] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">terminal</span>
              Bungkus kode dengan ``` agar tampil sebagai blok kode + tombol copy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Komunitas</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                  <option key={c} value={c}>
                    r/{c.toLowerCase().replace(/[\s/]+/g, "")} — {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Tag (pisah spasi)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="mysql laravel figma"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-label-code text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Reward untuk Jawaban Terbaik — saldo: {user.points} Pts
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[0, 10, 20, 50].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReward(r)}
                  disabled={r > user.points}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    reward === r
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-slate-300 bg-white text-slate-600 hover:border-amber-300"
                  }`}
                >
                  {r === 0 ? "Tanpa reward" : `⚡ ${r} Pts`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !excerpt.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              Posting Pertanyaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Detail — thread komentar ala Reddit
// ============================================================

import { ReportDialog, makeReportRef } from "@/components/community/ReportDialog";

type CommentSort = "terbaik" | "terbaru";

function QuestionDetail({
  question,
  myVote,
  onVote,
  onClose,
  onAnswer,
  onAccept,
  onUpdateAnswer,
  onDeleteAnswer,
  onDeleteQuestion,
  replies,
  collapsed,
  commentVotes,
  onToggleCollapse,
  onVoteComment,
  onReply,
}: {
  question: Question;
  myVote: number;
  onVote: (dir: 1 | -1) => void;
  onClose: () => void;
  onAnswer: (content: string) => void;
  onAccept: (aid: number) => void;
  onUpdateAnswer: (aid: number, content: string) => Promise<ActionResult> | ActionResult;
  onDeleteAnswer: (aid: number) => Promise<ActionResult> | ActionResult;
  onDeleteQuestion: () => Promise<ActionResult> | ActionResult;
  replies: RepliesMap;
  collapsed: Record<string, boolean>;
  commentVotes: Record<string, 1 | -1 | 0>;
  onToggleCollapse: (key: string) => void;
  onVoteComment: (key: string) => void;
  onReply: (key: string, content: string) => void;
}) {
  const { user } = useStore();
  const [answer, setAnswer] = useState("");
  const [commentSort, setCommentSort] = useState<CommentSort>("terbaik");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportedRef, setReportedRef] = useState<string | null>(null);
  const backdropDown = useRef(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelQ, setConfirmDelQ] = useState(false);
  const [confirmDelA, setConfirmDelA] = useState<number | null>(null);
  const [delError, setDelError] = useState<string | null>(null);

  // Reset state konfirmasi/edit saat modal dibuka untuk pertanyaan lain.
  useEffect(() => {
    setEditingId(null);
    setConfirmDelQ(false);
    setConfirmDelA(null);
    setEditError(null);
    setDelError(null);
  }, [question.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const st = statusMeta[question.status];

  const sortedAnswers = useMemo(() => {
    const list = [...question.answers];
    if (commentSort === "terbaik") {
      list.sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes || a.id - b.id);
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [question.answers, commentSort]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        backdropDown.current = e.target === e.currentTarget;
      }}
      onClick={() => {
        if (backdropDown.current) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-[fade-up_0.3s_ease-out_both]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-code font-bold border ${st.pillClass}`}>
              {st.label}
            </span>
            <span className="text-[10px] font-label-code font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              r/{question.category.toLowerCase().replace(/[\s/]+/g, "")}
            </span>
            {question.reward && (
              <span className="text-[10px] font-label-code font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚡ {question.reward} Pts
              </span>
            )}
            {!question.mine &&
              (reportedRef ? (
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">flag</span>
                  Dilaporkan · {reportedRef}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">flag</span>
                  Lapor
                </button>
              ))}
            {question.mine && (
              confirmDelQ ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {question.status === "terjawab" ? "Sudah terjawab — tidak bisa dihapus" : "Hapus permanen?"}
                  </span>
                  {question.status !== "terjawab" && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setDelError(null);
                          const r = await onDeleteQuestion();
                          if (!r.ok) {
                            setDelError(r.error ?? "Gagal menghapus.");
                            setConfirmDelQ(false);
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Ya, hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelQ(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                      >
                        Batal
                      </button>
                    </>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDelError(null);
                    setConfirmDelQ(true);
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">delete</span>
                  Hapus
                </button>
              )
            )}
            {delError && (
              <p className="w-full text-[11px] font-semibold text-rose-600">{delError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5">
          {/* Post */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onVote(1)}
                aria-label="Upvote"
                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  myVote === 1 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
              </button>
              <span className={`font-label-code text-sm font-bold ${myVote !== 0 ? "text-indigo-600" : "text-slate-700"}`}>
                {question.votes}
              </span>
              <button
                type="button"
                onClick={() => onVote(-1)}
                aria-label="Downvote"
                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                  myVote === -1 ? "bg-rose-500 text-white" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                  {question.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-xs font-semibold text-slate-800">{question.author}</span>
                <span className="font-label-code text-[10px] text-slate-400">{question.nim}</span>
                <span className="text-[10px] text-slate-400">{question.time}</span>
              </div>
              <h2 className="font-headline-sm text-lg font-bold text-slate-900 leading-snug mb-2">{question.title}</h2>
              <MarkdownLite text={question.excerpt} />
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {question.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-headline-sm text-sm font-bold text-slate-900">
                {question.answers.length} Komentar
              </h3>
              <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-100">
                {(["terbaik", "terbaru"] as CommentSort[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCommentSort(s)}
                    aria-pressed={commentSort === s}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${
                      commentSort === s ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s === "terbaik" ? "★ Terbaik" : "🕐 Terbaru"}
                  </button>
                ))}
              </div>
            </div>

            {question.answers.length === 0 && (
              <p className="text-sm text-slate-400 italic mb-4">Belum ada komentar. Jadilah yang pertama!</p>
            )}

            <div className="flex flex-col gap-3">
              {sortedAnswers.map((a) => {
                const key = `${question.id}:${a.id}`;
                const extra = commentVotes[key] ?? 0;
                const isCollapsed = !!collapsed[key];
                const threadReplies = replies[key] ?? [];
                const isMine = a.authorId ? a.authorId === user?.id : !!user && a.author === user.name;
                return (
                  <div key={a.id} className="flex gap-1">
                    {/* Thread line + collapse */}
                    <div className="flex flex-col items-center pt-3 shrink-0 w-6">
                      <button
                        type="button"
                        onClick={() => onToggleCollapse(key)}
                        aria-label={isCollapsed ? "Buka thread" : "Tutup thread"}
                        className="w-5 h-5 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[13px]">{isCollapsed ? "add" : "remove"}</span>
                      </button>
                      {!isCollapsed && <div className="w-0.5 flex-1 my-1 rounded-full bg-slate-200" aria-hidden />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`p-4 rounded-xl border ${a.accepted ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                              {a.author.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-xs font-semibold text-slate-800">{a.author}</span>
                            <span className="font-label-code text-[10px] text-slate-400">{a.nim}</span>
                            <span className="text-[10px] text-slate-400">{a.time}</span>
                            {a.accepted && (
                              <span className="text-[10px] font-label-code font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                ✓ JAWABAN TERBAIK
                              </span>
                            )}
                          </div>
                          {question.mine && !a.accepted && (
                            <button
                              type="button"
                              onClick={() => onAccept(a.id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg px-3 py-2 transition-colors shrink-0"
                            >
                              Tandai Terbaik
                            </button>
                          )}
                        </div>

                        {isCollapsed ? (
                          <p className="text-xs text-slate-400 italic">{a.content.slice(0, 80)}{a.content.length > 80 ? "…" : ""}</p>
                        ) : editingId === a.id ? (
                          <div>
                            <textarea
                              value={editDraft}
                              onChange={(e) => {
                                setEditDraft(e.target.value);
                                setEditError(null);
                              }}
                              rows={4}
                              aria-label="Edit jawaban"
                              className="w-full p-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:outline-none text-sm bg-white resize-y"
                            />
                            {editError && <p className="mt-1 text-[11px] font-semibold text-rose-600">{editError}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  const r = await onUpdateAnswer(a.id, editDraft);
                                  if (r.ok) {
                                    setEditingId(null);
                                    setEditError(null);
                                  } else {
                                    setEditError(r.error ?? "Gagal menyimpan.");
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                              >
                                Simpan Perubahan
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditError(null);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <MarkdownLite text={a.content} compact />

                            {/* Aksi komentar */}
                            <div className="flex items-center gap-1 mt-2.5">
                              <button
                                type="button"
                                onClick={() => onVoteComment(key)}
                                aria-label={`Vote komentar ${a.author}`}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                  extra === 1 ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {extra === 1 ? "thumb_up" : "thumb_up_off_alt"}
                                </span>
                                {a.votes + extra}
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleCollapse(key)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                Balas
                              </button>
                              {isMine && !a.accepted && (
                                confirmDelA === a.id ? (
                                  <>
                                    <span className="text-[11px] font-semibold text-slate-500 ml-1">Hapus jawaban ini?</span>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setDelError(null);
                                        const r = await onDeleteAnswer(a.id);
                                        if (!r.ok) {
                                          setDelError(r.error ?? "Gagal menghapus.");
                                          setConfirmDelA(null);
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                    >
                                      Ya, hapus
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDelA(null)}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-slate-600"
                                    >
                                      Batal
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingId(a.id);
                                        setEditDraft(a.content);
                                        setEditError(null);
                                      }}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDelError(null);
                                        setConfirmDelA(a.id);
                                      }}
                                      className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                    >
                                      Hapus
                                    </button>
                                  </>
                                )
                              )}
                            </div>

                            {/* Reply composer */}
                            <ReplyComposer onSend={(content) => onReply(key, content)} />

                            {/* Balasan bertingkat */}
                            {threadReplies.length > 0 && (
                              <div className="mt-3 pl-3 border-l-2 border-indigo-200 space-y-2">
                                {threadReplies.map((r) => {
                                  const rKey = `${key}:${r.id}`;
                                  const rVote = commentVotes[rKey] ?? 0;
                                  return (
                                    <div key={r.id} className="p-2.5 rounded-lg bg-white border border-slate-200">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[9px] ${r.mine ? "bg-indigo-600" : "bg-slate-400"}`}>
                                          {r.author.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-800">{r.author}</span>
                                        {r.mine && (
                                          <span className="text-[9px] font-label-code font-bold px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">kamu</span>
                                        )}
                                        <span className="text-[10px] text-slate-400">Baru saja</span>
                                      </div>
                                      <MarkdownLite text={r.content} compact />
                                      <button
                                        type="button"
                                        onClick={() => onVoteComment(rKey)}
                                        className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                          rVote === 1 ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-[12px]">
                                          {rVote === 1 ? "thumb_up" : "thumb_up_off_alt"}
                                        </span>
                                        {r.votes + rVote}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Answer box */}
            <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Tulis Jawabanmu {user && `(atas nama ${user.name})`}
              </label>
              <textarea
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Jelaskan solusinya sejelas mungkin..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-500">military_tech</span>
                  +10 Karma Poin jika jawabanmu ditandai terbaik
                </span>
                <button
                  type="button"
                  disabled={!answer.trim()}
                  onClick={() => {
                    onAnswer(answer.trim());
                    setAnswer("");
                  }}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  Kirim Jawaban
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {reportOpen && (
        <ReportDialog
          title={`Pertanyaan: ${question.title}`}
          onClose={() => setReportOpen(false)}
          onSubmit={(_reason, _detail, ref) => setReportedRef(ref)}
        />
      )}
    </div>
  );
}

function ReplyComposer({ onSend }: { onSend: (content: string) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="mt-2.5 flex items-center gap-2">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            onSend(draft.trim());
            setDraft("");
          }
        }}
        placeholder="Balas komentar ini..."
        className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        type="button"
        disabled={!draft.trim()}
        onClick={() => {
          onSend(draft.trim());
          setDraft("");
        }}
        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
      >
        Balas
      </button>
    </div>
  );
}
