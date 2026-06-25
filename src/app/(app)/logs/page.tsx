import { RequireAdmin } from "@/components/layout/require-auth";
import { LogsPage } from "@/components/logs/logs-page";

export default function LogsRoute() {
  return (
    <RequireAdmin>
      <LogsPage />
    </RequireAdmin>
  );
}
