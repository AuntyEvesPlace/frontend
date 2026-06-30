"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Filter, Search, X } from "lucide-react";
import { StudentCard } from "@/components/attendance/student-card";
import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/ui/list-skeleton";
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
import { countAttendance, countByClass } from "@/lib/attendance-counts";
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

  const totals = useMemo(
    () => countAttendance(data?.students ?? []),
    [data],
  );

  const byClass = useMemo(
    () => countByClass(data?.students ?? [], classOptions),
    [data, classOptions],
  );

  const countsByClass = useMemo(
    () => new Map(byClass.map((row) => [row.className, row.counts])),
    [byClass],
  );

  const isToday = date === todayIso();
  const hasFilters = search.length > 0 || classFilter !== "all";
  const filteredTotal = data?.students.length ?? 0;

  const clearFilters = () => {
    setSearch("");
    setClassFilter("all");
  };

  const handleRemoteSync = useCallback((remote: AttendanceDay) => {
    setData((prev) => {
      if (!prev) return remote;
      if (!attendanceDayChanged(prev, remote)) return prev;
      return mergeAttendance(prev, remote, pendingIdRef.current);
    });
  }, []);

  useAttendancePoll(date, isToday && !loading, handleRemoteSync);

  const setStatus = async (studentId: string, next: AttendanceStatus) => {
    if (!data || pendingId) return;
    const student = data.students.find((s) => s.student_id === studentId);
    if (!student || student.status === next) return;

    setPendingId(studentId);
    setError("");

    const snapshot = student;
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
        title={isAdmin ? formatDate(date) : `Today, ${formatDate(date)}`}
        description={
          isAdmin && !isToday
            ? "Viewing a past day. Changes only apply to this date."
            : undefined
        }
      />

      {!loading && data && data.students.length > 0 ? (
        <AttendanceSummary totals={totals} byClass={byClass} isToday={isToday} />
      ) : null}

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9"
            aria-label="Search students by name"
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
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value || todayIso())}
                  className="h-11 min-w-0 flex-1 pl-9"
                  aria-label="Attendance date"
                />
                {!isToday ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 shrink-0 px-3"
                    onClick={() => setDate(todayIso())}
                  >
                    Today
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {hasFilters ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm text-muted">
            <span>
              Showing {filtered.length} of {filteredTotal}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-dark-red"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <ListSkeleton count={4} itemClassName="h-36" />
      ) : !data || data.students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Add children in the Students page before marking attendance."
        />
      ) : grouped.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a different name or class filter."
          action={
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-7">
          {grouped.map(([className, students]) => {
            const classCounts = countsByClass.get(className);
            return (
            <section key={className}>
              <div className="mb-3 space-y-1 border-b border-red-100 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-dark-red sm:text-lg">{className}</h2>
                  <span className="shrink-0 text-sm text-muted">
                    {students.length} {students.length === 1 ? "child" : "children"}
                  </span>
                </div>
                {classCounts ? (
                  <p className="text-sm tabular-nums text-stone-600">
                    <span className="font-semibold text-maroon">{classCounts.present}</span> present
                    {" · "}
                    <span className="font-medium text-maroon">{classCounts.am}</span> before 12
                    {" · "}
                    <span className="font-medium text-present-pm">{classCounts.pm}</span> after 12
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3">
                {students.map((student) => (
                  <StudentCard
                    key={student.student_id}
                    student={student}
                    onStatusChange={setStatus}
                    pending={pendingId === student.student_id}
                  />
                ))}
              </div>
            </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
