"use client";

import { Clock3, Clock9, UserX } from "lucide-react";
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
  pending?: boolean;
}

export function StudentCard({ student, onStatusChange, pending }: StudentCardProps) {
  const cardAccent =
    student.status === "present_am"
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
      <p className="text-lg font-semibold leading-snug text-stone-900 sm:text-xl">
        {student.name}
      </p>
      <p className="mt-1 text-sm text-muted sm:text-base">
        {student.marked_by
          ? `Marked by ${student.marked_by.name} at ${formatTime(student.marked_at)}`
          : "Not marked yet"}
      </p>

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
              disabled={pending}
              title={label}
              aria-label={label}
              aria-pressed={selected}
              onClick={() => {
                if (pending || selected) return;
                onStatusChange(student.student_id, status);
              }}
              className={cn(
                "flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-lg border px-1.5 py-2.5 text-center transition-colors active:scale-[0.98] disabled:cursor-not-allowed sm:min-h-[4.25rem]",
                selected && status === "absent" && "border-stone-300 bg-stone-200 text-stone-800",
                selected && status === "present_am" && "border-maroon bg-maroon text-white",
                selected && status === "present_pm" && "border-present-pm bg-present-pm text-white",
                !selected && "border-border bg-white text-stone-600 hover:bg-stone-50",
              )}
            >
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
              <span className="text-sm font-semibold leading-tight sm:text-base">{shortLabel}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only">Current status: {statusAriaLabel(student.status)}</p>
    </div>
  );
}
