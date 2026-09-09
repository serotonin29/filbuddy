"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase/client";
import { DemoStoreProvider } from "./demoStore";
import { StoreContext } from "./storeContext";
import { formatRelative, type Activity, type Question, type Slot, type Store, type User } from "./storeTypes";

type ProfileRow = {
  id: string;
  name: string;
  nim: string;
  email: string;
  prodi: string;
  points: number;
  teaching_hours: number;
  sessions_done: number;
  rating: number;
  rating_count: number;
  teach_skills: User["teachSkills"];
  learn_skills: User["learnSkills"];
  study_mode: User["studyMode"];
  availability: string[];
};

type QuestionRow = {
  id: number;
  author_id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  reward: number | null;
  votes: number;
  status: Question["status"];
  created_at: string;
  profiles: { name: string; prodi: string } | null;
};

type AnswerRow = {
  id: number;
  question_id: number;
  author_id: string;
  content: string;
  votes: number;
  accepted: boolean;
  created_at: string;
  profiles: { name: string; prodi: string } | null;
};

function mapProfile(row: ProfileRow): User {
  return {
    name: row.name,
    nim: row.nim,
    email: row.email,
    prodi: row.prodi,
    password: "",
    points: row.points,
    teachingHours: Number(row.teaching_hours ?? 0),
    sessionsDone: row.sessions_done,
    rating: Number(row.rating ?? 5),
    ratingCount: row.rating_count,
    teachSkills: row.teach_skills ?? [],
    learnSkills: row.learn_skills ?? [],
    studyMode: row.study_mode ?? "hybrid",
    availability: row.availability ?? [],
  };
}

function mapQuestion(row: QuestionRow, answers: AnswerRow[], uid: string | null): Question {
  return {
    id: row.id,
    author: row.profiles?.name ?? "Mahasiswa",
    nim: `${row.profiles?.prodi ?? "IF"} '22`,
    time: formatRelative(row.created_at),
    status: row.status,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags ?? [],
    views: "—",
    reward: row.reward && row.reward > 0 ? row.reward : undefined,
    votes: row.votes,
    mine: uid != null && row.author_id === uid,
    answers: answers
      .filter((a) => a.question_id === row.id)
      .map((a) => ({
        id: a.id,
        author: a.profiles?.name ?? "Mahasiswa",
        nim: `${a.profiles?.prodi ?? "IF"} '22`,
        time: formatRelative(a.created_at),
        content: a.content,
        votes: a.votes,
        accepted: a.accepted,
        authorId: a.author_id,
      })),
  };
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email atau kata sandi salah.";
  if (m.includes("already registered")) return "Email sudah terdaftar. Masuk saja langsung.";
  if (m.includes("password should be")) return "Kata sandi minimal 6 karakter.";
  if (m.includes("unable to validate email")) return "Format email tidak valid.";
  return msg;
}

export function SupabaseStoreProvider({ children }: { children: React.ReactNode }) {
  // Kalau schema belum tersedia, fallback ke demo store
  const [degraded, setDegraded] = useState(false);

  if (degraded) {
    return <DemoStoreProvider degraded>{children}</DemoStoreProvider>;
  }
  return <SupabaseStoreInner onDegraded={setDegraded}>{children}</SupabaseStoreInner>;
}

function SupabaseStoreInner({
  children,
  onDegraded,
}: {
  children: React.ReactNode;
  onDegraded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myVotes, setMyVotes] = useState<Record<number, 1 | -1 | 0>>({});
  const uidRef = useRef<string | null>(null);

  const loadAll = useCallback(async (uid: string) => {
    // Set loading (ready=false) — AppShell menampilkan spinner, bukan redirect
    setReady(false);
    const [profRes, qRes, aRes, slotRes, actRes, voteRes] = await Promise.all([
      supabase!.from("profiles").select("*").eq("id", uid).single(),
      supabase!.from("questions").select("*, profiles!questions_author_id_fkey(name, prodi)").order("created_at", { ascending: false }),
      supabase!.from("answers").select("*, profiles!answers_author_id_fkey(name, prodi)").order("created_at"),
      supabase!.from("slots").select("*").eq("owner_id", uid).order("created_at", { ascending: false }),
      supabase!
        .from("activities")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase!.from("question_votes").select("question_id, dir").eq("user_id", uid),
    ]);

    if (profRes.data) setUser(mapProfile(profRes.data as ProfileRow));
    const answerRows = (aRes.data ?? []) as AnswerRow[];
    setQuestions(
      ((qRes.data ?? []) as QuestionRow[]).map((r) => mapQuestion(r, answerRows, uid))
    );
    setSlots(
      ((slotRes.data ?? []) as Array<{
        id: number;
        status: Slot["status"];
        note: string | null;
        title: string;
        schedule: string;
        partner: string;
        partner_label: string;
      }>).map((r) => ({
        id: r.id,
        status: r.status,
        note: r.note ?? "",
        title: r.title,
        schedule: r.schedule,
        partnerLabel: r.partner_label,
        partner: r.partner,
      }))
    );
    setActivities(
      ((actRes.data ?? []) as Array<{
        id: number;
        icon: string;
        icon_class: string;
        title: string;
        description: string;
        created_at: string;
      }>).map((r) => ({
        id: r.id,
        icon: r.icon,
        iconClass: r.icon_class,
        title: r.title,
        desc: r.description,
        time: formatRelative(r.created_at),
      }))
    );
    const votes: Record<number, 1 | -1 | 0> = {};
    for (const v of (voteRes.data ?? []) as Array<{ question_id: number; dir: number }>) {
      votes[v.question_id] = v.dir === 1 ? 1 : -1;
    }
    setMyVotes(votes);
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const handleSession = async (session: Session | null) => {
      const uid = session?.user?.id ?? null;
      if (uid && uid !== uidRef.current) {
        uidRef.current = uid;
        await loadAll(uid);
        if (mounted) setReady(true);
      } else if (!uid && uidRef.current) {
        uidRef.current = null;
        setUser(null);
        setQuestions([]);
        setSlots([]);
        setActivities([]);
        setMyVotes({});
        setReady(true);
      }
    };

    (async () => {
      if (!supabase) {
        onDegraded(true);
        return;
      }
      // Daftarkan listener PERTAMA supaya event login/logout tidak pernah
      // terlewat saat race dengan health-check & getSession di bawah.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        void handleSession(session);
      });
      unsubscribe = () => subscription.unsubscribe();
      // Cek schema tersedia (tabel profiles ada)
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error && (error.code === "PGRST205" || error.message.includes("schema cache"))) {
        console.warn("[FilBuddy] Tabel Supabase belum ada — jalankan supabase/schema.sql. Mode demo aktif.");
        if (mounted) onDegraded(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      await handleSession(data.session ?? null);
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [loadAll, onDegraded]);

  const addActivity = useCallback(
    async (icon: string, iconClass: string, title: string, description: string) => {
      const uid = uidRef.current;
      if (!uid || !supabase) return;
      const { data } = await supabase
        .from("activities")
        .insert({ user_id: uid, icon, icon_class: iconClass, title, description })
        .select("id, created_at")
        .single();
      if (data) {
        setActivities((prev) =>
          [
            {
              id: (data as { id: number }).id,
              icon,
              iconClass,
              title,
              desc: description,
              time: "Baru saja",
            },
            ...prev,
          ].slice(0, 20)
        );
      }
    },
    []
  );

  const adjustPoints = useCallback(async (delta: number) => {
    if (!user || !supabase) return;
    const next = user.points + delta;
    setUser((u) => (u ? { ...u, points: u.points + delta } : u));
    await supabase.from("profiles").update({ points: next }).eq("id", uidRef.current);
  }, [user]);

  const login: Store["login"] = useCallback(async (identifier, password) => {
    const id = identifier.trim();
    let email = id;

    // Mode NIM: resolve ke email kampus via RPC, lalu sign in dengan email
    if (!id.includes("@")) {
      const { data, error: rpcError } = await supabase!.rpc("get_email_by_nim", { p_nim: id });
      if (rpcError || !data) {
        return {
          ok: false,
          error: "NIM tidak ditemukan. Periksa kembali atau daftar dulu lewat halaman register.",
        };
      }
      email = data as string;
    }

    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  }, []);

  const register: Store["register"] = useCallback(async (u) => {
    const { data, error } = await supabase!.auth.signUp({
      email: u.email.trim(),
      password: u.password,
      options: { data: { name: u.name, nim: u.nim, prodi: u.prodi } },
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    if (!data.session) {
      return {
        ok: false,
        error: "Akun dibuat! Cek email kampus untuk verifikasi, lalu masuk kembali.",
      };
    }
    // Session aktif → lengkapi profil (skills, preferensi, bonus poin)
    const bonus = u.teachSkills.length * 50;
    await supabase!
      .from("profiles")
      .update({
        teach_skills: u.teachSkills,
        learn_skills: u.learnSkills,
        study_mode: u.studyMode,
        availability: u.availability,
        points: 100 + bonus,
      })
      .eq("id", data.session.user.id);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase!.auth.signOut();
  }, []);

  const createQuestion: Store["createQuestion"] = useCallback(
    async (q) => {
      const uid = uidRef.current;
      if (!uid || !user) return { ok: false, error: "Silakan masuk dulu." };
      if (q.reward > 0 && user.points < q.reward) {
        return { ok: false, error: `Poin tidak cukup. Saldo kamu ${user.points} Pts.` };
      }
      const { data, error } = await supabase!
        .from("questions")
        .insert({
          author_id: uid,
          title: q.title,
          excerpt: q.excerpt,
          category: q.category,
          tags: q.tags,
          reward: q.reward,
          status: "menunggu",
        })
        .select("*, profiles!questions_author_id_fkey(name, prodi)")
        .single();
      if (error) return { ok: false, error: "Gagal menyimpan pertanyaan: " + error.message };

      setQuestions((prev) => [mapQuestion(data as QuestionRow, [], uid), ...prev]);
      if (q.reward > 0) await adjustPoints(-q.reward);
      await addActivity(
        "forum",
        "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        "Pertanyaan baru dibuat",
        q.reward > 0 ? `dengan reward ${q.reward} Pts` : "di forum tanya jawab"
      );
      return { ok: true };
    },
    [user, adjustPoints, addActivity]
  );

  const voteQuestion: Store["voteQuestion"] = useCallback(async (id, dir) => {
    const uid = uidRef.current;
    if (!uid || !supabase) return;
    const prev = myVotes[id] ?? 0;
    const next = prev === dir ? 0 : dir;
    const delta = next - prev;

    if (prev !== 0) {
      await supabase.from("question_votes").delete().match({ question_id: id, user_id: uid });
    }
    if (next !== 0) {
      await supabase.from("question_votes").insert({ question_id: id, user_id: uid, dir: next });
    }

    setMyVotes((v) => ({ ...v, [id]: next }));
    setQuestions((prevQ) =>
      prevQ.map((q) => (q.id === id ? { ...q, votes: q.votes + delta } : q))
    );
    const target = questions.find((q) => q.id === id);
    if (target) {
      await supabase.from("questions").update({ votes: target.votes + delta }).eq("id", id);
    }
  }, [myVotes, questions]);

  const addAnswer: Store["addAnswer"] = useCallback(
    async (qid, content) => {
      const uid = uidRef.current;
      if (!uid || !supabase || !user) return;
      const { data, error } = await supabase!
        .from("answers")
        .insert({ question_id: qid, author_id: uid, content })
        .select("id, created_at")
        .single();
      if (error || !data) return;

      const row = data as { id: number; created_at: string };
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === qid
            ? {
                ...q,
                answers: [
                  ...q.answers,
                  {
                    id: row.id,
                    author: user.name,
                    nim: `${user.prodi} '22`,
                    time: "Baru saja",
                    content,
                    votes: 0,
                    accepted: false,
                    authorId: uid,
                  },
                ],
              }
            : q
        )
      );
      await addActivity(
        "chat",
        "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        "Jawaban terkirim",
        "di forum tanya jawab"
      );
    },
    [user, addActivity]
  );

  const acceptAnswer: Store["acceptAnswer"] = useCallback(
    async (qid, aid) => {
      const uid = uidRef.current;
      if (!uid || !supabase) return;
      const q = questions.find((x) => x.id === qid);
      if (!q || !q.mine) return;
      const answer = q.answers.find((a) => a.id === aid);
      if (!answer) return;

      // Reset semua jawaban pertanyaan ini, lalu tandai yang dipilih
      await supabase!.from("answers").update({ accepted: false }).eq("question_id", qid);
      await supabase!.from("answers").update({ accepted: true }).eq("id", aid);
      await supabase!.from("questions").update({ status: "terjawab" }).eq("id", qid);

      // Transfer reward ke penjawab
      if (q.reward && answer.authorId && answer.authorId !== uid) {
        const { data: prof } = await supabase!
          .from("profiles")
          .select("points")
          .eq("id", answer.authorId)
          .single();
        if (prof) {
          await supabase!
            .from("profiles")
            .update({ points: (prof.points as number) + q.reward })
            .eq("id", answer.authorId);
        }
      }

      setQuestions((prev) =>
        prev.map((x) =>
          x.id === qid
            ? {
                ...x,
                status: "terjawab",
                answers: x.answers.map((a) => ({ ...a, accepted: a.id === aid })),
              }
            : x
        )
      );
      await addActivity(
        "check_circle",
        "bg-emerald-50 text-emerald-600 border-emerald-200/60",
        "Jawaban diterima",
        `Reward ${q.reward ?? 0} Pts ditransfer ke ${answer.author}`
      );
    },
    [questions, addActivity]
  );

  const createSlot: Store["createSlot"] = useCallback(
    async (s) => {
      const uid = uidRef.current;
      if (!uid || !supabase) return;
      const { data, error } = await supabase!
        .from("slots")
        .insert({
          owner_id: uid,
          title: s.title,
          schedule: s.schedule,
          partner: s.partner,
          partner_label: "Partner:",
          status: "scheduled",
          note: s.mode,
        })
        .select("id")
        .single();
      if (error || !data) return;
      setSlots((prev) => [
        {
          id: (data as { id: number }).id,
          status: "scheduled",
          note: s.mode,
          title: s.title,
          schedule: s.schedule,
          partnerLabel: "Partner:",
          partner: s.partner,
        },
        ...prev,
      ]);
      await addActivity(
        "event",
        "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        "Slot barter dibuka",
        s.title
      );
    },
    [addActivity]
  );

  const cancelSlot: Store["cancelSlot"] = useCallback(
    async (id) => {
      if (!supabase) return;
      await supabase.from("slots").delete().eq("id", id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      await addActivity(
        "event_busy",
        "bg-rose-50 text-rose-500 border-rose-200/60",
        "Slot dibatalkan",
        "Slot barter dihapus dari jadwal"
      );
    },
    [addActivity]
  );

  const requestBarter: Store["requestBarter"] = useCallback(
    async (name, teach, need) => {
      const uid = uidRef.current;
      if (!uid || !supabase) return;
      const { data, error } = await supabase!
        .from("slots")
        .insert({
          owner_id: uid,
          title: `${need} ↔ ${teach}`,
          schedule: "Menunggu usulan jadwal",
          partner: name,
          partner_label: "Diajukan ke:",
          status: "waiting",
          note: "Menunggu konfirmasi partner",
        })
        .select("id")
        .single();
      if (error || !data) return;
      setSlots((prev) => [
        {
          id: (data as { id: number }).id,
          status: "waiting",
          note: "Menunggu konfirmasi partner",
          title: `${need} ↔ ${teach}`,
          schedule: "Menunggu usulan jadwal",
          partnerLabel: "Diajukan ke:",
          partner: name,
        },
        ...prev,
      ]);
      await addActivity(
        "send",
        "bg-indigo-50 text-indigo-600 border-indigo-200/60",
        "Permintaan barter terkirim",
        `ke ${name}`
      );
    },
    [addActivity]
  );

  const joinSession: Store["joinSession"] = useCallback(
    async (id) => {
      const slot = slots.find((x) => x.id === id);
      if (slot) {
        await addActivity(
          "video_call",
          "bg-emerald-50 text-emerald-600 border-emerald-200/60",
          "Masuk sesi live",
          slot.title
        );
      }
    },
    [slots, addActivity]
  );

  const value: Store = useMemo(
    () => ({
      ready,
      mode: "supabase",
      degraded: false,
      user,
      questions,
      slots,
      activities,
      myVotes,
      login,
      register,
      logout,
      createQuestion,
      voteQuestion,
      addAnswer,
      acceptAnswer,
      createSlot,
      cancelSlot,
      requestBarter,
      joinSession,
    }),
    [
      ready,
      user,
      questions,
      slots,
      activities,
      myVotes,
      login,
      register,
      logout,
      createQuestion,
      voteQuestion,
      addAnswer,
      acceptAnswer,
      createSlot,
      cancelSlot,
      requestBarter,
      joinSession,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

