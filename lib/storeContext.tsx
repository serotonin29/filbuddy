"use client";

import { createContext, useContext } from "react";
import type { Store } from "./storeTypes";

/** Context tunggal yang dipakai semua implementasi store (demo & supabase). */
export const StoreContext = createContext<Store | null>(null);

export function useStoreContext(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppStoreProvider");
  return ctx;
}
