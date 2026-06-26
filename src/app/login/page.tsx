"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getLoginUrl, hasTokens } from "@/lib/auth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user || hasTokens())) {
      router.replace("/attendance");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9] px-4">
      <div className="flex flex-1 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-sm"
        >
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-maroon">
            Aunty Eve&apos;s Place
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Sign in to mark daily attendance
          </p>

          <div className="mt-8 rounded-xl border border-red-100 bg-white p-6 shadow-sm">
            <Button
              className="h-11 w-full text-base"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Continue with Google
            </Button>
            <p className="mt-4 text-center text-xs leading-relaxed text-muted">
              Only invited staff can access this app. Contact the admin if your email
              isn&apos;t on the list.
            </p>
          </div>
        </motion.div>
      </div>
      <p className="pb-6 text-center text-[11px] text-stone-400">
        Internal use only · Aunty Eve&apos;s Place
      </p>
    </div>
  );
}
