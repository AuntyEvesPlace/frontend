"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, UserMinus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClassSelect } from "@/components/ui/class-select";
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
import { useClasses } from "@/lib/classes";
import type { Student } from "@/lib/types";

export function StudentsPage() {
  const { classes } = useClasses();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Student[]>("/api/v1/students");
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (classes.length > 0 && !className) {
      setClassName(classes[0]);
    }
  }, [classes, className]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setClassName(classes[0] ?? "");
    setError("");
    setOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setName(student.name);
    setClassName(student.class_name);
    setError("");
    setOpen(true);
  };

  const save = async () => {
    setError("");
    try {
      if (editing) {
        await api(`/api/v1/students/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, class_name: className }),
        });
      } else {
        await api("/api/v1/students", {
          method: "POST",
          body: JSON.stringify({ name, class_name: className }),
        });
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const deactivate = async (id: string) => {
    await api(`/api/v1/students/${id}`, { method: "DELETE" });
    setConfirmId(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roster"
        title="Students"
        action={
          <Button onClick={openCreate} size="sm" disabled={classes.length === 0}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p className="text-sm text-muted">No students yet. Add your first child.</p>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{student.name}</p>
                  <p className="text-xs text-muted">{student.class_name}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmId(student.id)}>
                    <UserMinus className="h-4 w-4 text-dark-red" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
            <DialogDescription>Choose a class from the list.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <ClassSelect
              value={className}
              onValueChange={setClassName}
              classes={classes}
            />
            {error && <p className="text-sm text-dark-red">{error}</p>}
            <Button className="w-full" onClick={save} disabled={!name || !className}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmId)} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove student?</DialogTitle>
            <DialogDescription>
              They&apos;ll be hidden from attendance but history is kept.
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
