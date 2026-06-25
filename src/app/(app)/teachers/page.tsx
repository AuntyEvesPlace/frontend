import { RequireAdmin } from "@/components/layout/require-auth";
import { TeachersPage } from "@/components/teachers/teachers-page";

export default function TeachersRoute() {
  return (
    <RequireAdmin>
      <TeachersPage />
    </RequireAdmin>
  );
}
