"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { HolidayControls } from "@/components/attendance/holiday-controls";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { PackedLunchRecurrence, Student } from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

interface CenterDayResponse {
  date: string;
  is_holiday: boolean;
}

/** Match Python date.weekday(): Monday = 0 … Sunday = 6 */
function pythonWeekday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1, 12, 0, 0);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function monthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1, 12, 0, 0));
}

function isoFromParts(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function CalendarPage() {
  const { isAdmin } = useAuth();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [rules, setRules] = useState<PackedLunchRecurrence[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addStudentId, setAddStudentId] = useState("");
  const [addStudentQuery, setAddStudentQuery] = useState("");
  const [addWeekday, setAddWeekday] = useState("0");
  const [addWeekdayLocked, setAddWeekdayLocked] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const monthFrom = isoFromParts(viewYear, viewMonth, 1);
  const monthTo = isoFromParts(viewYear, viewMonth, daysInMonth(viewYear, viewMonth));

  const loadHolidays = useCallback(async (from: string, to: string) => {
    const holidays = await api<CenterDayResponse[]>(
      `/api/v1/center-days/range?from=${from}&to=${to}`,
    );
    setHolidayDates(new Set(holidays.map((h) => h.date)));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rulesPromise = api<PackedLunchRecurrence[]>(
        "/api/v1/packed-lunch-recurrences",
      );
      const holidaysPromise = loadHolidays(monthFrom, monthTo);
      if (isAdmin) {
        const [rulesData, studentsData] = await Promise.all([
          rulesPromise,
          api<Student[]>("/api/v1/students"),
        ]);
        setRules(rulesData);
        setStudents(studentsData);
        await holidaysPromise;
      } else {
        const rulesData = await rulesPromise;
        setRules(rulesData);
        setStudents([]);
        await holidaysPromise;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, loadHolidays, monthFrom, monthTo]);

  useEffect(() => {
    load();
  }, [load]);

  const countsByWeekday = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const rule of rules) {
      if (rule.weekday >= 0 && rule.weekday <= 6) {
        counts[rule.weekday] += 1;
      }
    }
    return counts;
  }, [rules]);

  const selectedDate = useMemo(() => {
    if (!selectedIso) return null;
    return new Date(selectedIso + "T12:00:00");
  }, [selectedIso]);

  const selectedWeekday = selectedDate ? pythonWeekday(selectedDate) : null;
  const selectedIsHoliday = selectedIso ? holidayDates.has(selectedIso) : false;

  const dayRules = useMemo(() => {
    if (selectedWeekday === null) return [];
    return rules
      .filter((r) => r.weekday === selectedWeekday)
      .sort(
        (a, b) =>
          a.class_name.localeCompare(b.class_name) ||
          a.student_name.localeCompare(b.student_name),
      );
  }, [rules, selectedWeekday]);

  const eligibleStudents = useMemo(() => {
    const weekday = Number(addWeekday);
    const taken = new Set(
      rules.filter((r) => r.weekday === weekday).map((r) => r.student_id),
    );
    return students
      .filter((s) => !taken.has(s.id))
      .sort(
        (a, b) =>
          a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name),
      );
  }, [students, rules, addWeekday]);

  const filteredStudents = useMemo(() => {
    const query = addStudentQuery.trim().toLowerCase();
    if (!query) return eligibleStudents;
    return eligibleStudents.filter((s) => s.name.toLowerCase().includes(query));
  }, [eligibleStudents, addStudentQuery]);

  useEffect(() => {
    if (!addStudentId) return;
    if (!eligibleStudents.some((s) => s.id === addStudentId)) {
      setAddStudentId("");
    }
  }, [addStudentId, eligibleStudents]);

  const calendarCells = useMemo(() => {
    const totalDays = daysInMonth(viewYear, viewMonth);
    const first = startOfMonth(viewYear, viewMonth);
    const leading = (first.getDay() + 6) % 7;
    const cells: ({ day: number; iso: string; weekday: number } | null)[] = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      const iso = isoFromParts(viewYear, viewMonth, day);
      const d = new Date(iso + "T12:00:00");
      cells.push({ day, iso, weekday: pythonWeekday(d) });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1, 12, 0, 0);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const setHolidayForDate = (date: string, isHoliday: boolean) => {
    setHolidayDates((prev) => {
      const next = new Set(prev);
      if (isHoliday) next.add(date);
      else next.delete(date);
      return next;
    });
  };

  const openAdd = (opts?: { lockWeekday?: boolean }) => {
    const lockWeekday = Boolean(opts?.lockWeekday && selectedWeekday !== null);
    setAddStudentId("");
    setAddStudentQuery("");
    setAddWeekday(lockWeekday ? String(selectedWeekday) : "0");
    setAddWeekdayLocked(lockWeekday);
    setAddError("");
    setAddOpen(true);
  };

  const saveRule = async () => {
    if (!addStudentId) {
      setAddError("Pick a student");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      await api<PackedLunchRecurrence>("/api/v1/packed-lunch-recurrences", {
        method: "POST",
        body: JSON.stringify({
          student_id: addStudentId,
          weekday: Number(addWeekday),
        }),
      });
      setAddOpen(false);
      await load();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add rule");
    } finally {
      setAddSaving(false);
    }
  };

  const cancelRule = async (ruleId: string) => {
    setPendingId(ruleId);
    setError("");
    try {
      await api(`/api/v1/packed-lunch-recurrences/${ruleId}`, {
        method: "DELETE",
      });
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel rule");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description={
          isAdmin
            ? "Holidays and weekly packed lunch rules. Use Attendance for one-day lunch changes."
            : "View holidays and weekly packed lunch rules. Ask an admin to make changes."
        }
        action={
          isAdmin ? (
            <Button
              type="button"
              onClick={() => openAdd()}
              disabled={loading || students.length === 0}
            >
              <Plus className="h-4 w-4" />
              Add rule
            </Button>
          ) : undefined
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <ListSkeleton count={2} itemClassName="h-64" />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base font-semibold text-maroon sm:text-lg">
                {monthTitle(viewYear, viewMonth)}
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {isAdmin ? (
              <div className="mb-3">
                <HolidayControls
                  date={selectedIso ?? monthFrom}
                  isHoliday={selectedIsHoliday}
                  isAdmin
                  allowDayToggle={Boolean(selectedIso)}
                  onHolidayChange={(next) => {
                    if (selectedIso) {
                      setHolidayForDate(selectedIso, next);
                    }
                    void loadHolidays(monthFrom, monthTo);
                  }}
                  onError={setError}
                />
                {!selectedIso ? (
                  <p className="mt-2 text-xs text-muted">
                    Select a day to toggle holiday for that date, or use Set range.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-500 sm:gap-2">
              {WEEKDAY_SHORT.map((label) => (
                <div key={label} className="py-1">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="min-h-14 sm:min-h-16" />;
                }
                const count = countsByWeekday[cell.weekday];
                const selected = selectedIso === cell.iso;
                const holiday = holidayDates.has(cell.iso);
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedIso(cell.iso)}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-sm transition-colors active:scale-[0.98] sm:min-h-16",
                      selected
                        ? "border-maroon bg-maroon text-white"
                        : holiday
                          ? "border-present-pm/40 bg-present-pm-muted text-stone-800 hover:border-present-pm"
                          : "border-red-100 bg-white text-stone-800 hover:border-maroon/40 hover:bg-maroon/[0.03]",
                    )}
                  >
                    <span className="font-semibold tabular-nums">{cell.day}</span>
                    <span className="flex min-h-4 items-center gap-1">
                      {holiday ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs",
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-present-pm/20 text-present-pm",
                          )}
                        >
                          H
                        </span>
                      ) : null}
                      {count > 0 ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums sm:text-xs",
                            selected
                              ? "bg-white/20 text-white"
                              : "bg-maroon/10 text-maroon",
                          )}
                        >
                          {count}
                        </span>
                      ) : !holiday ? (
                        <span className="h-4" aria-hidden />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedIso && selectedWeekday !== null ? (
            <section className="space-y-3 rounded-xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-maroon">
                    {formatShortDate(selectedIso)}
                  </h3>
                  <p className="text-sm text-muted">
                    {selectedIsHoliday ? "Holiday" : "School day"} · every{" "}
                    {WEEKDAY_LABELS[selectedWeekday]}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted"
                  onClick={() => setSelectedIso(null)}
                  aria-label="Close day panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {dayRules.length === 0 ? (
                <EmptyState
                  title="No rules this weekday"
                  description={
                    isAdmin
                      ? "Add a rule to schedule packed lunch every week on this day."
                      : "No weekly packed lunch rules for this weekday."
                  }
                  action={
                    isAdmin ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openAdd({ lockWeekday: true })}
                      >
                        <Plus className="h-4 w-4" />
                        Add rule
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <ul className="divide-y divide-red-50">
                    {dayRules.map((rule) => (
                      <li
                        key={rule.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">
                            {rule.student_name}
                          </p>
                          <p className="truncate text-sm text-muted">
                            {rule.class_name}
                          </p>
                        </div>
                        {isAdmin ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={pendingId === rule.id}
                            onClick={() => cancelRule(rule.id)}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {isAdmin ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => openAdd({ lockWeekday: true })}
                      disabled={students.length === 0}
                    >
                      <Plus className="h-4 w-4" />
                      Add rule
                    </Button>
                  ) : null}
                </>
              )}
            </section>
          ) : (
            <p className="text-sm text-muted">
              Tap a day to see holidays and weekly lunch rules for that weekday.
            </p>
          )}
        </div>
      )}

      {isAdmin ? (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add lunch rule</DialogTitle>
              <DialogDescription>
                Schedule packed lunch every week for one student on one weekday.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lunch-rule-student">Student</Label>
                <Input
                  id="lunch-rule-student"
                  value={addStudentQuery}
                  onChange={(e) => setAddStudentQuery(e.target.value)}
                  placeholder="Search by name…"
                  autoComplete="off"
                  autoFocus
                />
                <ul className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {filteredStudents.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted">
                      No matching students
                    </li>
                  ) : (
                    filteredStudents.map((student) => {
                      const selected = student.id === addStudentId;
                      return (
                        <li key={student.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setAddStudentId(student.id);
                              setAddStudentQuery("");
                            }}
                            className={cn(
                              "flex w-full items-center px-3 py-2 text-left text-sm",
                              selected
                                ? "bg-maroon/10 font-semibold text-maroon"
                                : "text-stone-800 hover:bg-maroon/5",
                            )}
                          >
                            {student.name} ({student.class_name})
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
              {addWeekdayLocked ? (
                <p className="text-sm text-muted">
                  Every {WEEKDAY_LABELS[Number(addWeekday)] ?? "weekday"}
                </p>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="lunch-rule-weekday">Weekday</Label>
                  <Select value={addWeekday} onValueChange={setAddWeekday}>
                    <SelectTrigger id="lunch-rule-weekday">
                      <SelectValue placeholder="Select weekday" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_LABELS.map((label, idx) => (
                        <SelectItem key={label} value={String(idx)}>
                          Every {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {addError ? <ErrorBanner message={addError} /> : null}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddOpen(false)}
                  disabled={addSaving}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={saveRule}
                  disabled={addSaving || !addStudentId}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
