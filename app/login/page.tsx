import type { Metadata } from "next";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = {
  title: "Masuk Akun Mahasiswa | FilBuddy - FILKOM UPI YPTK",
  description:
    "Masuk ke FilBuddy menggunakan NIM atau email kampus UPI YPTK Padang dan klaim 100 BuddyPoints untuk mulai barter skill.",
};

export default function Login() {
  return <LoginPage />;
}
