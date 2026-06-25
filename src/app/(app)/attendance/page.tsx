"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AttendanceBoard } from "@/components/attendance/attendance-board";

export default function AttendancePage() {
  const { isAdmin } = useAuth();
  return <AttendanceBoard isAdmin={isAdmin} />;
}
