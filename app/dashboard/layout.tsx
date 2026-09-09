import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "Dashboard Mahasiswa | FilBuddy",
  description: "Dashboard barter skill FilBuddy — match, slot, dan aktivitasmu.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
