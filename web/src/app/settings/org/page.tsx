import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsOrgPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/org")}`);
  }

  return (
    <SettingsShell
      title="Organization"
      subtitle="Workspace profile & defaults."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Coming soon: org/workspace name, default timezone, and plan metadata.
        </p>
      </div>
    </SettingsShell>
  );
}
