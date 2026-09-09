import type { Metadata } from "next";
import { RegisterPage } from "@/components/RegisterPage";

export const metadata: Metadata = {
  title: "Daftar Akun Mahasiswa | FilBuddy - FILKOM UPI YPTK",
  description:
    "Daftar FilBuddy dengan NIM kampus UPI YPTK Padang, klaim 100 BuddyPoints gratis, dan mulai barter skill dengan teman se-Filkom.",
};

export default function Register() {
  return <RegisterPage />;
}
