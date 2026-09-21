"use client";

// ============================================================
// ReportDialog — dialog lapor universal (post, jawaban, room,
// event, profil, pesan). Kategori + detail opsional + nomor laporan.
// ============================================================

import { useState } from "react";

const REASONS = [
  { id: "spam", label: "Spam / promosi" },
  { id: "harassment", label: "Pelecehan / ujaran kebencian" },
  { id: "misinfo", label: "Misinformasi" },
  { id: "inappropriate", label: "Konten tidak pantas" },
  { id: "other", label: "Lainnya" },
] as const;

export function makeReportRef() {
  return `FB-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function ReportDialog({
  title,
  onClose,
  onSubmit,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (reason: string, detail: string, ref: string) => void;
}) {
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Laporan terkirim">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
          <h3 className="mt-2 font-headline-sm text-lg font-bold text-slate-900">Laporan terkirim</h3>
          <p className="mt-1 text-sm text-slate-600">
            Nomor laporan <span className="font-label-code font-bold text-slate-900">{done}</span>. Moderator akan meninjau dalam 1×24 jam. Tindakan diambil secara privasi.
          </p>
          <button type="button" onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Laporkan konten">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-slate-900">Laporkan</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">{title}</p>
          </div>
          <button type="button" aria-label="Tutup" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="mt-4 text-xs font-bold text-slate-700 uppercase tracking-wide">Kategori pelanggaran</p>
        <div className="mt-2 space-y-1.5">
          {REASONS.map((r) => (
            <label
              key={r.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                reason === r.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input type="radio" name="report-reason" value={r.id} checked={reason === r.id} onChange={() => setReason(r.id)} className="accent-indigo-600" />
              <span className="text-sm text-slate-800">{r.label}</span>
            </label>
          ))}
        </div>

        <label htmlFor="report-detail" className="block mt-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
          Detail tambahan (opsional)
        </label>
        <textarea
          id="report-detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={2}
          placeholder="Jelaskan konteks kalau ada…"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        <p className="mt-3 text-[11px] text-slate-500">Laporan diteruskan ke moderator circle & admin. Penyalahgunaan laporan juga bisa dikenai sanksi.</p>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Batal
          </button>
          <button
            type="button"
            disabled={!reason}
            onClick={() => {
              const ref = makeReportRef();
              setDone(ref);
              onSubmit(reason, detail, ref);
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Kirim Laporan
          </button>
        </div>
      </div>
    </div>
  );
}
