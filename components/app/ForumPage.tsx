"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, useStore, type Question } from "@/lib/store";

type SortBy = "terbaru" | "populer" | "unanswered";

const statusMeta = {
  terjawab: { label: "Terjawab ✅", pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  menunggu: { label: "Menunggu 💤", pillClass: "bg-amber-50 text-amber-700 border-amber-200" },
  hot: { label: "Hot 🔥", pillClass: "bg-rose-50 text-rose-600 border-rose-200" },
} as const;

const tips = [
  { icon: "code", text: "Sertakan potongan kode atau pesan error lengkap" },
  { icon: "sell", text: "Pilih tag yang tepat biar sampai ke ahlinya" },
  { icon: "redeem", text: "Kasih reward poin untuk jawaban terbaik" },
];

const topContributors = [
  { initials: "AD", initialsClass: "bg-indigo-600", name: "Aditya Pratama", meta: "IF '21", best: "12 jawaban terbaik", badge: "👑" },
  { initials: "RD", initialsClass: "bg-emerald-500", name: "Rahmat Danu", meta: "IF '22", best: "9 jawaban terbaik", badge: "🥈" },
  { initials: "MR", initialsClass: "bg-slate-500", name: "Maya Rosalina", meta: "SI '21", best: "7 jawaban terbaik", badge: "🥉" },
];

export function ForumPage() {
  const store = useStore();
  const { user, questions, myVotes, createQuestion, voteQuestion, addAnswer, acceptAnswer } = store;
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<SortBy>("terbaru");
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setOnlyUnanswered(false);
  }, [searchParams]);

  const search = (searchParams.get("q") ?? "").toLowerCase();

  const visible = useMemo(() => {
    let list = [...questions];
    if (category !== "Semua") list = list.filter((q) => q.category === category);
    if (onlyUnanswered) list = list.filter((q) => q.status !== "terjawab");
    if (search) {
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(search) ||
          q.excerpt.toLowerCase().includes(search) ||
          q.tags.some((t) => t.toLowerCase().includes(search))
      );
    }
    if (sortBy === "populer") list.sort((a, b) => b.votes - a.votes);
    else if (sortBy === "unanswered") list.sort((a, b) => a.answers.length - b.answers.length);
    else list.sort((a, b) => b.id - a.id);
    return list;
  }, [questions, category, onlyUnanswered, search, sortBy]);

  const detailQuestion = questions.find((q) => q.id === detail) ?? null;
  const answeredCount = questions.filter((q) => q.status === "terjawab").length;
  const answerTotal = questions.reduce((n, q) => n + q.answers.length, 0);
  const answerRate = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forum Tanya Jawab 💬
          </h1>
          <p className="mt-2 font-body-md text-sm text-slate-600">
            Tanya apa aja seputar kuliah &amp; coding — dibalas oleh teman se-Filkom, bukan bot.
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

      {/* Filter bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 lg:ml-auto shrink-0">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="terbaru">Urutkan: Terbaru</option>
              <option value="populer">Urutkan: Terpopuler</option>
              <option value="unanswered">Urutkan: Belum Terjawab</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyUnanswered((v) => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              onlyUnanswered
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
            }`}
          >
            Belum Terjawab
          </button>
        </div>
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
              <p className="text-sm text-slate-500 mt-2">Belum ada pertanyaan yang cocok dengan filter ini.</p>
            </div>
          )}
          {visible.map((q, i) => {
            const st = statusMeta[q.status];
            const myVote = myVotes[q.id] ?? 0;
            const voted = myVote !== 0;
            return (
              <Reveal key={q.id} delay={Math.min(i * 60, 300)}>
                <article className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex gap-4">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => voteQuestion(q.id, 1)}
                      aria-label="Upvote"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        myVote === -1 ? "bg-rose-500 text-white" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                        {q.author.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{q.author}</span>
                      <span className="font-label-code text-[10px] text-slate-400">{q.nim}</span>
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
                        {q.answers.length} jawaban
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
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-6">
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
              <h3 className="font-headline-sm text-base font-bold text-slate-900 mb-4">Statistik Forum</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="font-label-code text-lg font-bold text-indigo-600 block">{questions.length}</span>
                  <span className="text-[10px] text-slate-500">Pertanyaan</span>
                </div>
                <div>
                  <span className="font-label-code text-lg font-bold text-emerald-600 block">{answerTotal}</span>
                  <span className="text-[10px] text-slate-500">Jawaban</span>
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
                  onClick={() => setSortBy("unanswered")}
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
        />
      )}
    </div>
  );
}

function AskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createQuestion, user } = useStore();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>("Web Dev");
  const [tags, setTags] = useState("");
  const [reward, setReward] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      onClose();
    } else {
      setError(res.error ?? "Terjadi kesalahan.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-[fade-up_0.3s_ease-out_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-slate-900">Tanya Sesuatu 👋</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sesama mahasiswa Filkom siap bantu jawab.</p>
          </div>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                  <option key={c} value={c}>
                    {c}
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

function QuestionDetail({
  question,
  myVote,
  onVote,
  onClose,
  onAnswer,
  onAccept,
}: {
  question: Question;
  myVote: number;
  onVote: (dir: 1 | -1) => void;
  onClose: () => void;
  onAnswer: (content: string) => void;
  onAccept: (aid: number) => void;
}) {
  const { user } = useStore();
  const [answer, setAnswer] = useState("");
  const st = statusMeta[question.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto animate-[fade-up_0.3s_ease-out_both]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-code font-bold border ${st.pillClass}`}>
              {st.label}
            </span>
            {question.reward && (
              <span className="text-[10px] font-label-code font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚡ {question.reward} Pts
              </span>
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

        <div className="px-6 py-5">
          {/* Question */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onVote(1)}
                aria-label="Upvote"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
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
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
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
              <p className="font-body-md text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{question.excerpt}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {question.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="font-headline-sm text-sm font-bold text-slate-900 mb-4">
              {question.answers.length} Jawaban
            </h3>

            {question.answers.length === 0 && (
              <p className="text-sm text-slate-400 italic mb-4">Belum ada jawaban. Jadilah yang pertama!</p>
            )}

            <div className="flex flex-col gap-4">
              {question.answers.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-xl border ${
                    a.accepted ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50 border-slate-200"
                  }`}
                >
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
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg px-2.5 py-1 transition-colors shrink-0"
                      >
                        Tandai Terbaik
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-amber-500">thumb_up</span>
                      {a.votes} membantu
                    </span>
                  </div>
                </div>
              ))}
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
              <div className="flex items-center justify-between mt-3">
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  Kirim Jawaban
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
