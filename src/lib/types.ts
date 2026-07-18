export type TeacherRole = "admin" | "teacher";
export type AttendanceStatus = "absent" | "present_am" | "present_pm";

export interface Teacher {
  id: string;
  email: string;
  name: string;
  role: TeacherRole;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface Student {
  id: string;
  name: string;
  class_name: string;
  active: boolean;
  created_at: string;
  deactivated_at: string | null;
}

export interface MarkedBy {
  id: string;
  name: string;
}

export type AttendanceLogEvent =
  | "status"
  | "needs_packed_lunch"
  | "absent_to_school";

export interface AttendanceStudent {
  student_id: string;
  name: string;
  class_name: string;
  status: AttendanceStatus;
  needs_packed_lunch: boolean;
  absent_to_school: boolean;
  marked_by: MarkedBy | null;
  marked_at: string | null;
}

export interface AttendanceDay {
  date: string;
  is_holiday: boolean;
  students: AttendanceStudent[];
}

export interface AttendanceLog {
  id: string;
  date: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  event_type: AttendanceLogEvent;
  status: AttendanceStatus | null;
  flag_value: boolean | null;
  created_at: string;
  message: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail?: string;
}
