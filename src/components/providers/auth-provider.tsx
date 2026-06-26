"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiRequestError } from "@/lib/api";
import { clearTokens, hasTokens } from "@/lib/auth";
import type { Teacher } from "@/lib/types";

interface AuthContextValue {
  user: Teacher | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!hasTokens()) {
      setUser(null);
      setLoading(false);
      return false;
    }
    try {
      const me = await api<Teacher>("/api/v1/auth/me");
      setUser(me);
      return true;
    } catch (e) {
      setUser(null);
      if (e instanceof ApiRequestError && e.status === 401) {
        clearTokens();
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // still clear locally
    }
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      refreshUser,
      logout,
    }),
    [user, loading, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
