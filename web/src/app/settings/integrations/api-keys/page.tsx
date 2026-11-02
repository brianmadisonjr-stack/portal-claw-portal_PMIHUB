import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsApiKeysPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/integrations/api-keys")}`);
  }

  return (
    <SettingsShell
      title="API keys"
      subtitle="Create, rotate, and revoke API keys (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon.</p>
    </SettingsShell>
  );
}
