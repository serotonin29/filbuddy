// ============================================================
// FilBuddy Community — tipe & data dummy mahasiswa FILKOM
// (session-only; nanti digantikan tabel Supabase)
// ============================================================

export type Prodi = "IF" | "SI" | "SK" | "MI";
export type BuddyType = "learning" | "project" | "discussion" | "random";

export type CircleCategory = "teknologi" | "desain" | "akademik" | "karier" | "santai";

export const CIRCLE_CATEGORIES: { id: CircleCategory | "semua"; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "teknologi", label: "Teknologi" },
  { id: "desain", label: "Desain" },
  { id: "akademik", label: "Akademik" },
  { id: "karier", label: "Karier" },
  { id: "santai", label: "Santai" },
];

export type CircleResource = {
  id: number;
  title: string;
  kind: "pdf" | "link" | "video" | "repo";
  by: string;
};

export type CircleEventItem = {
  id: number;
  title: string;
  dateLabel: string;
  mode: "Online" | "Offline";
};

export type Circle = {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  iconClass: string;
  description: string;
  members: number;
  tags: string[];
  category: CircleCategory;
  weeklyPosts: number;
  resources: CircleResource[];
  events: CircleEventItem[];
  activeRoomId?: string;
  memberNames: { name: string; prodi: Prodi; moderator?: boolean }[];
};

export type CirclePostType = "discussion" | "question" | "resource" | "buddy" | "project" | "announcement";

export const POST_TYPE_META: Record<CirclePostType, { label: string; chip: string; icon: string }> = {
  discussion: { label: "Discussion", chip: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "forum" },
  question: { label: "Question", chip: "bg-amber-50 text-amber-700 border-amber-200", icon: "help" },
  resource: { label: "Share Resource", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "library_books" },
  buddy: { label: "Looking for Buddy", chip: "bg-sky-50 text-sky-700 border-sky-200", icon: "group_add" },
  project: { label: "Project Idea", chip: "bg-violet-50 text-violet-700 border-violet-200", icon: "rocket_launch" },
  announcement: { label: "Announcement", chip: "bg-rose-50 text-rose-700 border-rose-200", icon: "campaign" },
};

export type CircleComment = {
  id: number;
  author: string;
  prodi: Prodi;
  minutesAgo: number;
  content: string;
};

export type CirclePost = {
  id: number;
  circleId: string;
  author: string;
  authorProdi: Prodi;
  type: CirclePostType;
  title: string;
  content: string;
  tags: string[];
  minutesAgo: number;
  helpful: number;
  comments: CircleComment[];
  pinned?: boolean;
  authorModerator?: boolean;
  mine?: boolean;
};

export type RoomType =
  | "study"
  | "teach"
  | "practice"
  | "coding"
  | "design"
  | "project"
  | "exam";

export const ROOM_TYPE_META: Record<RoomType, { label: string; chip: string }> = {
  study: { label: "Study Together", chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  teach: { label: "Teach a Skill", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  practice: { label: "Practice Session", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  coding: { label: "Coding Session", chip: "bg-sky-50 text-sky-700 border-sky-200" },
  design: { label: "Design Review", chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  project: { label: "Project Session", chip: "bg-violet-50 text-violet-700 border-violet-200" },
  exam: { label: "Exam Preparation", chip: "bg-rose-50 text-rose-700 border-rose-200" },
};

export type RoomStatus = "open" | "almost" | "full" | "finished";

export const ROOM_STATUS_META: Record<RoomStatus, { label: string; dot: string; chip: string }> = {
  open: { label: "Open", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  almost: { label: "Almost Full", dot: "bg-amber-400", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  full: { label: "Full", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
  finished: { label: "Finished", dot: "bg-slate-300", chip: "bg-slate-100 text-slate-500 border-slate-200" },
};

export type SkillRoom = {
  id: string;
  type: RoomType;
  title: string;
  host: string;
  hostProdi: Prodi;
  skill: string;
  level: "Pemula" | "Menengah" | "Mahir" | "Beginner" | "Intermediate" | "Advanced";
  description: string;
  topics: string[];
  dayLabel: string;
  inDays: number;
  capacity: number;
  participantNames: string[];
  resources: CircleResource[];
  discussion: CircleComment[];
  finished?: boolean;
  // Kesiapan sesi (Google Meet)
  sessionAt?: string; // ISO datetime sesi pertama
  durationMin?: number;
  mode?: "online" | "offline" | "hybrid";
  location?: string; // ruangan bila offline/hybrid
  meetLink?: string; // tautan Google Meet (host yang menautkan)
  recurring?: "sekali" | "mingguan";
};

// ==== UTIL SESI / GOOGLE MEET ====

export function generateMeetCode(): string {
  const abc = "abcdefghijkmnopqrstuvwxyz";
  const pick = (n: number) =>
    Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

export type MeetState = "belum" | "hampir" | "live" | "selesai" | "tanpa-link";

export function meetStateOf(
  room: Pick<SkillRoom, "sessionAt" | "durationMin" | "meetLink">,
  now = Date.now()
): MeetState {
  if (!room.sessionAt) return "tanpa-link";
  const start = new Date(room.sessionAt).getTime();
  if (Number.isNaN(start)) return "tanpa-link";
  const dur = (room.durationMin ?? 60) * 60_000;
  if (!room.meetLink) return "tanpa-link";
  if (now < start - 10 * 60_000) return "belum";
  if (now < start) return "hampir";
  if (now < start + dur) return "live";
  return "selesai";
}

export function formatSessionAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesUntil(iso: string, now = Date.now()): number {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.round((start - now) / 60_000);
}

// Unduh .ics sederhana untuk kalender (Google Calendar dkk.)
export function downloadIcs(room: {
  title: string;
  description: string;
  sessionAt?: string;
  durationMin?: number;
  meetLink?: string;
  location?: string;
}) {
  if (!room.sessionAt) return;
  const start = new Date(room.sessionAt);
  const end = new Date(start.getTime() + (room.durationMin ?? 60) * 60_000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
      d.getUTCDate()
    ).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}00Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FilBuddy//Skill Room//ID",
    "BEGIN:VEVENT",
    `UID:${room.title.replace(/\s+/g, "-").toLowerCase()}-${start.getTime()}@filbuddy`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:FilBuddy — ${room.title}`,
    `DESCRIPTION:${(room.description ?? "").slice(0, 180)}${room.meetLink ? `\\nJoin: ${room.meetLink}` : ""}`,
    `LOCATION:${room.meetLink ?? room.location ?? "Online"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "filbuddy-session.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type EventCategory =
  | "Workshop"
  | "Seminar"
  | "Competition"
  | "Hackathon"
  | "Study Session"
  | "Community Meetup"
  | "Webinar"
  | "Open Recruitment"
  | "Campus Event";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Workshop",
  "Seminar",
  "Competition",
  "Hackathon",
  "Study Session",
  "Community Meetup",
  "Webinar",
  "Open Recruitment",
  "Campus Event",
];

export type CommunityEvent = {
  id: string;
  name: string;
  organizer: string;
  category: EventCategory;
  inDays: number;
  timeLabel: string;
  location: string;
  isOnline: boolean;
  interested: number;
  gradient: string;
  icon: string;
  description: string;
  regUrl: string;
  goingNames: string[];
  capacity?: number; // kuota peserta; undefined = tanpa batas
};

export type Buddy = {
  id: string;
  name: string;
  prodi: Prodi;
  semester: number;
  knows: string[];
  learning: string[];
  interests: string[];
  circles: string[];
  goals: string;
  buddyTypes: BuddyType[];
  stats: { helped: number; hosted: number; joined: number; answers: number; projects: number; resources: number };
};

// ==== CIRCLES ====

export const SEED_CIRCLES: Circle[] = [
  {
    id: "web-dev",
    name: "Web Development",
    icon: "code",
    gradient: "from-indigo-500 to-indigo-700",
    iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
    description: "Belajar & berbagi seputar frontend, backend, dan segala hal web. Sharing link, code review, dan project bareng.",
    members: 248,
    tags: ["React", "Laravel", "Node.js"],
    category: "teknologi",
    weeklyPosts: 14,
    activeRoomId: "learn-react-together",
    resources: [
      { id: 1, title: "Roadmap Backend Developer 2026", kind: "link", by: "Diki Wahyudi" },
      { id: 2, title: "Catatan Fetch API & Async Await", kind: "pdf", by: "Raka Pratama" },
      { id: 3, title: "Repositori Latihan CRUD Filkom", kind: "repo", by: "Andi Saputra" },
    ],
    events: [
      { id: 1, title: "Kopdar Web Dev: Ngobrolin Next.js", dateLabel: "Sab, 26 Sep · 16:00", mode: "Offline" },
      { id: 2, title: "Live Coding: Deploy ke Vercel", dateLabel: "Kam, 1 Okt · 19:30", mode: "Online" },
    ],
    memberNames: [
      { name: "Andi Saputra", prodi: "IF", moderator: true },
      { name: "Raka Pratama", prodi: "IF" },
      { name: "Diki Wahyudi", prodi: "IF" },
      { name: "Maya Rosalina", prodi: "SI" },
      { name: "Fajar Ramadhan", prodi: "IF" },
      { name: "Intan Permata", prodi: "MI" },
    ],
  },
  {
    id: "uiux",
    name: "UI/UX Design",
    icon: "palette",
    gradient: "from-pink-500 to-rose-500",
    iconClass: "bg-pink-50 text-pink-600 border-pink-200",
    description: "Tempat latihan desain, tukar feedback figma, dan belajar user research bareng. Design review tiap pekan!",
    members: 186,
    tags: ["Figma", "Design System", "UX Research"],
    category: "desain",
    weeklyPosts: 9,
    activeRoomId: "figma-clinic",
    resources: [
      { id: 4, title: "Kumpulan Wireframe Kit Gratis", kind: "link", by: "Sarah Azzahra" },
      { id: 5, title: "Rekaman Design Review #12", kind: "video", by: "Maya Rosalina" },
    ],
    events: [
      { id: 3, title: "Design Sprint Mini: Redesign SIAKAD", dateLabel: "Min, 27 Sep · 13:00", mode: "Offline" },
    ],
    memberNames: [
      { name: "Sarah Azzahra", prodi: "SI", moderator: true },
      { name: "Maya Rosalina", prodi: "SI" },
      { name: "Raka Pratama", prodi: "IF" },
      { name: "Nadia Putri", prodi: "SI" },
      { name: "Intan Permata", prodi: "MI" },
    ],
  },
  {
    id: "cyber",
    name: "Cyber Security",
    icon: "security",
    gradient: "from-slate-600 to-slate-800",
    iconClass: "bg-slate-100 text-slate-700 border-slate-200",
    description: "CTF, ethical hacking, dan hardening aplikasi. Mulai dari nol tapi serius — write-up dibagikan tiap sesi.",
    members: 132,
    tags: ["CTF", "Networking", "Linux"],
    category: "teknologi",
    weeklyPosts: 7,
    activeRoomId: "dsa-drill",
    resources: [
      { id: 6, title: "Write-up CTF Beginner Cup 2025", kind: "pdf", by: "Bima Aryasatya" },
      { id: 7, title: "Lab Virtual Latihan Nmap", kind: "link", by: "Rizky Hidayat" },
    ],
    events: [
      { id: 4, title: "Rapat Persiapan CTF Beginner Cup", dateLabel: "Rab, 30 Sep · 19:00", mode: "Online" },
    ],
    memberNames: [
      { name: "Bima Aryasatya", prodi: "SK", moderator: true },
      { name: "Rizky Hidayat", prodi: "SK" },
      { name: "Fajar Ramadhan", prodi: "IF" },
      { name: "Andi Saputra", prodi: "IF" },
    ],
  },
  {
    id: "aiml",
    name: "AI & Machine Learning",
    icon: "psychology",
    gradient: "from-violet-500 to-purple-700",
    iconClass: "bg-violet-50 text-violet-600 border-violet-200",
    description: "Dari Python dasar sampai paper reading. Fokus memahami konsep, bukan sekadar menyalin kode.",
    members: 154,
    tags: ["Python", "Pandas", "Scikit-learn"],
    category: "teknologi",
    weeklyPosts: 8,
    activeRoomId: "ml-study",
    resources: [
      { id: 8, title: "Notebook Latihan Regresi Linier", kind: "repo", by: "Nadia Putri" },
      { id: 9, title: "Playlist Statistika untuk ML", kind: "video", by: "Rizky Hidayat" },
    ],
    events: [
      { id: 5, title: "Diskusi Paper: Transformer 101", dateLabel: "Min, 28 Sep · 20:00", mode: "Online" },
    ],
    memberNames: [
      { name: "Nadia Putri", prodi: "SI", moderator: true },
      { name: "Rizky Hidayat", prodi: "SK" },
      { name: "Sarah Azzahra", prodi: "SI" },
      { name: "Bima Aryasatya", prodi: "SK" },
    ],
  },
  {
    id: "gamedev",
    name: "Game Development",
    icon: "sports_esports",
    gradient: "from-amber-500 to-orange-500",
    iconClass: "bg-amber-50 text-amber-600 border-amber-200",
    description: "Unity, Godot, dan game jam internal. Buat game kecil bareng tiap bulan — yang penting jadi!",
    members: 97,
    tags: ["Unity", "Godot", "Game Design"],
    category: "teknologi",
    weeklyPosts: 5,
    resources: [
      { id: 10, title: "Asset Pack Pixel Art CC0", kind: "link", by: "Fajar Ramadhan" },
    ],
    events: [
      { id: 6, title: "Mini Game Jam: 48 Jam", dateLabel: "Sab, 4 Okt · 09:00", mode: "Offline" },
    ],
    memberNames: [
      { name: "Fajar Ramadhan", prodi: "IF", moderator: true },
      { name: "Raka Pratama", prodi: "IF" },
      { name: "Bima Aryasatya", prodi: "SK" },
    ],
  },
  {
    id: "cp",
    name: "Competitive Programming",
    icon: "emoji_events",
    gradient: "from-sky-500 to-blue-600",
    iconClass: "bg-sky-50 text-sky-600 border-sky-200",
    description: "Latihan rutin soal algoritma, virtual contest tiap Sabtu, dan persiapan ACM-ICPC.",
    members: 121,
    tags: ["Algoritma", "C++", "ICPC"],
    category: "teknologi",
    weeklyPosts: 6,
    activeRoomId: "uas-basisdata",
    resources: [
      { id: 11, title: "Kumpulan Soal Dynamic Programming", kind: "pdf", by: "Raka Pratama" },
      { id: 12, title: "Template STL C++ Wajib Hafal", kind: "repo", by: "Bima Aryasatya" },
    ],
    events: [
      { id: 7, title: "Virtual Contest #18", dateLabel: "Sab, 26 Sep · 14:00", mode: "Online" },
    ],
    memberNames: [
      { name: "Raka Pratama", prodi: "IF", moderator: true },
      { name: "Bima Aryasatya", prodi: "SK" },
      { name: "Fajar Ramadhan", prodi: "IF" },
      { name: "Nadia Putri", prodi: "SI" },
    ],
  },
  {
    id: "academic",
    name: "Academic Survival",
    icon: "school",
    gradient: "from-emerald-500 to-teal-600",
    iconClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    description: "Tips kuliah, rangkuman matkul, dan strategi UTS/UAS. Semua tentang selamat di Filkom.",
    members: 302,
    tags: ["Rangkuman", "UTS/UAS", "Tips Kuliah"],
    category: "akademik",
    weeklyPosts: 11,
    activeRoomId: "uas-basisdata",
    resources: [
      { id: 13, title: "Rangkuman Basis Data (Lengkap)", kind: "pdf", by: "Bima Aryasatya" },
      { id: 14, title: "Peta Situasi Dosen & Tugas", kind: "link", by: "Intan Permata" },
    ],
    events: [
      { id: 8, title: "Study Group UTS Semester Ganjil", dateLabel: "Sen, 28 Sep · 17:00", mode: "Offline" },
    ],
    memberNames: [
      { name: "Intan Permata", prodi: "MI", moderator: true },
      { name: "Nadia Putri", prodi: "SI" },
      { name: "Maya Rosalina", prodi: "SI" },
      { name: "Rizky Hidayat", prodi: "SK" },
      { name: "Fajar Ramadhan", prodi: "IF" },
    ],
  },
  {
    id: "career",
    name: "Career & Internship",
    icon: "work",
    gradient: "from-cyan-500 to-sky-600",
    iconClass: "bg-cyan-50 text-cyan-600 border-cyan-200",
    description: "Info magang, review CV, latihan interview, dan sharing pengalaman senior yang sudah kerja.",
    members: 175,
    tags: ["CV", "Interview", "Magang"],
    category: "karier",
    weeklyPosts: 6,
    resources: [
      { id: 15, title: "Template CV ATS-Friendly", kind: "pdf", by: "Maya Rosalina" },
      { id: 16, title: "Daftar Perusahaan Magang Batch Ganjil", kind: "link", by: "Intan Permata" },
    ],
    events: [
      { id: 9, title: "Sesi Review CV Bareng Alumni", dateLabel: "Jum, 2 Okt · 19:00", mode: "Online" },
    ],
    memberNames: [
      { name: "Maya Rosalina", prodi: "SI", moderator: true },
      { name: "Intan Permata", prodi: "MI" },
      { name: "Diki Wahyudi", prodi: "IF" },
      { name: "Sarah Azzahra", prodi: "SI" },
    ],
  },
  {
    id: "creative",
    name: "Creative Technology",
    icon: "auto_awesome",
    gradient: "from-fuchsia-500 to-pink-600",
    iconClass: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
    description: "Perpotongan seni & teknologi: creative coding, instalasi interaktif, motion, dan generative art.",
    members: 88,
    tags: ["Creative Coding", "p5.js", "Motion"],
    category: "desain",
    weeklyPosts: 4,
    resources: [
      { id: 17, title: "Galeri Sketch p5.js Anggota", kind: "repo", by: "Sarah Azzahra" },
    ],
    events: [
      { id: 10, title: "Showcase Proyek Interaktif", dateLabel: "Sab, 10 Okt · 15:00", mode: "Offline" },
    ],
    memberNames: [
      { name: "Sarah Azzahra", prodi: "SI", moderator: true },
      { name: "Maya Rosalina", prodi: "SI" },
      { name: "Fajar Ramadhan", prodi: "IF" },
    ],
  },
  {
    id: "casual",
    name: "Casual FILKOM",
    icon: "coffee",
    gradient: "from-orange-400 to-red-500",
    iconClass: "bg-orange-50 text-orange-600 border-orange-200",
    description: "Ngobrol santai, rekomendasi kuliner sekitar kampus, dan nongkrong bareng. Santai tapi tetap baik.",
    members: 410,
    tags: ["Nongkrong", "Kuliner", "Meme"],
    category: "santai",
    weeklyPosts: 18,
    resources: [
      { id: 18, title: "Peta Warteg Terbaik Sekitar Kampus", kind: "link", by: "Intan Permata" },
    ],
    events: [
      { id: 11, title: "Mabar Mingguan — Bawa Laptop", dateLabel: "Min, 27 Sep · 20:00", mode: "Offline" },
    ],
    memberNames: [
      { name: "Intan Permata", prodi: "MI", moderator: true },
      { name: "Rizky Hidayat", prodi: "SK" },
      { name: "Fajar Ramadhan", prodi: "IF" },
      { name: "Nadia Putri", prodi: "SI" },
      { name: "Raka Pratama", prodi: "IF" },
      { name: "Maya Rosalina", prodi: "SI" },
    ],
  },
];

// ==== SKILL ROOMS ====

// ==== SKILL ROOMS ====

// Seed relatif terhadap waktu buka app supaya demo Meet selalu relevan.
const isoIn = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

export const SEED_ROOMS: SkillRoom[] = [
  {
    id: "learn-react-together",
    type: "study",
    title: "Learn React Together",
    host: "Andi Saputra",
    hostProdi: "IF",
    skill: "React",
    level: "Beginner",
    description: "Belajar React dari nol bareng, pelan-pelan dan tanya bebas. Tiap sesi ada latihan kecil yang dikerjakan bersama.",
    topics: ["React Basics", "Components", "Hooks"],
    dayLabel: "Jumat, 19:00",
    inDays: 1,
    capacity: 10,
    sessionAt: isoIn(26),
    durationMin: 90,
    mode: "online",
    meetLink: "https://meet.google.com/rct-film-2026",
    recurring: "mingguan",
    participantNames: ["Raka Pratama", "Intan Permata", "Nadia Putri", "Fajar Ramadhan", "Maya Rosalina", "Rizky Hidayat", "Diki Wahyudi"],
    resources: [
      { id: 20, title: "Cheatsheet JSX & Props", kind: "pdf", by: "Andi Saputra" },
      { id: 21, title: "Latihan Sesi 1: Counter", kind: "repo", by: "Andi Saputra" },
    ],
    discussion: [
      { id: 1, author: "Intan Permata", prodi: "MI", minutesAgo: 180, content: "Ka, perlu install Node.js versi berapa?" },
      { id: 2, author: "Andi Saputra", prodi: "IF", minutesAgo: 150, content: "Versi LTS saja aman. Nanti di sesi pertama kita setup bareng kok." },
    ],
  },
  {
    id: "figma-clinic",
    type: "design",
    title: "Figma Design Clinic",
    host: "Sarah Azzahra",
    hostProdi: "SI",
    skill: "UI/UX",
    level: "Pemula",
    description: "Bawa desainmu, kita review bareng secara sehat. Fokus feedback konstruktif, bukan menghakimi.",
    topics: ["Critique", "Auto Layout", "Design System"],
    dayLabel: "Sabtu, 16:00",
    inDays: 2,
    capacity: 10,
    sessionAt: isoIn(50),
    durationMin: 60,
    mode: "hybrid",
    location: "Lab Multimedia, Gd. C Lt. 2",
    participantNames: ["Maya Rosalina", "Raka Pratama", "Nadia Putri", "Intan Permata", "Fajar Ramadhan", "Rizky Hidayat", "Diki Wahyudi", "Bima Aryasatya", "Andi Saputra"],
    resources: [
      { id: 22, title: "Checklist Review Desain", kind: "pdf", by: "Sarah Azzahra" },
    ],
    discussion: [
      { id: 3, author: "Maya Rosalina", prodi: "SI", minutesAgo: 90, content: "Aku bawa redesign landing page kampus ya!" },
    ],
  },
  {
    id: "dsa-drill",
    type: "practice",
    title: "Drill Soal Struktur Data",
    host: "Raka Pratama",
    hostProdi: "IF",
    skill: "Struktur Data",
    level: "Intermediate",
    description: "Kerjakan soal-soal DSA secara timer. Fokus pola penyelesaian dan diskusi kompleksitas.",
    topics: ["Stack & Queue", "Tree", "Graph"],
    dayLabel: "Rabu, 18:30",
    inDays: 0,
    capacity: 10,
    sessionAt: isoIn(0.5),
    durationMin: 60,
    mode: "online",
    meetLink: "https://meet.google.com/dsa-drill-18",
    participantNames: ["Bima Aryasatya", "Fajar Ramadhan", "Nadia Putri", "Andi Saputra", "Rizky Hidayat", "Diki Wahyudi", "Maya Rosalina", "Intan Permata", "Sarah Azzahra", "Rizal Fadli"],
    resources: [],
    discussion: [],
  },
  {
    id: "ml-study",
    type: "study",
    title: "Paper Reading: Intro ML",
    host: "Nadia Putri",
    hostProdi: "SI",
    skill: "Machine Learning",
    level: "Menengah",
    description: "Baca dan bedah satu topik ML per pekan. Tidak perlu jago matematika, yang penting mau paham.",
    topics: ["Regresi", "Klasifikasi", "Overfitting"],
    dayLabel: "Minggu, 20:00",
    inDays: 3,
    capacity: 8,
    participantNames: ["Rizky Hidayat", "Bima Aryasatya", "Sarah Azzahra", "Raka Pratama"],
    resources: [
      { id: 23, title: "Paper: Attention Is All You Need (ringkasan ID)", kind: "pdf", by: "Nadia Putri" },
    ],
    discussion: [
      { id: 4, author: "Rizky Hidayat", prodi: "SK", minutesAgo: 400, content: "Minggu ini lanjut bagian loss function ya, aku sudah baca sambil bingung 😄" },
    ],
  },
  {
    id: "laravel-build",
    type: "coding",
    title: "Build REST API Laravel",
    host: "Diki Wahyudi",
    hostProdi: "IF",
    skill: "Laravel",
    level: "Intermediate",
    description: "Live coding membangun REST API dari scratch sampai deploy. Ikuti sambil code-along.",
    topics: ["Routing", "Eloquent", "Auth Sanctrum"],
    dayLabel: "Kamis, 19:30",
    inDays: 4,
    capacity: 12,
    participantNames: ["Andi Saputra", "Raka Pratama", "Fajar Ramadhan", "Intan Permata", "Maya Rosalina", "Rizal Fadli"],
    resources: [
      { id: 24, title: "Starter Repo Sesi Coding", kind: "repo", by: "Diki Wahyudi" },
    ],
    discussion: [],
  },
  {
    id: "english-speaking",
    type: "teach",
    title: "English Speaking untuk Interview",
    host: "Intan Permata",
    hostProdi: "MI",
    skill: "English",
    level: "Pemula",
    description: "Latihan ngomong Inggris untuk interview kerja & magang. Saling koreksi dengan ramah, one-liner dulu sampai percaya diri.",
    topics: ["Self Introduction", "STAR Method", "Q&A Practice"],
    dayLabel: "Selasa, 19:00",
    inDays: 2,
    capacity: 10,
    participantNames: ["Maya Rosalina", "Raka Pratama", "Nadia Putri", "Bima Aryasatya", "Sarah Azzahra", "Rizky Hidayat", "Fajar Ramadhan", "Diki Wahyudi"],
    resources: [
      { id: 25, title: "60 Pertanyaan Interview Umum", kind: "pdf", by: "Intan Permata" },
    ],
    discussion: [
      { id: 5, author: "Bima Aryasatya", prodi: "SK", minutesAgo: 60, content: "Boleh banget, aku paling deg-degan kalau ditanya 'tell me about yourself'." },
    ],
  },
  {
    id: "uas-basisdata",
    type: "exam",
    title: "Bimbingan UAS Basis Data",
    host: "Bima Aryasatya",
    hostProdi: "SK",
    skill: "Basis Data",
    level: "Pemula",
    description: "Rangkuman inti + latihan soal UAS Basis Data. Dibimbing alumni yang sudah lulus matkul ini.",
    topics: ["Normalisasi", "ERD", "SQL Join"],
    dayLabel: "Senin, 17:00",
    inDays: 5,
    capacity: 15,
    participantNames: ["Intan Permata", "Nadia Putri", "Fajar Ramadhan", "Rizky Hidayat", "Sarah Azzahra", "Maya Rosalina", "Raka Pratama", "Andi Saputra", "Diki Wahyudi", "Rizal Fadli", "Putri Amelia", "Dimas Saputra"],
    resources: [
      { id: 26, title: "Rangkuman Normalisasi 1-3NF", kind: "pdf", by: "Bima Aryasatya" },
    ],
    discussion: [
      { id: 6, author: "Putri Amelia", prodi: "SI", minutesAgo: 30, content: "Kak, soal join yang banyak itu nanti dibahas semua?" },
      { id: 7, author: "Bima Aryasatya", prodi: "SK", minutesAgo: 22, content: "Dibahas pola-palanya, lalu latihan mandiri. Tenang, kita pastikan semua paham." },
    ],
  },
  {
    id: "portfolio-weekend",
    type: "project",
    title: "Weekend Portfolio Sprint",
    host: "Maya Rosalina",
    hostProdi: "SI",
    skill: "Portfolio",
    level: "Menengah",
    description: "Dua hari menuntaskan portfolio online masing-masing. Ada teman, ada mentor, ada deadline palsu yang memotivasi.",
    topics: ["Personal Branding", "Case Study", "Deployment"],
    dayLabel: "Sabtu, 09:00",
    inDays: 6,
    capacity: 10,
    participantNames: ["Sarah Azzahra", "Raka Pratama", "Intan Permata", "Nadia Putri", "Fajar Ramadhan"],
    resources: [],
    discussion: [],
  },
  {
    id: "git-fundamentals",
    type: "teach",
    title: "Git & GitHub Fundamentals",
    host: "Diki Wahyudi",
    hostProdi: "IF",
    skill: "Git",
    level: "Pemula",
    description: "Sesi selesai! Membahas commit, branch, pull request, dan kolaborasi tim kecil.",
    topics: ["Commit", "Branching", "Pull Request"],
    dayLabel: "Selesai · Kamis lalu",
    inDays: -2,
    capacity: 12,
    participantNames: ["Andi Saputra", "Raka Pratama", "Intan Permata", "Fajar Ramadhan", "Maya Rosalina", "Nadia Putri", "Sarah Azzahra"],
    resources: [
      { id: 27, title: "Rekaman Sesi Git Fundamentals", kind: "video", by: "Diki Wahyudi" },
    ],
    discussion: [
      { id: 8, author: "Andi Saputra", prodi: "IF", minutesAgo: 2880, content: "Terima kasih bang Diki, akhirnya paham rebase 😭" },
    ],
    finished: true,
  },
];

// ==== EVENTS ====

export const SEED_EVENTS: CommunityEvent[] = [
  {
    id: "filfest-hackathon",
    name: "FILFEST Hackathon 2026",
    organizer: "Panitia FILFEST",
    category: "Hackathon",
    inDays: 12,
    timeLabel: "08:00 — Selesai besoknya",
    location: "Gedung Utama UPI YPTK Padang",
    isOnline: false,
    interested: 184,
    gradient: "from-rose-500 to-red-600",
    icon: "code_blocks",
    description: "Hackathon 24 jam terbuka untuk semua prodi FILKOM. Bangun produk digital dari nol bareng tim 3-4 orang. Ada pembekalan mentor, makan gratis, dan prize pool menarik.",
    regUrl: "#",
    goingNames: ["Raka Pratama", "Fajar Ramadhan", "Nadia Putri", "Diki Wahyudi", "Sarah Azzahra", "Andi Saputra"],
    capacity: 40,
  },
  {
    id: "react-workshop",
    name: "Workshop React Fundamental",
    organizer: "UKM Programming",
    category: "Workshop",
    inDays: 2,
    timeLabel: "19:00 — 21:00",
    location: "Online — Zoom",
    isOnline: true,
    interested: 96,
    gradient: "from-indigo-500 to-blue-600",
    icon: "terminal",
    description: "Workshop dua sesi memahami React dari dasar: component, state, sampai fetching data. Cocok untuk yang baru pindah dari vanilla JS.",
    regUrl: "#",
    goingNames: ["Raka Pratama", "Intan Permata", "Maya Rosalina"],
    capacity: 30,
  },
  {
    id: "seminar-karier",
    name: "Seminar Karier Tech: Path ke Industri",
    organizer: "Career Center UPI YPTK",
    category: "Seminar",
    inDays: 6,
    timeLabel: "13:00 — 16:00",
    location: "Aula Kampus",
    isOnline: false,
    interested: 143,
    gradient: "from-emerald-500 to-teal-600",
    icon: "work_history",
    description: "Berbagi pengalaman alumni yang kini bekerja di startup dan perusahaan teknologi. Bahas persiapan CV, portofolio, dan simulasi interview singkat.",
    regUrl: "#",
    goingNames: ["Maya Rosalina", "Intan Permata", "Diki Wahyudi"],
  },
  {
    id: "ctf-beginner",
    name: "CTF Beginner Cup",
    organizer: "Cyber Community FILKOM",
    category: "Competition",
    inDays: 9,
    timeLabel: "09:00 — 17:00",
    location: "Online — CTFd",
    isOnline: true,
    interested: 58,
    gradient: "from-slate-600 to-slate-800",
    icon: "shield_lock",
    description: "Kompetisi CTF kategori pemula: web, forensik, dan kriptografi dasar. Tim 2-3 orang, write-up wajib dikumpulkan.",
    regUrl: "#",
    goingNames: ["Bima Aryasatya", "Rizky Hidayat", "Fajar Ramadhan"],
  },
  {
    id: "uiux-webinar",
    name: "Webinar: UI/UX Trends 2026",
    organizer: "Developer Student Club",
    category: "Webinar",
    inDays: 4,
    timeLabel: "16:00 — 17:30",
    location: "Online — Google Meet",
    isOnline: true,
    interested: 87,
    gradient: "from-fuchsia-500 to-pink-600",
    icon: "brush",
    description: "Ngobrol dengan praktisi desain soal tren UI 2026, bagaimana AI mengubah alur kerja desainer, dan portfolio yang dicari recruiter.",
    regUrl: "#",
    goingNames: ["Sarah Azzahra", "Maya Rosalina", "Nadia Putri", "Intan Permata"],
  },
  {
    id: "uts-study",
    name: "Study Session UTS Bersama",
    organizer: "BEM FILKOM",
    category: "Study Session",
    inDays: 3,
    timeLabel: "09:00 — Selesai",
    location: "Perpustakaan Kampus",
    isOnline: false,
    interested: 65,
    gradient: "from-amber-500 to-orange-500",
    icon: "menu_book",
    description: "Belajar bersama menjelang UTS. Disediakan snack, pointer materi per matkul, dan kelompok diskusi lintas angkatan.",
    regUrl: "#",
    goingNames: ["Intan Permata", "Putri Amelia", "Nadia Putri"],
  },
  {
    id: "indie-meetup",
    name: "Meetup: Indie Hacker Mahasiswa",
    organizer: "Komunitas Startup Kampus",
    category: "Community Meetup",
    inDays: 15,
    timeLabel: "19:00 — 21:00",
    location: "Co-working Space Padang",
    isOnline: false,
    interested: 41,
    gradient: "from-violet-500 to-purple-700",
    icon: "diversity_3",
    description: "Berbagi cerita membangun produk digital kecil: dari validasi ide sampai pengguna pertama. Santai, banyak tanya jawab.",
    regUrl: "#",
    goingNames: ["Diki Wahyudi", "Sarah Azzahra", "Raka Pratama"],
  },
  {
    id: "oprec-robotics",
    name: "Open Recruitment UKM Robotics",
    organizer: "UKM Robotics",
    category: "Open Recruitment",
    inDays: 7,
    timeLabel: "10:00 — 15:00",
    location: "Lab Robotika",
    isOnline: false,
    interested: 112,
    gradient: "from-sky-500 to-cyan-600",
    icon: "precision_manufacturing",
    description: "Pendaftaran anggota baru UKM Robotics. Tidak perlu pengalaman — bawa rasa penasaran, sisanya kami ajarkan.",
    regUrl: "#",
    goingNames: ["Bima Aryasatya", "Rizky Hidayat"],
  },
  {
    id: "sports-week",
    name: "FILKOM Sports Week",
    organizer: "Dewan Kesenian & Olahraga",
    category: "Campus Event",
    inDays: 20,
    timeLabel: "Seharian",
    location: "Lapangan Kampus",
    isOnline: false,
    interested: 208,
    gradient: "from-orange-400 to-red-500",
    icon: "sports_soccer",
    description: "Pekan olahraga antar-prodi: futsal, badminton, e-sport, dan lari fun. Dukung tim prodimu atau ikut jadi panitia!",
    regUrl: "#",
    goingNames: ["Fajar Ramadhan", "Rizky Hidayat", "Intan Permata", "Raka Pratama", "Putri Amelia", "Dimas Saputra"],
  },
];

// ==== BUDDIES (kandidat match) ====

export const SEED_BUDDIES: Buddy[] = [
  {
    id: "raka",
    name: "Raka Pratama",
    prodi: "IF",
    semester: 4,
    knows: ["React", "JavaScript"],
    learning: ["UI/UX"],
    interests: ["Web Development", "Hackathon"],
    circles: ["web-dev", "cp", "gamedev"],
    goals: "Ingin ikut hackathon dan memperdalam desain antarmuka.",
    buddyTypes: ["learning", "project", "discussion", "random"],
    stats: { helped: 12, hosted: 4, joined: 9, answers: 18, projects: 3, resources: 5 },
  },
  {
    id: "sarah",
    name: "Sarah Azzahra",
    prodi: "SI",
    semester: 5,
    knows: ["Figma", "UI Research"],
    learning: ["React"],
    interests: ["UI/UX", "Startup"],
    circles: ["uiux", "web-dev", "creative"],
    goals: "Suka mentorin desain dan lagi belajar frontend biar bisa build sendiri.",
    buddyTypes: ["learning", "discussion", "random"],
    stats: { helped: 21, hosted: 6, joined: 11, answers: 24, projects: 4, resources: 9 },
  },
  {
    id: "diki",
    name: "Diki Wahyudi",
    prodi: "IF",
    semester: 6,
    knows: ["Laravel", "PHP"],
    learning: ["DevOps"],
    interests: ["Web Development", "Open Source"],
    circles: ["web-dev", "career"],
    goals: "Mau kontribusi ke open source dan belajar deployment modern.",
    buddyTypes: ["project", "discussion", "random"],
    stats: { helped: 27, hosted: 5, joined: 7, answers: 31, projects: 5, resources: 12 },
  },
  {
    id: "nadia",
    name: "Nadia Putri",
    prodi: "SI",
    semester: 3,
    knows: ["Python", "Pandas"],
    learning: ["Machine Learning"],
    interests: ["AI", "Data Science"],
    circles: ["aiml", "academic"],
    goals: "Menyiapkan diri ikut kompetisi data science tingkat kampus.",
    buddyTypes: ["learning", "discussion", "random"],
    stats: { helped: 9, hosted: 3, joined: 8, answers: 12, projects: 2, resources: 6 },
  },
  {
    id: "bima",
    name: "Bima Aryasatya",
    prodi: "SK",
    semester: 4,
    knows: ["Jaringan", "Linux"],
    learning: ["Cyber Security"],
    interests: ["CTF", "Open Source"],
    circles: ["cyber", "cp", "academic"],
    goals: "Fokus persiapan CTF beginner dan membangun homelab kecil.",
    buddyTypes: ["discussion", "random", "project"],
    stats: { helped: 14, hosted: 2, joined: 10, answers: 16, projects: 1, resources: 7 },
  },
  {
    id: "intan",
    name: "Intan Permata",
    prodi: "MI",
    semester: 2,
    knows: ["Public Speaking"],
    learning: ["Web Development"],
    interests: ["Career", "Organisasi"],
    circles: ["academic", "career", "casual"],
    goals: "Ingin lebih percaya diri dan siap magang di tahun ini.",
    buddyTypes: ["discussion", "random", "learning"],
    stats: { helped: 8, hosted: 2, joined: 6, answers: 7, projects: 0, resources: 3 },
  },
  {
    id: "fajar",
    name: "Fajar Ramadhan",
    prodi: "IF",
    semester: 5,
    knows: ["Unity", "C#"],
    learning: ["Game Design"],
    interests: ["Game Development", "Hackathon"],
    circles: ["gamedev", "cyber", "casual"],
    goals: "Mencari tim untuk game jam dan sharing soal level design.",
    buddyTypes: ["project", "random"],
    stats: { helped: 11, hosted: 3, joined: 9, answers: 10, projects: 4, resources: 4 },
  },
  {
    id: "maya",
    name: "Maya Rosalina",
    prodi: "SI",
    semester: 6,
    knows: ["Product Design", "Notion"],
    learning: ["Frontend"],
    interests: ["Startup", "Product"],
    circles: ["uiux", "career", "creative"],
    goals: "Membangun MVP produk sendiri bareng teman developer.",
    buddyTypes: ["project", "learning", "discussion"],
    stats: { helped: 19, hosted: 4, joined: 12, answers: 15, projects: 6, resources: 8 },
  },
];

// ==== POSTS ====

export const SEED_POSTS: CirclePost[] = [
  {
    id: 101,
    circleId: "web-dev",
    author: "Andi Saputra",
    authorProdi: "IF",
    type: "announcement",
    title: "Kopdar Web Dev #12 — Ngobrolin Next.js 🎉",
    content: "Sabtu depan kita kopdar di kafe dekat kampus! Topik: pengalaman migrasi ke App Router. Free untuk member circle, daftar lewat link di event ya. Datang siapa saja, santai kok.",
    tags: ["kopdar", "nextjs"],
    minutesAgo: 45,
    helpful: 32,
    pinned: true,
    authorModerator: true,
    comments: [
      { id: 1, author: "Raka Pratama", prodi: "IF", minutesAgo: 40, content: "Ikut! Aku bawa catatan bulan lalu." },
      { id: 2, author: "Intan Permata", prodi: "MI", minutesAgo: 25, content: "Boleh banget, aku belum pernah ikut kopdar." },
    ],
  },
  {
    id: 102,
    circleId: "web-dev",
    author: "Intan Permata",
    authorProdi: "MI",
    type: "question",
    title: "Kenapa state saya tidak update setelah setState?",
    content: "Aku panggil setState lalu langsung console.log, tapi nilainya masih lama. Padahal di UI sudah berubah. Mohon pencerahannya 🙏",
    tags: ["react", "state"],
    minutesAgo: 120,
    helpful: 14,
    comments: [
      { id: 3, author: "Raka Pratama", prodi: "IF", minutesAgo: 100, content: "setState itu async — log lama itu normal. Pakai useEffect buat lihat nilai terbaru." },
      { id: 4, author: "Andi Saputra", prodi: "IF", minutesAgo: 80, content: "Betul kata Raka. Nanti kita bahas detail di Skill Room Learn React Together hari Jumat!" },
    ],
  },
  {
    id: 103,
    circleId: "web-dev",
    author: "Diki Wahyudi",
    authorProdi: "IF",
    type: "resource",
    title: "Roadmap Backend Developer 2026",
    content: "Aku rangkum roadmap belajar backend versi 2026 — urutan topik + resource gratis. Silakan pakai, kalau ada saran materi tinggal reply ya.",
    tags: ["backend", "roadmap"],
    minutesAgo: 1440,
    helpful: 57,
    comments: [
      { id: 5, author: "Maya Rosalina", prodi: "SI", minutesAgo: 1300, content: "Ini lengkap banget, makasih bang!" },
    ],
  },
  {
    id: 104,
    circleId: "web-dev",
    author: "Fajar Ramadhan",
    authorProdi: "IF",
    type: "buddy",
    title: "Cari buddy buat hackathon FILFEST",
    content: "Saya butuh 1-2 orang untuk melengkapi tim hackathon (backend/UI). Aku bisa Unity & C#. Kita bisa mulai persiapan minggu ini.",
    tags: ["hackathon", "tim"],
    minutesAgo: 200,
    helpful: 9,
    comments: [
      { id: 6, author: "Diki Wahyudi", prodi: "IF", minutesAgo: 150, content: "Aku masuk kalau backend dibutuhkan." },
    ],
  },
  {
    id: 105,
    circleId: "uiux",
    author: "Sarah Azzahra",
    authorProdi: "SI",
    type: "discussion",
    title: "Dark mode: saat yang tepat kapan dipakai?",
    content: "Lagi rancang app kampus, bingung kapan dark mode layak diimplement. Menurut kalian dark mode wajib atau nice-to-have untuk aplikasi akademik?",
    tags: ["darkmode", "ux"],
    minutesAgo: 300,
    helpful: 21,
    comments: [
      { id: 7, author: "Maya Rosalina", prodi: "SI", minutesAgo: 240, content: "Menurutku nice-to-have. Fokus dulu ke kontras & hierarchy yang benar di light mode." },
      { id: 8, author: "Raka Pratama", prodi: "IF", minutesAgo: 180, content: "Setuju. Kalau token warna sudah rapi, dark mode jadi mudah belakangan." },
    ],
  },
  {
    id: 106,
    circleId: "uiux",
    author: "Maya Rosalina",
    authorProdi: "SI",
    type: "resource",
    title: "Rekaman Design Review #12",
    content: "Rekaman sesi review kemarin sudah kuunggah — ada 4 karya yang dibedah, banyak pelajaran soal spacing & hierarchy.",
    tags: ["figma", "review"],
    minutesAgo: 2880,
    helpful: 18,
    comments: [],
  },
  {
    id: 107,
    circleId: "aiml",
    author: "Nadia Putri",
    authorProdi: "SI",
    type: "discussion",
    title: "Dataset publik buat latihan regresi?",
    content: "Ada rekomendasi dataset Indonesia yang bagus untuk latihan regresi? Yang biasa Boston Housing udah terlalu sering dipakai.",
    tags: ["dataset", "regresi"],
    minutesAgo: 500,
    helpful: 11,
    comments: [
      { id: 9, author: "Rizky Hidayat", prodi: "SK", minutesAgo: 420, content: "Coba data BMKG atau harga komoditas dari BPS, menantang dan lokal!" },
    ],
  },
  {
    id: 108,
    circleId: "cyber",
    author: "Bima Aryasatya",
    authorProdi: "SK",
    type: "project",
    title: "Bikin tim CTF Beginner Cup 🚩",
    content: "Rekrut 2 orang untuk CTF Beginner Cup. Kita latihan bareng 2x sebelum hari-H. Pemula dipersilakan, nanti aku bagikan materi dasar.",
    tags: ["ctf", "rekrut"],
    minutesAgo: 600,
    helpful: 13,
    comments: [
      { id: 10, author: "Fajar Ramadhan", prodi: "IF", minutesAgo: 520, content: "Gas, aku join. Web challenge aku bisa bantu." },
    ],
  },
  {
    id: 109,
    circleId: "academic",
    author: "Bima Aryasatya",
    authorProdi: "SK",
    type: "resource",
    title: "Rangkuman Normalisasi 1-3NF (versi gampang paham)",
    content: "Kupandukan dari beberapa sumber jadi satu rangkuman dengan contoh kasus penjualan. Cocok buat persiapan UAS.",
    tags: ["basisdata", "uas"],
    minutesAgo: 90,
    helpful: 44,
    comments: [
      { id: 11, author: "Putri Amelia", prodi: "SI", minutesAgo: 60, content: "Terima kasih banyak, akhirnya paham 2NF 😭" },
    ],
  },
  {
    id: 110,
    circleId: "academic",
    author: "Intan Permata",
    authorProdi: "MI",
    type: "question",
    title: "Strategi membagi waktu UTS 5 matkul?",
    content: "UTS aku 5 hari 5 matkul. Ada tips pembagian jam belajar dari kakak angkatan?",
    tags: ["uts", "tips"],
    minutesAgo: 150,
    helpful: 16,
    comments: [
      { id: 12, author: "Nadia Putri", prodi: "SI", minutesAgo: 100, content: "Aku pakai 90/30: 90 menit belajar matkul berat, 30 menit matkul ringan. Jangan lupa tidur!" },
    ],
  },
  {
    id: 111,
    circleId: "casual",
    author: "Rizky Hidayat",
    authorProdi: "SK",
    type: "discussion",
    title: "Rekomendasi tempat nugas yang adem dekat kampus?",
    content: "Perpustakaan penuh terus. Ada tempat enak buat nugas sore-sore?Wifi kencang jadi nilai plus.",
    tags: ["nugas", "rekomendasi"],
    minutesAgo: 70,
    helpful: 12,
    comments: [
      { id: 13, author: "Intan Permata", prodi: "MI", minutesAgo: 50, content: "Kafe di jalan Bundo, wifi kencang, colokan banyak. Sore masih kosong." },
    ],
  },
  {
    id: 112,
    circleId: "career",
    author: "Maya Rosalina",
    authorProdi: "SI",
    type: "announcement",
    title: "Sesi Review CV Bareng Alumni — buka pendaftaran",
    content: "Career Circle dapat slot review CV dengan alumni yang sekarang jadi recruiter. Kuota 15 orang, prioritas yang sudah submit CV.",
    tags: ["cv", "review"],
    minutesAgo: 240,
    helpful: 28,
    authorModerator: true,
    comments: [
      { id: 14, author: "Diki Wahyudi", prodi: "IF", minutesAgo: 200, content: "Daftar dulu ah, CV-ku belum diperbarui setahun 😅" },
    ],
  },
];

// ==== HELPERS ====

export function circleById(id: string): Circle | undefined {
  return SEED_CIRCLES.find((c) => c.id === id);
}

export function roomById(id: string): SkillRoom | undefined {
  return SEED_ROOMS.find((r) => r.id === id);
}

export function roomStatus(room: SkillRoom, extraJoined: boolean): RoomStatus {
  if (room.finished) return "finished";
  const count = room.participantNames.length + (extraJoined ? 1 : 0);
  if (count >= room.capacity) return "full";
  if (count / room.capacity >= 0.8) return "almost";
  return "open";
}

export function eventDateLabel(inDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + inDays);
  if (inDays === 0) return `Hari ini · ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
  if (inDays === 1) return `Besok · ${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`;
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

export function initialsOf2(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-600",
  "bg-violet-600",
  "bg-teal-600",
  "bg-fuchsia-600",
];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function relativeMinutes(min: number): string {
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return `${Math.floor(d / 7)} pekan lalu`;
}

export type Badge = { id: string; emoji: string; label: string; desc: string; earned: boolean };

export function badgesOf(stats: {
  helped: number;
  hosted: number;
  joined: number;
  answers: number;
  projects: number;
  resources: number;
}): Badge[] {
  return [
    { id: "helpful", emoji: "🤝", label: "Helpful Buddy", desc: "Membantu ≥ 5 buddy", earned: stats.helped >= 5 },
    { id: "study", emoji: "📚", label: "Study Buddy", desc: "Ikut ≥ 3 sesi belajar", earned: stats.joined >= 3 },
    { id: "sharer", emoji: "🧠", label: "Knowledge Sharer", desc: "Berbagi ≥ 3 resource atau 10+ jawaban", earned: stats.resources >= 3 || stats.answers >= 10 },
    { id: "builder", emoji: "🚀", label: "Project Builder", desc: "Terlibat di ≥ 2 project", earned: stats.projects >= 2 },
    { id: "starter", emoji: "🌱", label: "Community Starter", desc: "Memulai circle atau room sendiri", earned: stats.hosted >= 1 },
    { id: "mentor", emoji: "⭐", label: "Community Mentor", desc: "Kontribusi besar & konsisten", earned: stats.helped >= 20 && stats.answers >= 15 },
  ];
}
