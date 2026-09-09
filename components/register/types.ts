export type SkillLevel = "Pemula" | "Menengah" | "Mahir";

export type TeachSkill = {
  name: string;
  icon: string;
  level: SkillLevel;
};

export type LearnSkill = {
  name: string;
  icon: string;
};

export type StudyMode = "online" | "offline" | "hybrid";

export type RegisterData = {
  fullName: string;
  nim: string;
  email: string;
  prodi: string;
  password: string;
  teachSkills: TeachSkill[];
  learnSkills: LearnSkill[];
  studyMode: StudyMode;
  availability: string[];
};

export const initialRegisterData: RegisterData = {
  fullName: "",
  nim: "",
  email: "",
  prodi: "",
  password: "",
  teachSkills: [
    { name: "Web Development (HTML/CSS, React)", icon: "code", level: "Menengah" },
    { name: "Desain UI/UX (Figma)", icon: "palette", level: "Mahir" },
  ],
  learnSkills: [
    { name: "Kalkulus Informatika", icon: "calculate" },
    { name: "Struktur Data & Algoritma", icon: "account_tree" },
  ],
  studyMode: "hybrid",
  availability: ["Senin - Jumat Sore", "Akhir Pekan (Sabtu/Minggu)"],
};

export const LEVELS: SkillLevel[] = ["Pemula", "Menengah", "Mahir"];
