"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Mail, Plus, Shield, ShieldOff, User, UserMinus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { api } from "@/lib/api";
import type { Teacher, TeacherRole, TeacherWithCredentials } from "@/lib/types";
import { cn } from "@/lib/utils";

type RoleAction = { id: string; role: TeacherRole; name: string };
type InviteMode = "oauth" | "local";
type CredentialsReveal = {
  name: string;
  username: string;
  password: string;
  title: string;
};

export function TeachersPage() {
  const { user, refreshUser } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [roleAction, setRoleAction] = useState<RoleAction | null>(null);
  const [inviteMode, setInviteMode] = useState<InviteMode>("oauth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<CredentialsReveal | null>(null);
  const [copied, setCopied] = useState(false);

  const canManageRoles = user?.can_manage_roles ?? false;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Teacher[]>("/api/v1/teachers");
      setTeachers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetInviteForm = () => {
    setName("");
    setEmail("");
    setUsername("");
    setInviteMode("oauth");
    setError("");
  };

  const invite = async () => {
    setError("");
    try {
      const body =
        inviteMode === "oauth"
          ? { name, email, role: "teacher" as const }
          : { name, username: username.trim().toLowerCase(), role: "teacher" as const };
      const res = await api<TeacherWithCredentials>("/api/v1/teachers", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setOpen(false);
      resetInviteForm();
      await load();
      if (res.generated_password && res.teacher.username) {
        setCredentials({
          name: res.teacher.name,
          username: res.teacher.username,
          password: res.generated_password,
          title: "Teacher created",
        });
        setCopied(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invite failed");
    }
  };

  const deactivate = async (id: string) => {
    setError("");
    try {
      await api(`/api/v1/teachers/${id}`, { method: "DELETE" });
      setConfirmId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove teacher");
    }
  };

  const changeRole = async (action: RoleAction) => {
    setError("");
    try {
      await api(`/api/v1/teachers/${action.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: action.role }),
      });
      setRoleAction(null);
      await load();
      if (user?.id === action.id) {
        await refreshUser();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const resetPassword = async (teacher: Teacher) => {
    setError("");
    try {
      const res = await api<{ generated_password: string }>(
        `/api/v1/teachers/${teacher.id}/reset-password`,
        { method: "POST" },
      );
      setCredentials({
        name: teacher.name,
        username: teacher.username ?? "",
        password: res.generated_password,
        title: "Password reset",
      });
      setCopied(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password");
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;
    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const inviteValid =
    Boolean(name.trim()) &&
    (inviteMode === "oauth" ? Boolean(email.trim()) : Boolean(username.trim()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Invite staff by email (OAuth) or username (password login)."
        action={
          <Button
            onClick={() => {
              resetInviteForm();
              setOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Invite
          </Button>
        }
      />

      {error && !open && !confirmId && !roleAction && !credentials ? (
        <ErrorBanner message={error} />
      ) : null}

      {loading ? (
        <ListSkeleton count={2} itemClassName="h-20" />
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No teachers invited"
          description="Add staff so they can sign in and mark attendance."
          action={
            <Button
              onClick={() => {
                resetInviteForm();
                setOpen(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Invite teacher
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {teachers.map((teacher) => {
            const isLocal = teacher.auth_mode === "local";
            const identity = isLocal
              ? teacher.username ?? "—"
              : teacher.email ?? "—";
            return (
              <Card key={teacher.id}>
                <CardContent className="flex items-center justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {teacher.name}
                      {teacher.role === "admin" && (
                        <span className="ml-2 text-xs font-normal text-dark-red">
                          admin
                        </span>
                      )}
                      <span className="ml-2 text-xs font-normal text-muted">
                        {isLocal ? "username" : "email"}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                      {isLocal ? (
                        <User className="h-3 w-3 shrink-0" />
                      ) : (
                        <Mail className="h-3 w-3 shrink-0" />
                      )}
                      {identity}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {teacher.last_login_at ? "Active" : "Pending first login"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {isLocal ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Reset password for ${teacher.name}`}
                        onClick={() => resetPassword(teacher)}
                      >
                        <KeyRound className="h-4 w-4 text-muted" />
                      </Button>
                    ) : null}
                    {canManageRoles && teacher.id !== user?.id ? (
                      teacher.role === "admin" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove admin from ${teacher.name}`}
                          onClick={() =>
                            setRoleAction({
                              id: teacher.id,
                              role: "teacher",
                              name: teacher.name,
                            })
                          }
                        >
                          <ShieldOff className="h-4 w-4 text-muted" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Make ${teacher.name} admin`}
                          onClick={() =>
                            setRoleAction({
                              id: teacher.id,
                              role: "admin",
                              name: teacher.name,
                            })
                          }
                        >
                          <Shield className="h-4 w-4 text-dark-red" />
                        </Button>
                      )
                    ) : null}
                    {teacher.role !== "admin" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${teacher.name}`}
                        onClick={() => setConfirmId(teacher.id)}
                      >
                        <UserMinus className="h-4 w-4 text-dark-red" />
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetInviteForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite teacher</DialogTitle>
            <DialogDescription>
              Choose email (Google / Microsoft / Yahoo) or username + generated
              password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInviteMode("oauth")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  inviteMode === "oauth"
                    ? "border-maroon bg-maroon text-white"
                    : "border-border bg-white text-stone-700 hover:bg-stone-50",
                )}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setInviteMode("local")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  inviteMode === "local"
                    ? "border-maroon bg-maroon text-white"
                    : "border-border bg-white text-stone-700 hover:bg-stone-50",
                )}
              >
                Username
              </button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {inviteMode === "oauth" ? (
              <div className="space-y-1.5">
                <Label htmlFor="t-email">Email</Label>
                <Input
                  id="t-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="t-username">Username</Label>
                <Input
                  id="t-username"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. maya"
                />
                <p className="text-xs text-muted">
                  3–32 characters: letters, numbers, underscore, or hyphen.
                </p>
              </div>
            )}
            {error && <p className="text-sm text-dark-red">{error}</p>}
            <Button className="w-full" onClick={invite} disabled={!inviteValid}>
              {inviteMode === "local" ? "Create account" : "Send invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(credentials)}
        onOpenChange={(next) => {
          if (!next) {
            setCredentials(null);
            setCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{credentials?.title ?? "Credentials"}</DialogTitle>
            <DialogDescription>
              Copy these now. The password will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {credentials ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">{credentials.name}</p>
              <div className="space-y-2 rounded-lg border border-red-100 bg-stone-50 p-3 font-mono text-sm">
                <p>
                  <span className="text-muted">Username:</span> {credentials.username}
                </p>
                <p>
                  <span className="text-muted">Password:</span> {credentials.password}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={copyCredentials}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    setCredentials(null);
                    setCopied(false);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmId)} onOpenChange={() => { setConfirmId(null); setError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove teacher?</DialogTitle>
            <DialogDescription>They won&apos;t be able to sign in anymore.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {error && <p className="text-sm text-dark-red">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => confirmId && deactivate(confirmId)}
              >
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(roleAction)} onOpenChange={() => { setRoleAction(null); setError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {roleAction?.role === "admin" ? "Make admin?" : "Remove admin?"}
            </DialogTitle>
            <DialogDescription>
              {roleAction?.role === "admin"
                ? `${roleAction.name} will be able to manage students, teachers, and logs.`
                : `${roleAction?.name} will lose admin access but can still mark attendance.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {error && <p className="text-sm text-dark-red">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setRoleAction(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => roleAction && changeRole(roleAction)}
              >
                {roleAction?.role === "admin" ? "Make admin" : "Remove admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
