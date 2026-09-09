import type { Metadata } from "next";
import { ForumPage } from "@/components/app/ForumPage";

export const metadata: Metadata = {
  title: "Forum Tanya Jawab | FilBuddy",
  description: "Tanya apa aja seputar kuliah & coding — dibalas oleh teman se-Filkom.",
};

export default function Forum() {
  return <ForumPage />;
}
