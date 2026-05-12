import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getServerSession } from "@/lib/supabase-server";

export default async function NewTestPage({
  params,
}: {
  params: Promise<{ credential: string }>;
}) {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const { credential } = await params;
  const credentialLabel = credential.toUpperCase();

  return (
    <DashboardShell title="Start a new test" subtitle={`Credential: ${credentialLabel}`} userEmail={session.user.email ?? ""}>
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-sm text-slate-700">
          This is the starter flow for <span className="font-semibold">{credentialLabel}</span> tests.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Next step: pick test mode (timed vs tutor), question count, and domain focus.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
