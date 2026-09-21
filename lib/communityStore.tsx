"use client";

// ============================================================
// FilBuddy Community Store — state session-only di atas data dummy
// ============================================================

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  SEED_BUDDIES,
  SEED_CIRCLES,
  SEED_EVENTS,
  SEED_POSTS,
  SEED_ROOMS,
  roomStatus,
  type Buddy,
  type Circle,
  type CirclePost,
  type CirclePostType,
  type CommunityEvent,
  type SkillRoom,
} from "./communityData";

type EventStatus = "interested" | "going";

type CommunityState = {
  circles: Circle[];
  rooms: SkillRoom[];
  events: CommunityEvent[];
  posts: CirclePost[];
  buddies: Buddy[];
  joinedCircles: Record<string, boolean>;
  savedPosts: Record<number, boolean>;
  helpfulByMe: Record<number, boolean>;
  reportedPosts: Record<number, boolean>;
  joinedRooms: Record<string, boolean>;
  roomFeedback: Record<string, boolean>;
  savedResources: Record<number, boolean>;
  eventStatus: Record<string, EventStatus>;
  savedEvents: Record<string, boolean>;
  hiSent: Record<string, boolean>;
};

type CommunityActions = {
  toggleCircle: (id: string) => void;
  toggleSavePost: (id: number) => void;
  toggleHelpful: (id: number) => void;
  reportPost: (id: number) => void;
  addPost: (circleId: string, p: { type: CirclePostType; title: string; content: string; tags: string[]; author: string; authorProdi: string }) => void;
  addComment: (postId: number, content: string, author: string, authorProdi: string) => void;
  toggleSaveResource: (id: number) => void;
  joinRoom: (id: string, myName: string) => { ok: boolean; error?: string };
  leaveRoom: (id: string, myName: string) => void;
  addRoomMessage: (id: string, content: string, author: string) => void;
  createRoom: (r: {
    title: string;
    type: SkillRoom["type"];
    skill: string;
    level: SkillRoom["level"];
    description: string;
    dayLabel: string;
    capacity: number;
    host: string;
    hostProdi: string;
    sessionAt?: string;
    durationMin?: number;
    mode?: SkillRoom["mode"];
    location?: string;
    meetLink?: string;
    recurring?: SkillRoom["recurring"];
  }) => void;
  setRoomMeet: (id: string, meetLink: string) => void;
  submitRoomFeedback: (id: string) => void;
  setEventStatus: (id: string, status: EventStatus | null) => void;
  toggleSaveEvent: (id: string) => void;
  sendHi: (buddyId: string) => void;
};

type CommunityContextValue = CommunityState & CommunityActions;

const CommunityContext = createContext<CommunityContextValue | null>(null);

let nextPostId = 200;
let nextCommentId = 50;
let nextRoomId = 100;

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommunityState>({
    circles: SEED_CIRCLES,
    rooms: SEED_ROOMS,
    events: SEED_EVENTS,
    posts: SEED_POSTS,
    buddies: SEED_BUDDIES,
    joinedCircles: { "web-dev": true, academic: true },
    savedPosts: {},
    helpfulByMe: {},
    reportedPosts: {},
    joinedRooms: {},
    roomFeedback: {},
    savedResources: {},
    eventStatus: {},
    savedEvents: {},
    hiSent: {},
  });

  const toggleCircle = useCallback((id: string) => {
    setState((s) => {
      const joined = !s.joinedCircles[id];
      const delta = joined ? 1 : -1;
      return {
        ...s,
        joinedCircles: { ...s.joinedCircles, [id]: joined },
        circles: s.circles.map((c) => (c.id === id ? { ...c, members: Math.max(0, c.members + delta) } : c)),
      };
    });
  }, []);

  const toggleSavePost = useCallback((id: number) => {
    setState((s) => ({ ...s, savedPosts: { ...s.savedPosts, [id]: !s.savedPosts[id] } }));
  }, []);

  const toggleHelpful = useCallback((id: number) => {
    setState((s) => {
      const byMe = !!s.helpfulByMe[id];
      return {
        ...s,
        helpfulByMe: { ...s.helpfulByMe, [id]: !byMe },
        posts: s.posts.map((p) => (p.id === id ? { ...p, helpful: Math.max(0, p.helpful + (byMe ? -1 : 1)) } : p)),
      };
    });
  }, []);

  const reportPost = useCallback((id: number) => {
    setState((s) => ({ ...s, reportedPosts: { ...s.reportedPosts, [id]: true } }));
  }, []);

  const addPost = useCallback<CommunityActions["addPost"]>((circleId, p) => {
    setState((s) => ({
      ...s,
      posts: [
        {
          id: nextPostId++,
          circleId,
          author: p.author,
          authorProdi: (p.authorProdi.toUpperCase().slice(0, 2) || "IF") as CirclePost["authorProdi"],
          type: p.type,
          title: p.title,
          content: p.content,
          tags: p.tags,
          minutesAgo: 0,
          helpful: 0,
          comments: [],
          mine: true,
        },
        ...s.posts,
      ],
    }));
  }, []);

  const addComment = useCallback<CommunityActions["addComment"]>((postId, content, author, authorProdi) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: nextCommentId++, author, prodi: (authorProdi.toUpperCase().slice(0, 2) || "IF") as CirclePost["authorProdi"], minutesAgo: 0, content },
              ],
            }
          : p
      ),
    }));
  }, []);

  const toggleSaveResource = useCallback((id: number) => {
    setState((s) => ({ ...s, savedResources: { ...s.savedResources, [id]: !s.savedResources[id] } }));
  }, []);

  const joinRoom = useCallback<CommunityActions["joinRoom"]>((id, myName) => {
    const room = state.rooms.find((r) => r.id === id);
    if (!room) return { ok: false, error: "Room tidak ditemukan." };
    const status = roomStatus(room, !!state.joinedRooms[id]);
    if (status === "full") return { ok: false, error: "Room sudah penuh. Cari room lain atau buat sendiri, ya!" };
    if (status === "finished") return { ok: false, error: "Sesi ini sudah selesai." };
    setState((s) => ({
      ...s,
      joinedRooms: { ...s.joinedRooms, [id]: true },
      rooms: s.rooms.map((r) =>
        r.id === id && !r.participantNames.includes(myName)
          ? { ...r, participantNames: [...r.participantNames, myName] }
          : r
      ),
    }));
    return { ok: true };
  }, [state.rooms, state.joinedRooms]);

  const leaveRoom = useCallback<CommunityActions["leaveRoom"]>((id, myName) => {
    setState((s) => ({
      ...s,
      joinedRooms: { ...s.joinedRooms, [id]: false },
      rooms: s.rooms.map((r) =>
        r.id === id ? { ...r, participantNames: r.participantNames.filter((n) => n !== myName) } : r
      ),
    }));
  }, []);

  const addRoomMessage = useCallback<CommunityActions["addRoomMessage"]>((id, content, author) => {
    setState((s) => ({
      ...s,
      rooms: s.rooms.map((r) =>
        r.id === id
          ? { ...r, discussion: [...r.discussion, { id: nextCommentId++, author, prodi: "IF" as const, minutesAgo: 0, content }] }
          : r
      ),
    }));
  }, []);

  const createRoom = useCallback<CommunityActions["createRoom"]>((r) => {
    setState((s) => ({
      ...s,
      rooms: [
        {
          id: `room-${nextRoomId++}`,
          type: r.type,
          title: r.title,
          host: r.host,
          hostProdi: (r.hostProdi.toUpperCase().slice(0, 2) || "IF") as SkillRoom["hostProdi"],
          skill: r.skill,
          level: r.level,
          description: r.description,
          topics: [r.skill],
          dayLabel: r.dayLabel,
          inDays: r.sessionAt
            ? Math.max(0, Math.round((new Date(r.sessionAt).getTime() - Date.now()) / 86_400_000))
            : 1,
          capacity: r.capacity,
          participantNames: [],
          resources: [],
          discussion: [],
          sessionAt: r.sessionAt,
          durationMin: r.durationMin,
          mode: r.mode,
          location: r.location,
          meetLink: r.meetLink,
          recurring: r.recurring,
        },
        ...s.rooms,
      ],
    }));
  }, []);

  // Host menautkan Google Meet ke room yang sudah dibuat.
  const setRoomMeet = useCallback<CommunityActions["setRoomMeet"]>((id, meetLink) => {
    setState((s) => ({
      ...s,
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, meetLink } : r)),
    }));
  }, []);

  const submitRoomFeedback = useCallback<CommunityActions["submitRoomFeedback"]>((id) => {
    setState((s) => ({ ...s, roomFeedback: { ...s.roomFeedback, [id]: true } }));
  }, []);

  const setEventStatus = useCallback<CommunityActions["setEventStatus"]>((id, status) => {
    setState((s) => {
      const event = s.events.find((e) => e.id === id);
      const prev = s.eventStatus[id];
      // Kuota penuh → tolak pendaftaran baru (bukan pembatalan).
      if (
        status === "going" &&
        prev !== "going" &&
        event?.capacity &&
        event.goingNames.length >= event.capacity
      ) {
        return s;
      }
      const deltaInterested = (status === "interested" ? 1 : 0) - (prev === "interested" ? 1 : 0);
      let going = event?.goingNames ?? [];
      if (status === "going" && prev !== "going") {
        going = [...going, "Kamu"];
      } else if (status !== "going" && prev === "going") {
        going = going.filter((n) => n !== "Kamu");
      }
      return {
        ...s,
        eventStatus: { ...s.eventStatus, [id]: status ?? prev },
        events: s.events.map((e) =>
          e.id === id ? { ...e, interested: Math.max(0, e.interested + deltaInterested), goingNames: going } : e
        ),
      };
    });
  }, []);

  const toggleSaveEvent = useCallback<CommunityActions["toggleSaveEvent"]>((id) => {
    setState((s) => ({ ...s, savedEvents: { ...s.savedEvents, [id]: !s.savedEvents[id] } }));
  }, []);

  const sendHi = useCallback<CommunityActions["sendHi"]>((buddyId) => {
    setState((s) => ({ ...s, hiSent: { ...s.hiSent, [buddyId]: true } }));
  }, []);

  const value = useMemo<CommunityContextValue>(
    () => ({
      ...state,
      toggleCircle,
      toggleSavePost,
      toggleHelpful,
      reportPost,
      addPost,
      addComment,
      toggleSaveResource,
      joinRoom,
      leaveRoom,
      addRoomMessage,
      createRoom,
      setRoomMeet,
      submitRoomFeedback,
      setEventStatus,
      toggleSaveEvent,
      sendHi,
    }),
    [state,       toggleCircle, toggleSavePost, toggleHelpful, reportPost, addPost, addComment, toggleSaveResource, joinRoom, leaveRoom, addRoomMessage, createRoom, setRoomMeet, submitRoomFeedback, setEventStatus, toggleSaveEvent, sendHi]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity(): CommunityContextValue {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
