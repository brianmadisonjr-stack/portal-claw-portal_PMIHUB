import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ReadinessPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/readiness")}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-indigo-500">Readiness analytics</p>
          <h1 className="text-3xl font-semibold text-slate-900">Performance Lab insights</h1>
          <p className="mt-2 text-sm text-slate-500">
            This view will consume <code className="font-mono">PracticeQuestion</code>, <code className="font-mono">QuestionAttempt</code>, and related Prisma models to plot cohort readiness, PMP domain mastery, and learner velocities.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="space-y-4 text-sm text-slate-700">
            <p>Planned modules:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Domain-by-domain readiness heatmaps.</li>
              <li>Learner leaderboard fed by <code className="font-mono">QuestionAttempt</code> aggregates.</li>
              <li>Automatic “at risk” alerts once Square billing + enrollments align.</li>
            </ul>
            <p>
              Backend types already exist, so this page becomes a simple server component once we add the analytics query layer (either Prisma aggregate helpers or Supabase SQL views).
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center text-sm font-medium text-indigo-700 hover:text-indigo-900"
          >
            ← Back to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
