import { RequireAdmin } from "@/components/layout/require-auth";
import { StudentsPage } from "@/components/students/students-page";

export default function StudentsRoute() {
  return (
    <RequireAdmin>
      <StudentsPage />
    </RequireAdmin>
  );
}
