"use client";

// ============================================================
// FilBuddy Messages — percakapan antar mahasiswa (session+local)
// MVP: inbox, thread, unread, permintaan pesan, blokir/bisukan/lapor.
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ChatMessage = {
  id: number;
  author: string;
  content: string;
  time: string;
  mine: boolean;
};

export type ThreadStatus = "active" | "request";

export type Thread = {
  id: string;
  person: string;
  contextLabel: string;
  contextHref?: string;
  msgs: ChatMessage[];
  unread: number;
  status: ThreadStatus;
  muted: boolean;
  blocked: boolean;
  reported?: string;
};

type MessagesState = {
  threads: Thread[];
  totalUnread: number;
  requests: number;
  startThread: (person: string, contextLabel: string, contextHref?: string, opening?: string) => string;
  send: (threadId: string, content: string) => void;
  accept: (threadId: string) => void;
  markRead: (threadId: string) => void;
  markAllRead: () => void;
  toggleMute: (threadId: string) => void;
  toggleBlock: (threadId: string) => void;
  report: (threadId: string, ref: string) => void;
};

const MessagesContext = createContext<MessagesState | null>(null);

function nowLabel() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function seedThreads(myName: string): Thread[] {
  return [
    {
      id: "t-dina",
      person: "Dina Aprilia",
      contextLabel: "FILFEST Hackathon 2026",
      contextHref: "/dashboard/community/events",
      unread: 1,
      status: "request",
      muted: false,
      blocked: false,
      msgs: [
        { id: 1, author: "Dina Aprilia", content: `Hai ${myName.split(" ")[0]}! Aku lihat kamu cari buddy hackathon. Tim kami butuh satu orang frontend — tertarik?`, time: "10:12", mine: false },
      ],
    },
    {
      id: "t-budi",
      person: "Budi Santoso",
      contextLabel: "Slot: Sesi React Hooks dasar",
      contextHref: "/dashboard/slot",
      unread: 1,
      status: "active",
      muted: false,
      blocked: false,
      msgs: [
        { id: 1, author: "Budi Santoso", content: "Halo! Aku daftar slot React Hooks kamu. Kita mulai jam 7 nanti ya?", time: "09:05", mine: false },
        { id: 2, author: myName, content: "Siap! Nanti aku share link Meet di sini sebelum mulai.", time: "09:11", mine: true },
        { id: 3, author: "Budi Santoso", content: "Oke, makasih. Aku udah baca materi useState sekilas biar nanti lancar 🙌", time: "09:13", mine: false },
      ],
    },
  ];
}

const LS_KEY = "filbuddy-messages-v1";

export function MessagesProvider({ myName, children }: { myName: string; children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!myName) return;
    try {
      const raw = localStorage.getItem(`${LS_KEY}:${myName}`);
      if (raw) {
        setThreads(JSON.parse(raw) as Thread[]);
        return;
      }
    } catch {
      /* ignore */
    }
    setThreads(seedThreads(myName));
  }, [myName]);

  useEffect(() => {
    if (!myName || threads.length === 0) return;
    try {
      localStorage.setItem(`${LS_KEY}:${myName}`, JSON.stringify(threads));
    } catch {
      /* ignore */
    }
  }, [threads, myName]);

  const startThread = useCallback<MessagesState["startThread"]>(
    (person, contextLabel, contextHref, opening) => {
      const existing = threads.find((t) => t.person === person);
      if (existing) {
        if (opening) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === existing.id
                ? { ...t, msgs: [...t.msgs, { id: Date.now(), author: myName, content: opening, time: nowLabel(), mine: true }] }
                : t
            )
          );
        }
        return existing.id;
      }
      const id = `t-${Date.now()}`;
      setThreads((prev) => [
        {
          id,
          person,
          contextLabel,
          contextHref,
          unread: 0,
          status: "active",
          muted: false,
          blocked: false,
          msgs: opening ? [{ id: Date.now(), author: myName, content: opening, time: nowLabel(), mine: true }] : [],
        },
        ...prev,
      ]);
      return id;
    },
    [threads, myName]
  );

  const send = useCallback<MessagesState["send"]>(
    (threadId, content) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          const mine: ChatMessage = { id: Date.now(), author: myName, content, time: nowLabel(), mine: true };
          // Balasan otomatis ringan supaya demo terasa hidup (di produksi: realtime)
          setTimeout(() => {
            setThreads((cur) =>
              cur.map((x) =>
                x.id === threadId
                  ? {
                      ...x,
                      unread: x.unread + 1,
                      msgs: [
                        ...x.msgs,
                        { id: Date.now() + 1, author: x.person, content: "Oke, noted! Nanti kita koordinasi lagi ya 👍", time: nowLabel(), mine: false },
                      ],
                    }
                  : x
              )
            );
          }, 1500);
          return { ...t, msgs: [...t.msgs, mine] };
        })
      );
    },
    [myName]
  );

  const accept = useCallback<MessagesState["accept"]>((threadId) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, status: "active" } : t)));
  }, []);

  const markRead = useCallback<MessagesState["markRead"]>((threadId) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)));
  }, []);

  const markAllRead = useCallback<MessagesState["markAllRead"]>(() => {
    setThreads((prev) => prev.map((t) => ({ ...t, unread: 0 })));
  }, []);

  const toggleMute = useCallback<MessagesState["toggleMute"]>((threadId) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, muted: !t.muted } : t)));
  }, []);

  const toggleBlock = useCallback<MessagesState["toggleBlock"]>((threadId) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, blocked: !t.blocked } : t)));
  }, []);

  const report = useCallback<MessagesState["report"]>((threadId, ref) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, reported: ref } : t)));
  }, []);

  const totalUnread = useMemo(() => threads.filter((t) => !t.muted && t.status === "active").reduce((n, t) => n + t.unread, 0), [threads]);
  const requests = useMemo(() => threads.filter((t) => t.status === "request").length, [threads]);

  const value: MessagesState = {
    threads,
    totalUnread,
    requests,
    startThread,
    send,
    accept,
    markRead,
    markAllRead,
    toggleMute,
    toggleBlock,
    report,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages harus dipakai di dalam MessagesProvider");
  return ctx;
}
