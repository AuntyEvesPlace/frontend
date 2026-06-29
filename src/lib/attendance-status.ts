import type { AttendanceStatus } from "@/lib/types";

export function isPresentStatus(status: AttendanceStatus): boolean {
  return status === "present_am" || status === "present_pm";
}

export function statusAriaLabel(status: AttendanceStatus): string {
  switch (status) {
    case "present_am":
      return "Present before 12";
    case "present_pm":
      return "Present after 12";
    default:
      return "Absent";
  }
}

export function statusLogLabel(status: AttendanceStatus): string {
  switch (status) {
    case "present_am":
      return "present before 12";
    case "present_pm":
      return "present after 12";
    default:
      return "absent";
  }
}
