"use client";

import type { ReactNode } from "react";
import { isSupabaseConfigured } from "./supabase/client";
import { DemoStoreProvider } from "./demoStore";
import { SupabaseStoreProvider } from "./supabaseStore";
import { useStoreContext } from "./storeContext";

export {
  CATEGORIES,
  levelOf,
  formatRelative,
  type Store,
  type User,
  type Question,
  type Answer,
  type Slot,
  type Activity,
  type StudyMode,
  type QuestionStatus,
  type SlotStatus,
  type TeachSkill,
  type LearnSkill,
} from "./storeTypes";

export function useStore() {
  return useStoreContext();
}

/**
 * Memilih penyimpanan data:
 * - Supabase terkonfigurasi → database online
 *   (auto-fallback ke mode demo kalau schema belum dijalankan)
 * - Tidak terkonfigurasi → mode demo localStorage
 */
export function AppStoreProvider({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) {
    return <SupabaseStoreProvider>{children}</SupabaseStoreProvider>;
  }
  return <DemoStoreProvider>{children}</DemoStoreProvider>;
}
