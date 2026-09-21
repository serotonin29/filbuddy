"use client";

// ============================================================
// PostCard — feed circle dengan aksi helpful, komentar, simpan, lapor
// ============================================================

import { useState } from "react";
import { POST_TYPE_META, circleById, relativeMinutes, type CirclePost } from "@/lib/communityData";
import { useCommunity } from "@/lib/communityStore";
import { Avatar } from "./ui";
import { ReportDialog, makeReportRef } from "./ReportDialog";

export function PostCard({
  post,
  showCircleName = false,
  circleName,
}: {
  post: CirclePost;
  showCircleName?: boolean;
  circleName?: string;
}) {
  const { toggleHelpful, toggleSavePost, savedPosts, helpfulByMe, reportedPosts, reportPost, addComment } = useCommunity();
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportRef, setReportRef] = useState<string | null>(null);
  const reported = !!reportedPosts[post.id];
  const saved = !!savedPosts[post.id];
  const helped = !!helpfulByMe[post.id];
  const meta = POST_TYPE_META[post.type];
  const isModerator = !!circleById(post.circleId)?.memberNames.find((m) => m.name === post.author && m.moderator);

  const submitComment = () => {
    const content = draft.trim();
    if (!content) return;
    addComment(post.id, content, "Kamu", "IF");
    setDraft("");
  };

  return (
    <article className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar name={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-headline-sm text-sm font-bold text-slate-900">{post.author}</span>
            {post.mine && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-label-code text-[9px] font-bold border border-indigo-200">
                KAMU
              </span>
            )}
            {isModerator && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-label-code text-[9px] font-bold border border-emerald-200 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">shield</span> MOD
              </span>
            )}
            <span className="font-label-code text-[10px] text-slate-400">{post.authorProdi}</span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-[11px] text-slate-400">{relativeMinutes(post.minutesAgo)}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.chip}`}>
              <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
              {meta.label}
            </span>
            {post.pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="material-symbols-outlined text-[12px]">push_pin</span>
                Disematkan
              </span>
            )}
            {showCircleName && circleName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                di {circleName}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label={saved ? "Hapus dari simpanan" : "Simpan post"}
          onClick={() => toggleSavePost(post.id)}
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
            saved ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{saved ? "bookmark" : "bookmark_border"}</span>
        </button>
      </div>

      <h3 className="mt-3 font-headline-sm text-[15px] sm:text-base font-bold text-slate-900 leading-snug">
        {post.title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{post.content}</p>

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-label-code text-[10px] font-medium">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => toggleHelpful(post.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
            helped ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{helped ? "thumb_up" : "thumb_up_off_alt"}</span>
          Membantu ({post.helpful})
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
          Komentar ({post.comments.length})
        </button>
        <div className="flex-1" />
        {reported ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-rose-500" title={reportRef ?? undefined}>
            <span className="material-symbols-outlined text-[14px]">flag</span>
            {reportRef ? `Dilaporkan · ${reportRef}` : "Terlapor"}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">flag</span>
            Lapor
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {post.comments.length === 0 && (
            <p className="text-xs text-slate-400 italic">Belum ada komentar — jadi yang pertama membantu, ya!</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar name={c.author} size="xs" />
              <div className="min-w-0 flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{c.author}</span>
                  <span className="font-label-code text-[9px] text-slate-400">{c.prodi}</span>
                  <span className="text-[10px] text-slate-400">· {relativeMinutes(c.minutesAgo)}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Avatar name="Kamu" size="xs" />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Tulis komentar yang membantu..."
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={!draft.trim()}
              className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
      {reporting && (
        <ReportDialog
          title={`${post.type === "announcement" ? "Pengumuman" : "Post"}: ${post.title}`}
          onClose={() => setReporting(false)}
          onSubmit={(_reason, _detail, ref) => {
            reportPost(post.id);
            setReportRef(ref);
          }}
        />
      )}
    </article>
  );
}
