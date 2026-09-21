"use client";

// ============================================================
// CreatePostModal — komposer post circle dengan 6 tipe post
// ============================================================

import { useEffect, useState } from "react";
import { POST_TYPE_META, type CirclePostType } from "@/lib/communityData";
import { useCommunity } from "@/lib/communityStore";
import { useStore } from "@/lib/store";

const TYPE_ORDER: CirclePostType[] = ["discussion", "question", "resource", "buddy", "project", "announcement"];

const TYPE_HINTS: Record<CirclePostType, string> = {
  discussion: "Buka obrolan santai atau diskusi topik di circle.",
  question: "Ajukan pertanyaan — makin jelas konteksnya, makin cepat dibantu.",
  resource: "Bagikan link, file, atau catatan belajar yang berguna.",
  buddy: "Cari teman belajar, partner project, atau diskusi.",
  project: "Umumkan project atau rekrut anggota tim.",
  announcement: "Info penting — hanya moderator yang bisa menyematkan.",
};

export function CreatePostModal({
  open,
  circleId,
  onClose,
  onCreated,
}: {
  open: boolean;
  circleId: string;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { addPost, circles } = useCommunity();
  const { user } = useStore();
  const [type, setType] = useState<CirclePostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const circle = circles.find((c) => c.id === circleId);
  const isModerator = !!circle?.memberNames.find(
    (m) => m.name === (user?.name ?? "Kamu") && m.moderator
  );
  const canAnnounce = isModerator;

  useEffect(() => {
    if (!open) return;
    setType("discussion");
    setTitle("");
    setContent("");
    setTags("");
    setError("");
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const TYPE_ORDER_VISIBLE = canAnnounce
    ? TYPE_ORDER
    : TYPE_ORDER.filter((t) => t !== "announcement");

  const submit = () => {
    if (type === "announcement" && !canAnnounce) {
      setError("Hanya moderator circle yang bisa membuat pengumuman.");
      return;
    }
    if (title.trim().length < 8) {
      setError("Judul minimal 8 karakter agar jelas untuk pembaca lain.");
      return;
    }
    if (content.trim().length < 20) {
      setError("Isi post minimal 20 karakter — sertakan konteks yang cukup.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Judul dan isi post wajib diisi, ya.");
      return;
    }
    const tagList = tags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    const rawProdi = (user?.prodi ?? "IF").slice(0, 2).toUpperCase();
    addPost(circleId, {
      type,
      title: title.trim(),
      content: content.trim(),
      tags: tagList,
      author: user?.name ?? "Kamu",
      authorProdi: (["IF", "SI", "SK", "MI"].includes(rawProdi) ? rawProdi : "IF") as "IF" | "SI" | "SK" | "MI",
    });
    onCreated?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Buat post baru"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
      />
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-headline-sm text-base font-bold text-slate-900">Buat Post Baru</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Tipe post</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_ORDER_VISIBLE.map((t) => {
                const m = POST_TYPE_META[t];
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {type === "announcement" && !canAnnounce
                ? "Tipe Announcement hanya untuk moderator circle."
                : TYPE_HINTS[type]}
            </p>
          </div>

          <div>
            <label htmlFor="post-title" className="text-xs font-bold text-slate-700">
              Judul
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Contoh: Rekomendasi roadmap belajar React 2026?"
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="post-content" className="text-xs font-bold text-slate-700">
              Isi post
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={1200}
              placeholder="Tulis dengan jelas dan sopan. Sertakan konteks, apa yang sudah dicoba, dan apa yang dibutuhkan."
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <p className="mt-1 text-right font-label-code text-[10px] text-slate-400">{content.length}/1200</p>
          </div>

          <div>
            <label htmlFor="post-tags" className="text-xs font-bold text-slate-700">
              Tag <span className="font-normal text-slate-400">(pisahkan dengan spasi, maks 5)</span>
            </label>
            <input
              id="post-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react typescript dasar"
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submit}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
            >
              Posting ke Circle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
