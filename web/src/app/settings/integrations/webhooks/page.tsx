import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsWebhooksPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/integrations/webhooks")}`);
  }

  return (
    <SettingsShell
      title="Webhooks"
      subtitle="Endpoint URLs, signing secrets, and delivery history (stub)."
    >
      <p className="text-sm text-slate-600">Coming soon.</p>
    </SettingsShell>
  );
}
