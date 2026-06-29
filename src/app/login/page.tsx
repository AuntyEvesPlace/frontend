"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GoogleIcon, MicrosoftIcon } from "@/components/auth/oauth-icons";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getLoginUrl, hasTokens, type LoginProvider } from "@/lib/auth";

const oauthButtonClass =
  "h-12 w-full justify-center gap-3 border border-border bg-white text-[15px] font-medium text-stone-800 shadow-sm hover:bg-stone-50";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [redirecting, setRedirecting] = useState<LoginProvider | null>(null);

  useEffect(() => {
    if (!loading && (user || hasTokens())) {
      router.replace("/attendance");
    }
  }, [user, loading, router]);

  const startLogin = (provider: LoginProvider) => {
    setRedirecting(provider);
    window.location.href = getLoginUrl(provider);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col px-4">
      <div className="flex flex-1 flex-col justify-center py-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-maroon">
            Aunty Eve&apos;s Place
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-muted">
            Sign in to mark daily attendance
          </p>

          <div className="mt-8 space-y-3 rounded-xl border border-red-100 bg-white p-6 shadow-sm">
            <Button
              variant="secondary"
              className={oauthButtonClass}
              disabled={Boolean(redirecting)}
              onClick={() => startLogin("google")}
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              {redirecting === "google" ? "Redirecting…" : "Continue with Google"}
            </Button>
            <Button
              variant="secondary"
              className={oauthButtonClass}
              disabled={Boolean(redirecting)}
              onClick={() => startLogin("microsoft")}
            >
              <MicrosoftIcon className="h-5 w-5 shrink-0" />
              {redirecting === "microsoft" ? "Redirecting…" : "Continue with Microsoft"}
            </Button>
            <p className="pt-1 text-center text-xs leading-relaxed text-muted">
              Only invited staff can sign in. Ask the admin to add your email first.
            </p>
          </div>
        </motion.div>
      </div>
      <p className="pb-safe text-center text-[11px] text-stone-400">
        Internal use only
      </p>
    </div>
  );
}
