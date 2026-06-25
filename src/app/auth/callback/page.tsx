"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (!access || !refresh) {
      setError("Missing authentication tokens. Try signing in again.");
      return;
    }

    setTokens(access, refresh);
    // Remove tokens from URL immediately
    window.history.replaceState({}, "", "/auth/callback");

    refreshUser()
      .then(() => router.replace("/attendance"))
      .catch(() => setError("Could not verify your session."));
  }, [params, router, refreshUser]);

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
