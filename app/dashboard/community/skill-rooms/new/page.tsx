"use client";

// ============================================================
// Create Skill Room — form → createRoom → redirect ke room baru
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useCommunity } from "@/lib/communityStore";
import {
  ROOM_TYPE_META,
  generateMeetCode,
  type RoomType,
} from "@/lib/communityData";
import { useStore } from "@/lib/store";

const LEVELS = ["Pemula", "Menengah", "Mahir"] as const;
const DURATIONS = [45, 60, 90, 120] as const;
const TYPE_ORDER: RoomType[] = Object.keys(ROOM_TYPE_META) as RoomType[];
const MODES = [
  { id: "online", label: "Online", icon: "videocam", hint: "Sepenuhnya via Google Meet" },
  { id: "offline", label: "Offline", icon: "location_on", hint: "Tatap muka di kampus" },
  { id: "hybrid", label: "Hybrid", icon: "laptop_mac", hint: "Dua-duanya — Meet + ruangan" },
] as const;

// datetime-local value → ISO string (waktu lokal)
function localInputToIso(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function NewRoomPage() {
  const router = useRouter();
  const { createRoom } = useCommunity();
  const { user } = useStore();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<RoomType>("study");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Pemula");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [error, setError] = useState("");
  // Kesiapan sesi
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("online");
  const [sessionLocal, setSessionLocal] = useState("");
  const [durationMin, setDurationMin] = useState<(typeof DURATIONS)[number]>(60);
  const [location, setLocation] = useState("");
  const [recurring, setRecurring] = useState<"sekali" | "mingguan">("sekali");
  const [withMeet, setWithMeet] = useState(true);

  const dayPreview = (() => {
    if (!sessionLocal) return "";
    const d = new Date(sessionLocal);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  })();

  const submit = () => {
    if (!title.trim() || title.trim().length < 8) {
      setError("Judul minimal 8 karakter supaya buddy lain langsung paham.");
      return;
    }
    if (!skill.trim() || !description.trim() || description.trim().length < 20) {
      setError("Skill wajib diisi dan deskripsi minimal 20 karakter — jelaskan rencana sesinya.");
      return;
    }
    if (!sessionLocal) {
      setError("Tentukan tanggal & jam sesi pertama agar peserta bisa menyiapkan waktu.");
      return;
    }
    const sessionAt = localInputToIso(sessionLocal);
    if (sessionAt && new Date(sessionAt).getTime() < Date.now()) {
      setError("Sesi pertama tidak boleh di masa lalu. Pilih waktu yang akan datang.");
      return;
    }
    if ((mode === "offline" || mode === "hybrid") && !location.trim()) {
      setError("Mode offline/hybrid butuh lokasi ruangan (mis. Lab C-2, Perpustakaan).");
      return;
    }
    const modeLabel = MODES.find((m) => m.id === mode)?.label ?? "Online";
    createRoom({
      title: title.trim(),
      type,
      skill: skill.trim(),
      level,
      description: description.trim(),
      dayLabel: dayPreview ? `${dayPreview} · ${modeLabel}` : `${modeLabel}`,
      capacity,
      host: user?.name ?? "Kamu",
      hostProdi: user?.prodi ?? "IF",
      sessionAt,
      durationMin,
      mode,
      location: mode === "online" ? undefined : location.trim() || undefined,
      meetLink: withMeet && mode !== "offline" ? `https://meet.google.com/${generateMeetCode()}` : undefined,
      recurring,
    });
    router.push("/dashboard/community/skill-rooms");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <div>
          <h1 className="font-headline-lg text-2xl font-extrabold text-slate-900 tracking-tight">Buat Skill Room</h1>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
            Room yang bagus itu spesifik: satu skill, jadwal jelas, kapasitas realistis. Mulai kecil dulu — 4–6 orang
            biasanya paling nyaman buat belajar bareng.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div>
            <label htmlFor="room-title" className="text-xs font-bold text-slate-700">
              Judul room
            </label>
            <input
              id="room-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Contoh: Latihan soal Struktur Data bareng"
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Tipe room</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {ROOM_TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="room-skill" className="text-xs font-bold text-slate-700">
                Skill utama
              </label>
              <input
                id="room-skill"
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Contoh: Python, Figma, Basis Data"
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="room-level" className="text-xs font-bold text-slate-700">
                Level
              </label>
              <select
                id="room-level"
                value={level}
                onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="room-desc" className="text-xs font-bold text-slate-700">
              Deskripsi & rencana sesi
            </label>
            <textarea
              id="room-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="Apa yang akan dibahas tiap sesi? Apa yang perlu disiapkan peserta?"
              className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Mode sesi</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    mode === m.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${mode === m.id ? "text-indigo-700" : "text-slate-700"}`}>
                    <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                    {m.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500 leading-snug">{m.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="room-session" className="text-xs font-bold text-slate-700">
                Tanggal &amp; jam sesi pertama
              </label>
              <input
                id="room-session"
                type="datetime-local"
                required
                value={sessionLocal}
                onChange={(e) => setSessionLocal(e.target.value)}
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {dayPreview && (
                <p className="mt-1 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">event_available</span>
                  {dayPreview}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="room-duration" className="text-xs font-bold text-slate-700">
                Durasi sesi
              </label>
              <select
                id="room-duration"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value) as (typeof DURATIONS)[number])}
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} menit
                  </option>
                ))}
              </select>
              <label htmlFor="room-recurring" className="mt-3 block text-xs font-bold text-slate-700">
                Berulang?
              </label>
              <select
                id="room-recurring"
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as "sekali" | "mingguan")}
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="sekali">Sekali saja</option>
                <option value="mingguan">Mingguan (rutin)</option>
              </select>
            </div>
          </div>

          {(mode === "offline" || mode === "hybrid") && (
            <div>
              <label htmlFor="room-location" className="text-xs font-bold text-slate-700">
                Lokasi ruangan
              </label>
              <input
                id="room-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={120}
                placeholder="Contoh: Lab C-2, Gd. Informatika"
                className="mt-1.5 w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {mode !== "offline" && (
            <div className={`p-4 rounded-xl border transition-colors ${withMeet ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withMeet}
                  onChange={(e) => setWithMeet(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">videocam</span>
                    Sediakan ruang Google Meet
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-600 leading-relaxed">
                    {withMeet
                      ? "Link Meet dibuat otomatis dan dibuka untuk peserta 10 menit sebelum sesi. Kamu (host) bisa menggantinya dengan Meet dari Google Workspace kampus kapan saja."
                      : "Tanpa Meet — peserta akan diingatkan untuk koordinasi via diskusi room."}
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="room-cap" className="text-xs font-bold text-slate-700">
                Kapasitas: <span className="text-indigo-600">{capacity} orang</span>
              </label>
              <input
                id="room-cap"
                type="range"
                min={3}
                max={10}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-3 w-full accent-indigo-600"
              />
              <p className="font-label-code text-[10px] text-slate-400">3–10 peserta, tanpa kamu sebagai host</p>
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/dashboard/community/skill-rooms"
              className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </Link>
            <button
              type="button"
              onClick={submit}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
            >
              Buat Room
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
