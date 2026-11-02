import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsRolesPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/roles")}`);
  }

  return (
    <SettingsShell
      title="Roles"
      subtitle="Role definitions and enforcement rules."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Coming soon: role model documentation + (optional) editable roles.
        </p>
      </div>
    </SettingsShell>
  );
}
