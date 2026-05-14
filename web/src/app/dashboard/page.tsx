import { redirect } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ActivityItem = {
  id: string;
  title: string;
  timestampLabel: string;
  href?: string;
};

function EmptyState({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const userEmail = session.user.email ?? "";

  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const profile = await prisma.userProfile.findUnique({
    where: { supabaseUserId: session.user.id },
  });

  // Placeholder data — next iteration will hydrate from DB.
  const recentActivity: ActivityItem[] = [];

  return (
    <DashboardShell
      title="Welcome back"
      subtitle="Here’s what’s happening with your training and tests."
      userEmail={userEmail}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Quick start</p>
          <p className="mt-2 text-sm text-slate-600">Jump back in with a new session.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/training/pmp/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Start training
            </Link>
            <Link
              href="/dashboard/tests/pmp/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Start a test
            </Link>
            <Link
              href="/profile"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Edit profile
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Recent activity</p>
                <p className="mt-1 text-sm text-slate-600">Latest sessions, attempts, and milestones.</p>
              </div>
              <Link
                href="/dashboard/readiness"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View analytics
              </Link>
            </div>

            {recentActivity.length ? (
              <ul className="mt-5 space-y-3">
                {recentActivity.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-slate-300"
                      >
                        <span className="font-medium text-slate-900">{item.title}</span>
                        <span className="shrink-0 text-xs text-slate-500">{item.timestampLabel}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                        <span className="font-medium text-slate-900">{item.title}</span>
                        <span className="shrink-0 text-xs text-slate-500">{item.timestampLabel}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-800">No recent activity yet.</p>
                <p className="mt-1 text-sm text-slate-600">
                  Start a training session or test from the left menu — activity will appear here once attempts are recorded.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <EmptyState
            title="Last completed test"
            subtitle="We’ll show your most recent test session and score breakdown here."
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/tests/pmp/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Start a test
              </Link>
              <Link
                href="/dashboard/training/pmp/new"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Start training
              </Link>
            </div>
          </EmptyState>

          <EmptyState
            title="Profile"
            subtitle={
              profile
                ? "Your profile is connected."
                : "Complete your profile to unlock training/tests."
            }
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Edit profile
              </Link>
            </div>
          </EmptyState>

          <EmptyState
            title="Progress"
            subtitle="This will track readiness by domain and your overall momentum."
          >
            <div className="grid gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Overall readiness</p>
                <p className="mt-2 text-sm text-slate-700">Connect QuestionAttempt data to compute this score.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Next best action</p>
                <p className="mt-2 text-sm text-slate-700">Run a short practice set to populate the dashboard.</p>
              </div>
            </div>
          </EmptyState>
        </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
