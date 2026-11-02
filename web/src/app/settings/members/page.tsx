import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsMembersPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/members")}`);
  }

  return (
    <SettingsShell
      title="Members"
      subtitle="Invite, remove, and manage access."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Coming soon: invitations, role assignment, deactivate/remove.
        </p>
      </div>
    </SettingsShell>
  );
}
