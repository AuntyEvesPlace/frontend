"use client";

import { Clock3, Clock9, Repeat, School, UserX, Utensils } from "lucide-react";
import type { AttendanceStatus, AttendanceStudent } from "@/lib/types";
import { statusAriaLabel } from "@/lib/attendance-status";
import { cn, formatTime } from "@/lib/utils";

const CARD_SHELL =
  "rounded-xl border px-4 py-4 transition-colors duration-200";

const ACTION_BTN =
  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-sm font-semibold leading-tight transition-colors active:scale-[0.98] disabled:cursor-not-allowed";

const ACTION_BTN_IDLE = "border-border bg-stone-50 text-stone-700 hover:bg-white";

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

function cardAccent(student: AttendanceStudent, isHoliday: boolean): string {
  if (!isHoliday) {
    if (student.absent_to_school) {
      return "border-stone-300 bg-stone-50 shadow-[inset_4px_0_0_0_#78716c]";
    }
    if (student.needs_packed_lunch) {
      return "border-red-100 bg-white shadow-[inset_4px_0_0_0_var(--color-maroon)]";
    }
    return "border-red-100 bg-white";
  }

  if (student.status === "present_am") {
    return "border-red-100 bg-white shadow-[inset_4px_0_0_0_var(--color-maroon)]";
  }
  if (student.status === "present_pm") {
    return "border-red-100 bg-white shadow-[inset_4px_0_0_0_var(--color-present-pm)]";
  }
  if (student.status === "absent") {
    return "border-stone-300 bg-stone-50 shadow-[inset_4px_0_0_0_#78716c]";
  }
  return "border-red-100 bg-white";
}

function selectedButtonClass(
  kind: "absent" | "maroon" | "stone" | "pm",
  selected: boolean,
): string {
  if (!selected) return ACTION_BTN_IDLE;
  switch (kind) {
    case "absent":
      return "border-stone-300 bg-stone-200 text-stone-800";
    case "maroon":
      return "border-maroon bg-maroon text-white";
    case "stone":
      return "border-stone-700 bg-stone-700 text-white";
    case "pm":
      return "border-present-pm bg-present-pm text-white";
  }
}

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
  const canMarkAttendance = showAttendance && attendanceEditable && !pending;

  const subtitle = !showAttendance
    ? locked
      ? "No lunch today"
      : student.marked_by
        ? `Marked by ${student.marked_by.name} at ${formatTime(student.marked_at)}`
        : "Not marked yet"
    : student.marked_by
      ? `Marked by ${student.marked_by.name} at ${formatTime(student.marked_at)}`
      : "Not marked yet";

  return (
    <div
      className={cn(CARD_SHELL, cardAccent(student, showAttendance), pending && "opacity-70")}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-base font-semibold leading-tight sm:text-lg",
            locked && !showAttendance ? "text-stone-500" : "text-stone-900",
          )}
        >
          {student.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted sm:text-sm">{subtitle}</p>
      </div>

      {!showAttendance ? (
        <div
          className="mt-3 grid grid-cols-2 gap-2"
          role="group"
          aria-label={`${student.name} school day marks`}
        >
          <button
            type="button"
            disabled={pending || locked}
            aria-pressed={student.needs_packed_lunch}
            title={
              student.packed_lunch_recurring
                ? "Packed lunch (every week)"
                : "Packed lunch"
            }
            onClick={() => {
              if (pending || locked) return;
              onFlagChange(
                student.student_id,
                "needs_packed_lunch",
                !student.needs_packed_lunch,
              );
            }}
            className={cn(
              ACTION_BTN,
              selectedButtonClass("maroon", student.needs_packed_lunch),
              student.packed_lunch_recurring &&
                !student.needs_packed_lunch &&
                "ring-2 ring-maroon/30 ring-offset-1",
              locked && "opacity-45",
            )}
          >
            <Utensils className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex items-center gap-1 whitespace-nowrap">
              Lunch
              {student.packed_lunch_recurring ? (
                <Repeat className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : null}
            </span>
          </button>
          <button
            type="button"
            disabled={pending}
            aria-pressed={student.absent_to_school}
            title="No lunch"
            onClick={() => {
              if (pending) return;
              onFlagChange(
                student.student_id,
                "absent_to_school",
                !student.absent_to_school,
              );
            }}
            className={cn(
              ACTION_BTN,
              selectedButtonClass("stone", student.absent_to_school),
            )}
          >
            <School className="h-5 w-5 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">No lunch</span>
          </button>
        </div>
      ) : (
        <>
          <div
            className="mt-3 grid grid-cols-3 gap-2"
            role="group"
            aria-label={`${student.name} attendance`}
          >
            {SEGMENTS.map(({ status, icon: Icon, shortLabel, label }) => {
              const selected = student.status === status;
              const kind =
                status === "absent"
                  ? "absent"
                  : status === "present_am"
                    ? "maroon"
                    : "pm";
              return (
                <button
                  key={status}
                  type="button"
                  disabled={!canMarkAttendance}
                  title={!attendanceEditable ? "Mark arrival on the day" : label}
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => {
                    if (!canMarkAttendance || selected) return;
                    onStatusChange(student.student_id, status);
                  }}
                  className={cn(
                    ACTION_BTN,
                    selectedButtonClass(kind, selected),
                    !canMarkAttendance && "opacity-50 hover:bg-stone-50",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">{shortLabel}</span>
                </button>
              );
            })}
          </div>
          {!attendanceEditable ? (
            <p className="mt-2 text-xs text-muted">Mark arrival on the day</p>
          ) : null}
          <p className="sr-only">Current status: {statusAriaLabel(student.status)}</p>
        </>
      )}
    </div>
  );
}
