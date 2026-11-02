import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsSecurityPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/security")}`);
  }

  return (
    <SettingsShell
      title="Security"
      subtitle="Sessions, MFA policy, password/reset flows (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon.</p>
    </SettingsShell>
  );
}
