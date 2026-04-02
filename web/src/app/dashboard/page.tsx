import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const userEmail = session.user.email ?? "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-500">Dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Signed in as {userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              View profile
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Connect your cohort data to start tracking readiness.</li>
              <li>• Invite teammates once roles/permissions are live.</li>
              <li>• Square billing hooks land after auth is fully deployed.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Session metadata</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="text-slate-500">User ID</span>
              <span className="truncate font-mono text-slate-800">{session.user.id}</span>
              <span className="text-slate-500">Role</span>
              <span className="text-slate-800">authenticated</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
