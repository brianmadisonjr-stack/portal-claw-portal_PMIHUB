import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsAuditLogPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/audit-log")}`);
  }

  return (
    <SettingsShell
      title="Audit log"
      subtitle="Track sensitive actions (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon. (Exports currently log to server console as a v1 stub.)</p>
    </SettingsShell>
  );
}
