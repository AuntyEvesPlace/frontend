import type { AttendanceStudent } from "@/lib/types";

export interface AttendanceCounts {
  /** Students expected today (excludes absent-to-school). */
  total: number;
  present: number;
  am: number;
  pm: number;
  absent: number;
  packedLunch: number;
  absentToSchool: number;
  rosterTotal: number;
}

export function countAttendance(students: AttendanceStudent[]): AttendanceCounts {
  const rosterTotal = students.length;
  const absentToSchool = students.filter((s) => s.absent_to_school).length;
  const expected = students.filter((s) => !s.absent_to_school);
  const total = expected.length;
  const am = expected.filter((s) => s.status === "present_am").length;
  const pm = expected.filter((s) => s.status === "present_pm").length;
  const present = am + pm;
  const packedLunch = expected.filter((s) => s.needs_packed_lunch).length;
  return {
    total,
    am,
    pm,
    present,
    absent: total - present,
    packedLunch,
    absentToSchool,
    rosterTotal,
  };
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
