"use client";

import { Clock3, Clock9, School, UserX, Utensils } from "lucide-react";
import type { AttendanceStatus, AttendanceStudent } from "@/lib/types";
import { statusAriaLabel } from "@/lib/attendance-status";
import { cn, formatTime } from "@/lib/utils";

const SEGMENTS: {
  status: AttendanceStatus;
  icon: typeof UserX;
  shortLabel: string;
  label: string;
}[] = [
  { status: "absent", icon: UserX, shortLabel: "Absent", label: "Absent" },
  {
    status: "present_am",
    icon: Clock9,
    shortLabel: "Before 12",
    label: "Present before 12",
  },
  {
    status: "present_pm",
    icon: Clock3,
    shortLabel: "After 12",
    label: "Present after 12",
  },
];

interface StudentCardProps {
  student: AttendanceStudent;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onFlagChange: (
    studentId: string,
    flag: "needs_packed_lunch" | "absent_to_school",
    value: boolean,
  ) => void;
  /** Holiday days show Absent / Before 12 / After 12. School days hide them. */
  showAttendance: boolean;
  attendanceEditable: boolean;
  pending?: boolean;
}

export function StudentCard({
  student,
  onStatusChange,
  onFlagChange,
  showAttendance,
  attendanceEditable,
  pending,
}: StudentCardProps) {
  const locked = student.absent_to_school;
  const canMarkAttendance = showAttendance && attendanceEditable && !locked && !pending;

  if (!showAttendance) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200 sm:gap-4 sm:px-4",
          locked
            ? "border-stone-300 bg-stone-100"
            : student.needs_packed_lunch
              ? "border-maroon/35 bg-white shadow-[inset_4px_0_0_0_var(--color-maroon)]"
              : "border-red-100 bg-white",
          pending && "opacity-70",
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-base font-semibold leading-tight sm:text-lg",
              locked ? "text-stone-500" : "text-stone-900",
            )}
          >
            {student.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">
            {locked
              ? "Out of school today"
              : student.marked_by
                ? `Marked by ${student.marked_by.name} at ${formatTime(student.marked_at)}`
                : "Not marked yet"}
          </p>
        </div>

        <div
          className="flex shrink-0 gap-2"
          role="group"
          aria-label={`${student.name} school day marks`}
        >
          <button
            type="button"
            disabled={pending || locked}
            aria-pressed={student.needs_packed_lunch}
            title="Packed lunch"
            onClick={() => {
              if (pending || locked) return;
              onFlagChange(
                student.student_id,
                "needs_packed_lunch",
                !student.needs_packed_lunch,
              );
            }}
            className={cn(
              "inline-flex h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:min-w-[7rem] sm:px-3",
              student.needs_packed_lunch
                ? "border-maroon bg-maroon text-white"
                : "border-border bg-stone-50 text-stone-700 hover:bg-white",
              locked && "opacity-45",
            )}
          >
            <Utensils className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">Lunch</span>
          </button>
          <button
            type="button"
            disabled={pending}
            aria-pressed={student.absent_to_school}
            title="No school"
            onClick={() => {
              if (pending) return;
              onFlagChange(
                student.student_id,
                "absent_to_school",
                !student.absent_to_school,
              );
            }}
            className={cn(
              "inline-flex h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:min-w-[7rem] sm:px-3",
              student.absent_to_school
                ? "border-stone-700 bg-stone-700 text-white"
                : "border-border bg-stone-50 text-stone-700 hover:bg-white",
            )}
          >
            <School className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">No school</span>
          </button>
        </div>
      </div>
    );
  }

  const cardAccent = locked
    ? "border-stone-200 bg-stone-100 opacity-80"
    : student.status === "present_am"
      ? "border-present-border/40 bg-white shadow-[inset_4px_0_0_0_var(--color-maroon)]"
      : student.status === "present_pm"
        ? "border-present-pm/40 bg-present-pm-muted shadow-[inset_4px_0_0_0_var(--color-present-pm)]"
        : "border-red-100 bg-absent";

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4 transition-colors duration-200 sm:px-5 sm:py-4",
        cardAccent,
        pending && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-lg font-semibold leading-snug sm:text-xl",
              locked ? "text-stone-500" : "text-stone-900",
            )}
          >
            {student.name}
          </p>
          <p className="mt-1 text-sm text-muted sm:text-base">
            {locked
              ? "Out of school today"
              : student.marked_by
                ? `Marked by ${student.marked_by.name} at ${formatTime(student.marked_at)}`
                : "Not marked yet"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <button
            type="button"
            disabled={pending || locked}
            aria-pressed={student.needs_packed_lunch}
            title="Packed lunch"
            onClick={() => {
              if (pending || locked) return;
              onFlagChange(
                student.student_id,
                "needs_packed_lunch",
                !student.needs_packed_lunch,
              );
            }}
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:text-sm",
              student.needs_packed_lunch
                ? "border-maroon bg-maroon text-white"
                : "border-border bg-white text-stone-600 hover:bg-stone-50",
              locked && "opacity-50",
            )}
          >
            <Utensils className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">Packed lunch</span>
          </button>
          <button
            type="button"
            disabled={pending}
            aria-pressed={student.absent_to_school}
            title="No school"
            onClick={() => {
              if (pending) return;
              onFlagChange(
                student.student_id,
                "absent_to_school",
                !student.absent_to_school,
              );
            }}
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:text-sm",
              student.absent_to_school
                ? "border-stone-500 bg-stone-600 text-white"
                : "border-border bg-white text-stone-600 hover:bg-stone-50",
            )}
          >
            <School className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">No school</span>
          </button>
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-2"
        role="group"
        aria-label={`${student.name} attendance`}
      >
        {SEGMENTS.map(({ status, icon: Icon, shortLabel, label }) => {
          const selected = student.status === status;
          return (
            <button
              key={status}
              type="button"
              disabled={!canMarkAttendance}
              title={
                locked
                  ? "Clear no school to mark attendance"
                  : !attendanceEditable
                    ? "Mark arrival on the day"
                    : label
              }
              aria-label={label}
              aria-pressed={selected}
              onClick={() => {
                if (!canMarkAttendance || selected) return;
                onStatusChange(student.student_id, status);
              }}
              className={cn(
                "flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-lg border px-1.5 py-2.5 text-center transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:min-h-[4.25rem]",
                selected &&
                  status === "absent" &&
                  "border-stone-300 bg-stone-200 text-stone-800",
                selected && status === "present_am" && "border-maroon bg-maroon text-white",
                selected &&
                  status === "present_pm" &&
                  "border-present-pm bg-present-pm text-white",
                !selected && "border-border bg-white text-stone-600 hover:bg-stone-50",
                !canMarkAttendance && "opacity-50 hover:bg-white",
              )}
            >
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
              <span className="text-sm font-semibold leading-tight sm:text-base">
                {shortLabel}
              </span>
            </button>
          );
        })}
      </div>
      {!attendanceEditable && !locked ? (
        <p className="mt-2 text-xs text-muted">Mark arrival on the day</p>
      ) : null}
      <p className="sr-only">Current status: {statusAriaLabel(student.status)}</p>
    </div>
  );
}
