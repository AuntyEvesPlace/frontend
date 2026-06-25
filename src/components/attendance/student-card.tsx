"use client";

import { motion, useAnimation } from "framer-motion";
import { Check, UserRound } from "lucide-react";
import type { AttendanceStudent } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface StudentCardProps {
  student: AttendanceStudent;
  onToggle: (studentId: string) => void;
  pending?: boolean;
}

export function StudentCard({ student, onToggle, pending }: StudentCardProps) {
  const isPresent = student.status === "present";
  const controls = useAnimation();

  const handleClick = () => {
    if (pending) return;
    controls.start({
      scale: [1, 1.025, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    });
    onToggle(student.student_id);
  };

  return (
    <motion.button
      type="button"
      animate={controls}
      whileTap={{ scale: 0.98 }}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "w-full rounded-lg border px-4 py-3.5 text-left transition-colors duration-200",
        isPresent
          ? "border-present-border/30 bg-white shadow-[inset_3px_0_0_0_var(--color-maroon)]"
          : "border-red-100 bg-absent",
        pending && "pointer-events-none opacity-70",
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
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
            isPresent ? "bg-maroon text-white" : "bg-white text-stone-400 ring-1 ring-stone-200",
          )}
        >
          {isPresent ? <Check className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
        </div>
      </div>
    </motion.button>
  );
}
