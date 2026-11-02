import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsNotificationsPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/notifications")}`);
  }

  return (
    <SettingsShell
      title="Notifications"
      subtitle="Email/product notification preferences (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon.</p>
    </SettingsShell>
  );
}
