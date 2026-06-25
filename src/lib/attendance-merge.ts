import type { AttendanceDay, AttendanceStudent } from "@/lib/types";

export function mergeAttendance(
  current: AttendanceDay,
  remote: AttendanceDay,
  pendingStudentId: string | null,
): AttendanceDay {
  const pendingStudent = pendingStudentId
    ? current.students.find((s) => s.student_id === pendingStudentId)
    : null;

  const students = remote.students.map((remoteStudent) => {
    if (pendingStudent && remoteStudent.student_id === pendingStudentId) {
      return pendingStudent;
    }
    return remoteStudent;
  });

  return { ...remote, students };
}

export function attendanceStudentChanged(
  a: AttendanceStudent,
  b: AttendanceStudent,
): boolean {
  return (
    a.status !== b.status ||
    a.marked_by?.id !== b.marked_by?.id ||
    a.marked_at !== b.marked_at
  );
}

export function attendanceDayChanged(
  current: AttendanceDay,
  remote: AttendanceDay,
): boolean {
  if (current.students.length !== remote.students.length) return true;
  const remoteById = new Map(remote.students.map((s) => [s.student_id, s]));
  return current.students.some((s) => {
    const other = remoteById.get(s.student_id);
    return !other || attendanceStudentChanged(s, other);
  });
}
