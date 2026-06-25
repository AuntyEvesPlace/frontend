"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Filter, Search } from "lucide-react";
import { StudentCard } from "@/components/attendance/student-card";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendancePoll } from "@/hooks/use-attendance-poll";
import { api } from "@/lib/api";
import { attendanceDayChanged, mergeAttendance } from "@/lib/attendance-merge";
import { sortByClassOrder, useClasses } from "@/lib/classes";
import type { AttendanceDay, AttendanceStatus, AttendanceStudent } from "@/lib/types";
import { formatDate, todayIso } from "@/lib/utils";

interface AttendanceBoardProps {
  isAdmin: boolean;
}

export function AttendanceBoard({ isAdmin }: AttendanceBoardProps) {
  const { classes: classOptions } = useClasses();
  const [date, setDate] = useState(todayIso());
  const [data, setData] = useState<AttendanceDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pendingIdRef = useRef(pendingId);
  pendingIdRef.current = pendingId;

  const load = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await api<AttendanceDay>(`/api/v1/attendance?date=${targetDate}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === "all" || s.class_name === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [data, search, classFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, AttendanceStudent[]>();
    for (const student of filtered) {
      const list = map.get(student.class_name) ?? [];
      list.push(student);
      map.set(student.class_name, list);
    }
    const keys = sortByClassOrder([...map.keys()], classOptions);
    return keys.map((key) => [key, map.get(key)!] as const);
  }, [filtered, classOptions]);

  const presentCount = useMemo(() => {
    if (!data) return { present: 0, total: 0 };
    const present = data.students.filter((s) => s.status === "present").length;
    return { present, total: data.students.length };
  }, [data]);

  const isToday = date === todayIso();

  const handleRemoteSync = useCallback((remote: AttendanceDay) => {
    setData((prev) => {
      if (!prev) return remote;
      if (!attendanceDayChanged(prev, remote)) return prev;
      return mergeAttendance(prev, remote, pendingIdRef.current);
    });
  }, []);

  useAttendancePoll(date, isToday && !loading, handleRemoteSync);

  const toggle = async (studentId: string) => {
    if (!data || pendingId) return;
    const student = data.students.find((s) => s.student_id === studentId);
    if (!student) return;

    const next: AttendanceStatus = student.status === "present" ? "absent" : "present";
    setPendingId(studentId);
    setError("");

    const snapshot = data.students.find((s) => s.student_id === studentId)!;
    setData({
      ...data,
      students: data.students.map((s) =>
        s.student_id === studentId ? { ...s, status: next } : s,
      ),
    });

    try {
      const updated = await api<AttendanceStudent>(`/api/v1/attendance/${studentId}`, {
        method: "PUT",
        body: JSON.stringify({ date, status: next }),
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              students: prev.students.map((s) =>
                s.student_id === studentId ? updated : s,
              ),
            }
          : prev,
      );
    } catch (e) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              students: prev.students.map((s) =>
                s.student_id === studentId ? snapshot : s,
              ),
            }
          : prev,
      );
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily roll call"
        title={isAdmin ? formatDate(date) : `Today — ${formatDate(date)}`}
      />

      {!loading && data && data.students.length > 0 && (
        <div className="flex items-baseline gap-2 rounded-lg border border-red-100 bg-white px-4 py-3">
          <span className="text-3xl font-semibold tabular-nums text-maroon">
            {presentCount.present}
          </span>
          <div className="text-sm text-muted">
            <span className="text-stone-700">present</span>
            {isToday ? " today" : ""}
            <span className="text-stone-400"> · </span>
            <span>{presentCount.total} total</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9"
          />
        </div>

        <div
          className={
            isAdmin
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : "grid grid-cols-1 gap-3"
          }
        >
          <div className="relative min-w-0">
            <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-11 pl-9">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="relative min-w-0">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full pl-9"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-absent px-3 py-2 text-sm text-dark-red">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[4.25rem] animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No students match your filters.</p>
      ) : (
        <div className="space-y-7">
          {grouped.map(([className, students]) => (
            <section key={className}>
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-red-100 pb-2">
                <h2 className="text-sm font-semibold text-dark-red">{className}</h2>
                <span className="shrink-0 text-xs text-muted">
                  {students.length} {students.length === 1 ? "child" : "children"}
                </span>
              </div>
              <div className="grid gap-2.5">
                {students.map((student) => (
                  <StudentCard
                    key={student.student_id}
                    student={student}
                    onToggle={toggle}
                    pending={pendingId === student.student_id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
