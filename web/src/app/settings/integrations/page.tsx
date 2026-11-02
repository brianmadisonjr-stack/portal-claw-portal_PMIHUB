import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";
import { SettingsShell } from "@/components/settings-shell";

export const dynamic = "force-dynamic";

export default async function SettingsIntegrationsPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/integrations")}`);
  }

  return (
    <SettingsShell
      title="Integrations"
      subtitle="API keys, webhooks, and third-party connections."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/settings/integrations/api-keys"
          className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300"
        >
          API keys →
          <p className="mt-1 text-sm font-normal text-slate-500">Create and revoke API keys (v1 stub).</p>
        </Link>

        <Link
          href="/settings/integrations/webhooks"
          className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300"
        >
          Webhooks →
          <p className="mt-1 text-sm font-normal text-slate-500">Webhook endpoints and signing secrets (v1 stub).</p>
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Square integration is planned; billing currently shows placeholders.
        </p>
      </div>
    </SettingsShell>
  );
}
