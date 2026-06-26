"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Plus, UserMinus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Teacher } from "@/lib/types";

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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

  const invite = async () => {
    setError("");
    try {
      await api("/api/v1/teachers", {
        method: "POST",
        body: JSON.stringify({ name, email, role: "teacher" }),
      });
      setOpen(false);
      setName("");
      setEmail("");
      await load();
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title="Teachers"
        action={
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Invite
          </Button>
        }
      />

      {error && !open && !confirmId && (
        <p className="rounded-md border border-red-200 bg-absent px-3 py-2 text-sm text-dark-red">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {teacher.name}
                    {teacher.role === "admin" && (
                      <span className="ml-2 text-xs font-normal text-dark-red">admin</span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                    <Mail className="h-3 w-3 shrink-0" />
                    {teacher.email}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {teacher.last_login_at ? "Active" : "Pending first login"}
                  </p>
                </div>
                {teacher.role !== "admin" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setConfirmId(teacher.id)}
                  >
                    <UserMinus className="h-4 w-4 text-dark-red" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite teacher</DialogTitle>
            <DialogDescription>
              They can sign in with Google once their email is on this list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">Email</Label>
              <Input
                id="t-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-dark-red">{error}</p>}
            <Button className="w-full" onClick={invite} disabled={!name || !email}>
              Send invite
            </Button>
          </div>
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
    </div>
  );
}
