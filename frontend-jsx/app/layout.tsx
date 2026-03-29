import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Balatoni Vityilló",
  description: "Felújításmenedzsment, bérbeadás és ingatlanügyintézés a Balaton körül.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <main className="site-shell">{children}</main>
      </body>
    </html>
  );
}