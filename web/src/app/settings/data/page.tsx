import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsDataPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/data")}`);
  }

  return (
    <SettingsShell
      title="Data"
      subtitle="Exports, retention, and org delete/archive (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon.</p>
    </SettingsShell>
  );
}
