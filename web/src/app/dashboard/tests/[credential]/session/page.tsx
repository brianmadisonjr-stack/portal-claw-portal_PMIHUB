import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getServerSession } from "@/lib/supabase-server";

export default async function TestSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ credential: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const { credential } = await params;
  const qs = await searchParams;
  const credentialLabel = credential.toUpperCase();

  const mode = typeof qs.mode === "string" ? qs.mode : "timed";
  const count = typeof qs.count === "string" ? qs.count : "50";
  const domain = typeof qs.domain === "string" ? qs.domain : "all";

  return (
    <DashboardShell
      title="Test session"
      subtitle={`Credential: ${credentialLabel}`}
      userEmail={session.user.email ?? ""}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-sm text-slate-700">
          Test started for <span className="font-semibold">{credentialLabel}</span>.
        </p>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mode</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-800">{mode}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Question count</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-800">{count}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Domain</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-800">{domain}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-slate-600">
          Next step: render questions + scoring. For now this page confirms the starter flow wiring.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/tests/${credential}/new`}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to config
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
