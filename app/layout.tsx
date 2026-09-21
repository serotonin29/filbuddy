import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppStoreProvider } from "@/lib/store";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = Geist_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FilBuddy - Platform Peer-to-Peer Skill Exchange Filkom UPI YPTK Padang",
  description:
    "Nggak perlu uang buat belajar skill baru. Barter ilmu dengan mahasiswa Filkom UPI YPTK Padang, kumpulkan BuddyPoints, dan naik level bareng teman seangkatan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-body-md text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
