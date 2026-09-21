"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, Question, Slot, Store, User } from "./storeTypes";
import { StoreContext } from "./storeContext";

const seedUser: User = {
  name: "Sarah Azzahra",
  nim: "22101152610001",
  email: "sarah.azzahra@upiyptk.ac.id",
  prodi: "SI",
  password: "password123",
  points: 240,
  teachingHours: 12,
  sessionsDone: 8,
  rating: 4.9,
  ratingCount: 14,
  teachSkills: [
    { name: "Desain UI/UX (Figma)", icon: "palette", level: "Mahir" },
    { name: "Web Development (HTML/CSS, React)", icon: "code", level: "Menengah" },
  ],
  learnSkills: [
    { name: "Kalkulus Informatika", icon: "calculate" },
    { name: "Struktur Data & Algoritma", icon: "account_tree" },
  ],
  studyMode: "hybrid",
  availability: ["Senin - Jumat Sore", "Akhir Pekan (Sabtu/Minggu)"],
};

const seedQuestions: Question[] = [
  {
    id: 6,
    author: "Farhan Ramadhan",
    nim: "IF '23",
    time: "2 jam lalu",
    status: "hot",
    title: "Cara normalize database sampai 3NF untuk tugas besar Basis Data?",
    excerpt:
      "Tugas besar minta normalisasi sampai bentuk 3NF, tapi tabel transaksi saya selalu ada redundant data kolom nama mata kuliah. Ini udah 2NF atau belum ya?",
    category: "Database",
    tags: ["#mysql", "#basisdata", "#tugas-besar"],
    views: "128",
    reward: 20,
    votes: 23,
    answers: [
      {
        id: 61,
        author: "Budi Pratama",
        nim: "SK '22",
        time: "1 jam lalu",
        content:
          "Kamu masih di 1NF kalau nama mata kulium duplikat per baris transaksi. Pisahkan jadi tabel mata_kuliah (id, kode, nama), lalu transaksi hanya menyimpan foreign key id_matkul. 2NF dicapai kalau semua kolom non-kunci bergantung penuh pada primary key komposit — cek kombinasi (id_transaki, id_matkul).",
        votes: 12,
        accepted: true,
      },
      {
        id: 62,
        author: "Maya Rosalina",
        nim: "SI '21",
        time: "40 menit lalu",
        content:
          "Tips cepat: gambar dulu dependency diagram semua kolom terhadap kunci. Kalau ada kolom yang cuma bergantung ke sebagian kunci, pecah tabelnya.",
        votes: 5,
        accepted: false,
      },
    ],
  },
  {
    id: 5,
    author: "Dinda Permata",
    nim: "SI '22",
    time: "5 jam lalu",
    status: "terjawab",
    title: "Kenapa route Laravel saya 404 padahal sudah daftar di web.php?",
    excerpt:
      "Udah define Route::get('/profil', ...) tapi selalu 404 saat diakses. Cache route sudah di-clear dengan php artisan route:clear tetap sama.",
    category: "Web Dev",
    tags: ["#laravel", "#php", "#routing"],
    views: "89",
    reward: 15,
    votes: 15,
    answers: [
      {
        id: 51,
        author: "Rahmat Danu",
        nim: "IF '22",
        time: "4 jam lalu",
        content:
          "Cek urutan route — kalau ada Route::get('/{slug}') wildcard terdaftar sebelum /profil, slug akan menangkap request. Pindahkan route spesifik ke atas, atau pakai Route::get('/profil')->where('slug', '^(?!profil$)') pattern.",
        votes: 9,
        accepted: true,
      },
    ],
  },
  {
    id: 4,
    author: "Bayu Saputra",
    nim: "SK '21",
    time: "8 jam lalu",
    status: "menunggu",
    title: "VLAN di Cisco Packet Tracer tidak bisa ping antar device",
    excerpt:
      "Sudah buat VLAN 10 dan 20, trunk di switch udah di-set, tapi PC di VLAN 10 tidak bisa ping ke server di VLAN 20. Apakah harus pakai router atau layer 3 switch?",
    category: "Jaringan",
    tags: ["#cisco", "#jaringan", "#packet-tracer"],
    views: "56",
    votes: 9,
    answers: [],
  },
  {
    id: 3,
    author: "Nabila Putri",
    nim: "IF '23",
    time: "1 hari lalu",
    status: "terjawab",
    title: "Auto-layout Figma selalu berantakan saat di-resize, salahnya di mana?",
    excerpt:
      "Udah pakai fill container dan hug contents, tapi tiap ganti ukuran frame komponen card malah tumpang tindih. Ada aturan main setting auto-layout yang benar?",
    category: "UI/UX",
    tags: ["#figma", "#uiux", "#auto-layout"],
    views: "203",
    reward: 25,
    votes: 31,
    answers: [
      {
        id: 31,
        author: "Sarah Azzahra",
        nim: "SI '22",
        time: "22 jam lalu",
        content:
          "Aturan dasarnya: parent pakai Fill untuk sumbu yang mau fleksibel, child pakai Hug kecuali memang butuh ukuran tetap. Tumpang tindih biasanya karena ada elemen absolutely positioned — ubah jadi child auto-layout biasa.",
        votes: 18,
        accepted: true,
      },
    ],
  },
  {
    id: 2,
    author: "Kevin Novian",
    nim: "SK '22",
    time: "1 hari lalu",
    status: "menunggu",
    title: "Limit tak hingga di Kalkulus Informatika — kapan pakai L'Hôpital?",
    excerpt:
      "Masih bingung bedanya bentuk 0/0 dan tak hingga/tak hingga. Kapan boleh langsung lHospital dan kapan harus manipulasi aljabar dulu?",
    category: "Matkul Teori",
    tags: ["#kalkulus", "#matkul-teori", "#uas"],
    views: "44",
    votes: 6,
    answers: [],
  },
  {
    id: 1,
    author: "Tari Lestari",
    nim: "IF '23",
    time: "2 hari lalu",
    status: "terjawab",
    title: "Python pandas: cara merge dua DataFrame dengan kolom beda nama?",
    excerpt:
      "Mau gabungkan data nilai praktikum dengan data mahasiswa, tapi kolom NIM-nya beda format (satu pakai strip satu tidak). Solusi paling clean apa ya?",
    category: "Algoritma",
    tags: ["#python", "#pandas", "#data"],
    views: "112",
    reward: 20,
    votes: 18,
    answers: [
      {
        id: 11,
        author: "Aditya Pratama",
        nim: "IF '21",
        time: "2 hari lalu",
        content:
          "Pakai pd.merge(df1, df2, left_on='nim_raw', right_on='nim_clean'). Normalisasi dulu kolomnya: df['nim_raw'].str.replace('-', '') biar formatnya sama sebelum merge.",
        votes: 14,
        accepted: true,
      },
    ],
  },
];

const seedSlots: Slot[] = [
  {
    id: 1,
    status: "live",
    note: "Online Session",
    title: "Belajar Query SQL Kompleks & Indexing",
    schedule: "Hari ini, 15:30 - 17:00 WIB",
    partnerLabel: "Partner:",
    partner: "Diki Wahyudi (SI '21)",
  },
  {
    id: 2,
    status: "scheduled",
    note: "UPI YPTK Padang",
    title: "Review Wireframe & Design System FilBuddy",
    schedule: "Kamis, 14:00 WIB",
    partnerLabel: "Partner:",
    partner: "Nabila Putri (IF '23)",
  },
  {
    id: 3,
    status: "waiting",
    note: "Menunggu konfirmasi partner",
    title: "Algoritma & Struktur Data (Tree & Graph)",
    schedule: "Usulan: Jumat Sore (16:00)",
    partnerLabel: "Diajukan ke:",
    partner: "Bayu Pratama (IF '22)",
  },
];

const seedActivities: Activity[] = [
  {
    id: 4,
    icon: "bolt",
    iconClass: "bg-amber-50 text-amber-600 border-amber-200/60",
    title: "+50 Pts",
    desc: "dari sesi Laravel dengan Rahmat",
    time: "2 jam lalu",
  },
  {
    id: 3,
    icon: "star",
    iconClass: "bg-yellow-50 text-yellow-600 border-yellow-200/60",
    title: "Review 5.0\u2B50",
    desc: "\u201CPenjelasan Figma sangat detail!\u201D",
    time: "Kemarin, 19:40 WIB",
  },
  {
    id: 2,
    icon: "mail",
    iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    title: "Permintaan barter baru",
    desc: "dari Bayu (SK '21)",
    time: "1 hari lalu",
  },
  {
    id: 1,
    icon: "verified",
    iconClass: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    title: "Skill terverifikasi",
    desc: "\u201CDesain UI/UX\u201D oleh Admin FILKOM",
    time: "3 hari lalu",
  },
];

type PersistedState = {
  users: User[];
  currentNim: string | null;
  questions: Question[];
  slots: Slot[];
  activities: Activity[];
  myVotes: Record<number, 1 | -1 | 0>;
  nextId: number;
};

const STORAGE_KEY = "filbuddy_state_v1";

function loadState(): PersistedState {
  const fallback: PersistedState = {
    users: [seedUser],
    currentNim: null,
    questions: seedQuestions,
    slots: seedSlots,
    activities: seedActivities,
    myVotes: {},
    nextId: 100,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as PersistedState;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function DemoStoreProvider({
  children,
  degraded = false,
}: {
  children: React.ReactNode;
  degraded?: boolean;
}) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const user = useMemo(
    () => state.users.find((u) => u.nim === state.currentNim) ?? null,
    [state.users, state.currentNim]
  );

  const addActivity = useCallback((a: Omit<Activity, "id" | "time">) => {
    setState((s) => ({
      ...s,
      nextId: s.nextId + 1,
      activities: [{ ...a, id: s.nextId, time: "Baru saja" }, ...s.activities].slice(0, 20),
    }));
  }, []);

  const login: Store["login"] = useCallback(
    (identifier, password) => {
      const found = state.users.find(
        (u) => u.nim === identifier.trim() || u.email.toLowerCase() === identifier.trim().toLowerCase()
      );
      if (!found) return { ok: false, error: "Akun tidak ditemukan. Periksa NIM/email atau daftar dulu." };
      if (found.password !== password) return { ok: false, error: "Kata sandi salah. Coba lagi." };
      setState((s) => ({ ...s, currentNim: found.nim }));
      return { ok: true };
    },
    [state.users]
  );

  const register: Store["register"] = useCallback(
    (u) => {
      const exists = state.users.some(
        (x) => x.nim === u.nim || x.email.toLowerCase() === u.email.toLowerCase()
      );
      if (exists) return { ok: false, error: "NIM atau email sudah terdaftar." };
      // Bonus skill pending — cair setelah kontribusi pertama.
      try {
        localStorage.setItem("filbuddy-pending-bonus", String(u.teachSkills.length * 50));
      } catch {
        /* ignore */
      }
      const newUser: User = {
        ...u,
        points: 100,
        teachingHours: 0,
        sessionsDone: 0,
        rating: 5.0,
        ratingCount: 0,
      };
      setState((s) => ({ ...s, users: [...s.users, newUser] }));
      return { ok: true };
    },
    [state.users]
  );

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentNim: null }));
  }, []);

  const createQuestion: Store["createQuestion"] = useCallback(
    (q) => {
      const me = state.users.find((u) => u.nim === state.currentNim);
      if (!me) return { ok: false, error: "Silakan masuk dulu." };
      if (q.reward > 0 && me.points < q.reward) {
        return { ok: false, error: `Poin tidak cukup. Saldo kamu ${me.points} Pts.` };
      }
      setState((s) => ({
        ...s,
        nextId: s.nextId + 1,
        users: s.users.map((u) =>
          u.nim === s.currentNim ? { ...u, points: u.points - q.reward } : u
        ),
        questions: [
          {
            id: s.nextId,
            author: me.name,
            nim: `${me.prodi} '22`,
            time: "Baru saja",
            status: "menunggu",
            title: q.title,
            excerpt: q.excerpt,
            category: q.category,
            tags: q.tags,
            views: "0",
            reward: q.reward > 0 ? q.reward : undefined,
            votes: 0,
            answers: [],
            mine: true,
          },
          ...s.questions,
        ],
      }));
      if (q.reward > 0) {
        addActivity({
          icon: "forum",
          iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
          title: "Pertanyaan baru dibuat",
          desc: `dengan reward ${q.reward} Pts`,
        });
      }
      return { ok: true };
    },
    [state.users, state.currentNim, addActivity]
  );

  const voteQuestion: Store["voteQuestion"] = useCallback((id, dir) => {
    setState((s) => {
      const prev = s.myVotes[id] ?? 0;
      const next = prev === dir ? 0 : dir;
      const delta = next - prev;
      return {
        ...s,
        myVotes: { ...s.myVotes, [id]: next },
        questions: s.questions.map((q) =>
          q.id === id ? { ...q, votes: q.votes + delta } : q
        ),
      };
    });
  }, []);

  const addAnswer: Store["addAnswer"] = useCallback((qid, content) => {
    setState((s) => {
      const me = s.users.find((u) => u.nim === s.currentNim);
      if (!me) return s;
      // Bonus skill pending cair pada kontribusi pertama
      let pending = 0;
      try {
        pending = parseInt(localStorage.getItem("filbuddy-pending-bonus") ?? "0", 10) || 0;
      } catch {
        pending = 0;
      }
      return {
        ...s,
        nextId: s.nextId + 1,
        users:
          pending > 0
            ? s.users.map((u) => (u.nim === s.currentNim ? { ...u, points: u.points + pending } : u))
            : s.users,
        questions: s.questions.map((q) =>
          q.id === qid
            ? {
                ...q,
                answers: [
                  ...q.answers,
                  {
                    id: s.nextId,
                    author: me.name,
                    nim: `${me.prodi} '22`,
                    time: "Baru saja",
                    content,
                    votes: 0,
                    accepted: false,
                  },
                ],
              }
            : q
        ),
      };
    });
    try {
      if (parseInt(localStorage.getItem("filbuddy-pending-bonus") ?? "0", 10) > 0) {
        localStorage.removeItem("filbuddy-pending-bonus");
        addActivity({
          icon: "redeem",
          iconClass: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
          title: "Bonus skill dicairkan",
          desc: "kontribusi pertama di forum",
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const acceptAnswer: Store["acceptAnswer"] = useCallback(
    (qid, aid) => {
      setState((s) => {
        const q = s.questions.find((x) => x.id === qid);
        if (!q || !q.mine) return s;
        const answer = q.answers.find((a) => a.id === aid);
        const me = s.users.find((u) => u.nim === s.currentNim);
        const rewardToMe = answer && me && answer.author === me.name && q.reward;
        return {
          ...s,
          users: rewardToMe
            ? s.users.map((u) =>
                u.nim === s.currentNim ? { ...u, points: u.points + (q.reward ?? 0) } : u
              )
            : s.users,
          questions: s.questions.map((x) =>
            x.id === qid
              ? {
                  ...x,
                  status: "terjawab",
                  answers: x.answers.map((a) => ({ ...a, accepted: a.id === aid })),
                }
              : x
          ),
        };
      });
      addActivity({
        icon: "check_circle",
        iconClass: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
        title: "Jawaban diterima",
        desc: "Reward poin ditransfer ke penjawab",
      });
    },
    [addActivity]
  );

  const updateAnswer: Store["updateAnswer"] = useCallback(
    (qid, aid, content) => {
      const trimmed = content.trim();
      if (trimmed.length < 10) return { ok: false, error: "Jawaban minimal 10 karakter." };
      setState((s) => ({
        ...s,
        questions: s.questions.map((q) =>
          q.id === qid
            ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, content: trimmed } : a)) }
            : q
        ),
      }));
      return { ok: true };
    },
    []
  );

  const deleteAnswer: Store["deleteAnswer"] = useCallback(
    (qid, aid) => {
      let error: string | undefined;
      setState((s) => {
        const me = s.users.find((u) => u.nim === s.currentNim);
        const q = s.questions.find((x) => x.id === qid);
        const a = q?.answers.find((x) => x.id === aid);
        if (!me || !q || !a) {
          error = "Jawaban tidak ditemukan.";
          return s;
        }
        if (a.author !== me.name) {
          error = "Bukan jawabanmu.";
          return s;
        }
        if (a.accepted) {
          error = "Jawaban terbaik tidak bisa dihapus — minta penanya menandai jawaban lain dulu.";
          return s;
        }
        return {
          ...s,
          questions: s.questions.map((x) =>
            x.id === qid ? { ...x, answers: x.answers.filter((y) => y.id !== aid) } : x
          ),
        };
      });
      return error ? { ok: false, error } : { ok: true };
    },
    []
  );

  const deleteQuestion: Store["deleteQuestion"] = useCallback(
    (qid) => {
      let error: string | undefined;
      setState((s) => {
        const me = s.users.find((u) => u.nim === s.currentNim);
        const q = s.questions.find((x) => x.id === qid);
        if (!me || !q) {
          error = "Pertanyaan tidak ditemukan.";
          return s;
        }
        if (!q.mine) {
          error = "Bukan pertanyaanmu.";
          return s;
        }
        if (q.status === "terjawab") {
          error = "Pertanyaan sudah terjawab — diskusi ini bermanfaat, biarkan tetap ada.";
          return s;
        }
        return {
          ...s,
          // Reward yang masih tertahan dikembalikan ke saldo.
          users:
            q.reward && q.reward > 0
              ? s.users.map((u) =>
                  u.nim === s.currentNim ? { ...u, points: u.points + q.reward! } : u
                )
              : s.users,
          questions: s.questions.filter((x) => x.id !== qid),
        };
      });
      if (error) return { ok: false, error };
      addActivity({
        icon: "delete",
        iconClass: "bg-slate-50 text-slate-500 border-slate-200",
        title: "Pertanyaan dihapus",
        desc: "oleh kamu",
      });
      return { ok: true };
    },
    [addActivity]
  );

  const createSlot: Store["createSlot"] = useCallback(
    (s2) => {
      setState((s) => ({
        ...s,
        nextId: s.nextId + 1,
        slots: [
          {
            id: s.nextId,
            status: "scheduled",
            note: s2.mode,
            title: s2.title,
            schedule: s2.schedule,
            partnerLabel: "Partner:",
            partner: s2.partner,
          },
          ...s.slots,
        ],
      }));
      addActivity({
        icon: "event",
        iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        title: "Slot barter dibuka",
        desc: s2.title,
      });
    },
    [addActivity]
  );

  const cancelSlot: Store["cancelSlot"] = useCallback(
    (id) => {
      setState((s) => ({ ...s, slots: s.slots.filter((x) => x.id !== id) }));
      addActivity({
        icon: "event_busy",
        iconClass: "bg-rose-50 text-rose-500 border-rose-200/60",
        title: "Slot dibatalkan",
        desc: "Slot barter dihapus dari jadwal",
      });
    },
    [addActivity]
  );

  const requestBarter: Store["requestBarter"] = useCallback(
    (name, teach, need) => {
      setState((s) => ({
        ...s,
        nextId: s.nextId + 1,
        slots: [
          {
            id: s.nextId,
            status: "waiting",
            note: "Menunggu konfirmasi partner",
            title: `${need} ↔ ${teach}`,
            schedule: "Menunggu usulan jadwal",
            partnerLabel: "Diajukan ke:",
            partner: name,
          },
          ...s.slots,
        ],
      }));
      addActivity({
        icon: "send",
        iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        title: "Permintaan barter terkirim",
        desc: `ke ${name}`,
      });
    },
    [addActivity]
  );

  const joinSession: Store["joinSession"] = useCallback(
    (id) => {
      const slot = state.slots.find((x) => x.id === id);
      if (slot) {
        addActivity({
          icon: "video_call",
          iconClass: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
          title: "Masuk sesi live",
          desc: slot.title,
        });
      }
    },
    [state.slots, addActivity]
  );

  const value: Store = {
    ready: true,
    mode: "demo",
    degraded,
    user,
    questions: state.questions,
    slots: state.slots,
    activities: state.activities,
    myVotes: state.myVotes,
    login,
    register,
    logout,
    createQuestion,
    voteQuestion,
    addAnswer,
    acceptAnswer,
    updateAnswer,
    deleteAnswer,
    deleteQuestion,
    createSlot,
    cancelSlot,
    requestBarter,
    joinSession,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

