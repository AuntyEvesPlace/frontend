import type { AttendanceStudent } from "@/lib/types";

export interface AttendanceCounts {
  total: number;
  present: number;
  am: number;
  pm: number;
  absent: number;
}

export function countAttendance(students: AttendanceStudent[]): AttendanceCounts {
  const total = students.length;
  const am = students.filter((s) => s.status === "present_am").length;
  const pm = students.filter((s) => s.status === "present_pm").length;
  return { total, am, pm, present: am + pm, absent: total - am - pm };
}

export function countByClass(
  students: AttendanceStudent[],
  classOrder: string[],
): { className: string; counts: AttendanceCounts }[] {
  const map = new Map<string, AttendanceStudent[]>();
  for (const student of students) {
    const list = map.get(student.class_name) ?? [];
    list.push(student);
    map.set(student.class_name, list);
  }

  const ordered = [
    ...classOrder.filter((c) => map.has(c)),
    ...[...map.keys()].filter((c) => !classOrder.includes(c)).sort(),
  ];

  return ordered.map((className) => ({
    className,
    counts: countAttendance(map.get(className) ?? []),
  }));
}
