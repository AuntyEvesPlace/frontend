"use client";

import { Navbar } from "@/components/layout/navbar";
import { RequireAuth } from "@/components/layout/require-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#fafaf9]">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
