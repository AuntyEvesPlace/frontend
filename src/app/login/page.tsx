"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GoogleIcon, MicrosoftIcon, YahooIcon } from "@/components/auth/oauth-icons";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl, hasTokens, setTokens, type LoginProvider } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";

const oauthButtonClass =
  "h-12 w-full justify-center gap-3 border border-border bg-white text-[15px] font-medium text-stone-800 shadow-sm hover:bg-stone-50";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [redirecting, setRedirecting] = useState<LoginProvider | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localPending, setLocalPending] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!loading && (user || hasTokens())) {
      router.replace("/attendance");
    }
  }, [user, loading, router]);

  const startLogin = (provider: LoginProvider) => {
    setRedirecting(provider);
    window.location.href = getLoginUrl(provider);
  };

  const submitLocal = async (e: FormEvent) => {
    e.preventDefault();
    if (localPending || redirecting) return;
    setLocalPending(true);
    setLocalError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      if (!res.ok) {
        let message = "Invalid username or password";
        try {
          const err = await res.json();
          if (typeof err.detail === "string") message = err.detail;
        } catch {
          /* ignore */
        }
        setLocalError(message);
        return;
      }
      const data: TokenResponse = await res.json();
      setTokens(data.access_token, data.refresh_token);
      const ok = await refreshUser();
      if (ok) router.replace("/attendance");
      else setLocalError("Could not verify your session. Try again.");
    } catch {
      setLocalError("Could not sign in. Check your connection and try again.");
    } finally {
      setLocalPending(false);
    }
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

          <div className="mt-8 space-y-5 rounded-xl border border-red-100 bg-white p-6 shadow-sm">
            <form className="space-y-3" onSubmit={submitLocal}>
              <div className="space-y-1.5">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={localPending || Boolean(redirecting)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={localPending || Boolean(redirecting)}
                  className="h-11"
                />
              </div>
              {localError ? (
                <p className="text-sm text-dark-red">{localError}</p>
              ) : null}
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={
                  localPending ||
                  Boolean(redirecting) ||
                  !username.trim() ||
                  !password
                }
              >
                {localPending ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-red-100" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                or
              </span>
              <div className="h-px flex-1 bg-red-100" />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                className={oauthButtonClass}
                disabled={localPending || Boolean(redirecting)}
                onClick={() => startLogin("google")}
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                {redirecting === "google" ? "Redirecting…" : "Continue with Google"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={oauthButtonClass}
                disabled={localPending || Boolean(redirecting)}
                onClick={() => startLogin("microsoft")}
              >
                <MicrosoftIcon className="h-5 w-5 shrink-0" />
                {redirecting === "microsoft"
                  ? "Redirecting…"
                  : "Continue with Microsoft"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={oauthButtonClass}
                disabled={localPending || Boolean(redirecting)}
                onClick={() => startLogin("yahoo")}
              >
                <YahooIcon className="h-5 w-5 shrink-0" />
                {redirecting === "yahoo" ? "Redirecting…" : "Continue with Yahoo"}
              </Button>
            </div>

            <p className="pt-1 text-center text-xs leading-relaxed text-muted">
              Only invited staff can sign in. Ask the admin to add your account first.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
