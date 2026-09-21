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
  teachSkills: [],
  learnSkills: [],
  studyMode: "hybrid",
  availability: [],
};

export const LEVELS: SkillLevel[] = ["Pemula", "Menengah", "Mahir"];
