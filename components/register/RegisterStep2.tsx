"use client";

import { useState } from "react";
import { LEVELS, type LearnSkill, type RegisterData, type TeachSkill } from "./types";

const teachSuggestions: TeachSkill[] = [
  { name: "Python Dasar", icon: "terminal", level: "Pemula" },
  { name: "Algoritma & Pemrograman", icon: "functions", level: "Pemula" },
  { name: "Basis Data MySQL", icon: "database", level: "Pemula" },
  { name: "Jaringan Komputer", icon: "lan", level: "Pemula" },
  { name: "Mobile Flutter", icon: "smartphone", level: "Pemula" },
  { name: "Machine Learning", icon: "psychology", level: "Pemula" },
];

const learnSuggestions: LearnSkill[] = [
  { name: "Statistika & Probabilitas", icon: "query_stats" },
  { name: "Kecerdasan Buatan (AI)", icon: "smart_toy" },
  { name: "Cloud Computing (AWS)", icon: "cloud" },
  { name: "Keamanan Siber", icon: "security" },
  { name: "Kriptografi", icon: "key" },
];

const availabilityOptions = ["Senin - Jumat Sore", "Akhir Pekan (Sabtu/Minggu)", "Jam Kosong Kuliah"];

const studyModes = [
  { value: "online", label: "Online (Meet/Discord)" },
  { value: "offline", label: "Tatap Muka Kampus" },
  { value: "hybrid", label: "Fleksibel (Hybrid)" },
] as const;

export function RegisterStep2({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: RegisterData;
  onChange: (patch: Partial<RegisterData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [teachQuery, setTeachQuery] = useState("");
  const [learnQuery, setLearnQuery] = useState("");

  const remainingTeach = teachSuggestions.filter(
    (s) => !data.teachSkills.some((t) => t.name === s.name)
  );
  const remainingLearn = learnSuggestions.filter(
    (s) => !data.learnSkills.some((l) => l.name === s.name)
  );

  const addTeach = (skill: TeachSkill) =>
    onChange({ teachSkills: [...data.teachSkills, skill] });
  const removeTeach = (name: string) =>
    onChange({ teachSkills: data.teachSkills.filter((t) => t.name !== name) });
  const cycleLevel = (name: string) =>
    onChange({
      teachSkills: data.teachSkills.map((t) =>
        t.name === name
          ? { ...t, level: LEVELS[(LEVELS.indexOf(t.level) + 1) % LEVELS.length] }
          : t
      ),
    });
  const addLearn = (skill: LearnSkill) =>
    onChange({ learnSkills: [...data.learnSkills, skill] });
  const removeLearn = (name: string) =>
    onChange({ learnSkills: data.learnSkills.filter((l) => l.name !== name) });

  const submitTeach = () => {
    const name = teachQuery.trim();
    if (!name) return;
    if (!data.teachSkills.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      addTeach({ name, icon: "bolt", level: "Pemula" });
    }
    setTeachQuery("");
  };
  const submitLearn = () => {
    const name = learnQuery.trim();
    if (!name) return;
    if (!data.learnSkills.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      addLearn({ name, icon: "school" });
    }
    setLearnQuery("");
  };

  const valid = data.teachSkills.length >= 1;

  return (
    <div className="max-w-md mx-auto w-full animate-[fade-up_0.4s_ease-out_both]">
      <div className="mb-6">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tentukan Keahlian &amp; Minat Belajar 🎯
        </h1>
        <p className="mt-2 font-body-md text-sm text-slate-600">
          Pilih skill yang kamu kuasai untuk diajarkan dan skill yang ingin kamu
          pelajari dari sesama mahasiswa FILKOM.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onNext();
        }}
      >
        {/* Bagian 1: Skill diajarkan */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-label-code uppercase tracking-wider text-indigo-600 font-bold block">
                Bagian 1
              </span>
              <h3 className="font-headline-sm font-bold text-slate-900 text-[15px]">
                Skill yang Bisa Kamu Ajarkan (Tawarkan Barter)
              </h3>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-label-code font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              Minimal pilih 1 skill
            </span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={teachQuery}
              onChange={(e) => setTeachQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitTeach())}
              placeholder="Cari atau tambah skill (cth: Web Programming, UI/UX, Python...)"
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-label-code text-slate-500 font-medium">Skill Terpilih:</div>
            <div className="flex flex-wrap gap-2">
              {data.teachSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">{skill.icon}</span>
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => cycleLevel(skill.name)}
                    title="Klik untuk ubah level"
                    className="text-[10px] font-label-code px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {skill.level}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTeach(skill.name)}
                    aria-label={`Hapus ${skill.name}`}
                    className="text-indigo-400 hover:text-rose-500 transition-colors ml-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
              {data.teachSkills.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada skill terpilih.</p>
              )}
            </div>
          </div>

          {remainingTeach.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] text-slate-400">Rekomendasi skill untuk ditambah:</div>
              <div className="flex flex-wrap gap-1.5">
                {remainingTeach.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => addTeach(s)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 text-[11px] font-medium transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bagian 2: Skill dipelajari */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-label-code uppercase tracking-wider text-emerald-600 font-bold block">
                Bagian 2
              </span>
              <h3 className="font-headline-sm font-bold text-slate-900 text-[15px]">
                Skill / Mata Kuliah yang Ingin Kamu Pelajari
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-emerald-500">auto_awesome</span>
              Smart match aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500 -mt-1">
            Sistem akan mencocokkan kamu dengan mahasiswa yang menguasai topik ini.
          </p>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={learnQuery}
              onChange={(e) => setLearnQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitLearn())}
              placeholder="Tambah topik yang ingin dipelajari..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.learnSkills.map((skill) => (
              <div
                key={skill.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">{skill.icon}</span>
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeLearn(skill.name)}
                  aria-label={`Hapus ${skill.name}`}
                  className="text-emerald-500 hover:text-rose-500 transition-colors ml-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>

          {remainingLearn.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] text-slate-400">Pilihan topik populer lainnya:</div>
              <div className="flex flex-wrap gap-1.5">
                {remainingLearn.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => addLearn(s)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 text-slate-600 text-[11px] font-medium transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bagian 3: Preferensi */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-label-code uppercase tracking-wider text-slate-500 font-bold block">
            Bagian 3: Preferensi Belajar Bareng
          </span>

          <div>
            <label className="block text-[11px] font-label-code text-slate-500 font-medium mb-1.5">
              Mode Belajar Pilihan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {studyModes.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    data.studyMode === m.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-300 bg-white hover:border-indigo-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="studyMode"
                    value={m.value}
                    checked={data.studyMode === m.value}
                    onChange={() => onChange({ studyMode: m.value })}
                    className="text-indigo-600 focus:ring-indigo-600/20"
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      data.studyMode === m.value ? "text-indigo-700 font-semibold" : "text-slate-700"
                    }`}
                  >
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-label-code text-slate-500 font-medium mb-1.5">
              Ketersediaan Waktu
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((opt) => {
                const checked = data.availability.includes(opt);
                return (
                  <label
                    key={opt}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer text-[11px] font-medium transition-all ${
                      checked
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onChange({
                          availability: checked
                            ? data.availability.filter((a) => a !== opt)
                            : [...data.availability, opt],
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-600/20 border-slate-300 w-4 h-4"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-headline-sm font-semibold text-sm transition-all text-center inline-flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Langkah 1</span>
          </button>
          <button
            type="submit"
            disabled={!valid}
            className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-headline-sm font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Lanjut ke Konfirmasi (Langkah 3)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
