"use client";

import { Sunrise, Sunset, UserRound } from "lucide-react";
import type { AttendanceStatus, AttendanceStudent } from "@/lib/types";
import { statusAriaLabel } from "@/lib/attendance-status";
import { cn, formatTime } from "@/lib/utils";

const SEGMENTS: {
  status: AttendanceStatus;
  icon: typeof UserRound;
  label: string;
}[] = [
  { status: "absent", icon: UserRound, label: "Absent" },
  { status: "present_am", icon: Sunrise, label: "Present before 12" },
  { status: "present_pm", icon: Sunset, label: "Present after 12" },
];

interface StudentCardProps {
  student: AttendanceStudent;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  pending?: boolean;
}

export function StudentCard({ student, onStatusChange, pending }: StudentCardProps) {
  const cardAccent =
    student.status === "present_am"
      ? "border-present-border/30 bg-white shadow-[inset_3px_0_0_0_var(--color-maroon)]"
      : student.status === "present_pm"
        ? "border-present-pm/30 bg-present-pm-muted shadow-[inset_3px_0_0_0_var(--color-present-pm)]"
        : "border-red-100 bg-absent";

  return (
    <div
      className={cn(
        "min-h-14 rounded-lg border px-4 py-3 transition-colors duration-200",
        cardAccent,
        pending && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-900">{student.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {student.marked_by
              ? `Marked by ${student.marked_by.name} · ${formatTime(student.marked_at)}`
              : "Not marked yet"}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-white p-0.5"
          role="group"
          aria-label={`${student.name} attendance`}
        >
          {SEGMENTS.map(({ status, icon: Icon, label }) => {
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
                  "flex h-9 w-9 items-center justify-center rounded-md transition-colors active:scale-95 disabled:cursor-not-allowed",
                  selected && status === "absent" && "bg-stone-200 text-stone-700",
                  selected && status === "present_am" && "bg-maroon text-white",
                  selected && status === "present_pm" && "bg-present-pm text-white",
                  !selected && "text-stone-400 hover:bg-stone-50 hover:text-stone-600",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only">Current status: {statusAriaLabel(student.status)}</p>
    </div>
  );
}
