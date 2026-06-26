"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";

function readTokensFromUrl(): { access: string | null; refresh: string | null } {
  const search = new URLSearchParams(window.location.search);
  return {
    access: search.get("access_token"),
    refresh: search.get("refresh_token"),
  };
}

function CallbackHandler() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const { access, refresh } = readTokensFromUrl();

    if (!access || !refresh) {
      setError("Missing authentication tokens. Try signing in again.");
      return;
    }

    setTokens(access, refresh);
    window.history.replaceState({}, "", "/auth/callback");

    refreshUser()
      .then((ok) => {
        if (ok) router.replace("/attendance");
        else setError("Could not verify your session. The server may still be waking up — try again.");
      })
      .catch(() => setError("Could not verify your session."));
  }, [router, refreshUser]);

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-dark-red">{error}</p>
        <a href="/login" className="mt-4 inline-block text-sm text-maroon underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dark-red border-t-transparent" />
      <p className="text-sm text-muted">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] px-4">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-dark-red border-t-transparent" />
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
