import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DomainRow = {
  id: string;
  name: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
};

export default async function ReadinessPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/readiness")}`);
  }

  const prisma = getPrisma();

  const email = session.user.email;

  const [attemptsTotal, correctTotal] = email
    ? await Promise.all([
        prisma.questionAttempt.count({ where: { learnerEmail: email } }),
        prisma.questionAttempt.count({ where: { learnerEmail: email, correct: true } }),
      ])
    : [0, 0];

  const overallAccuracy = attemptsTotal ? Math.round((correctTotal / attemptsTotal) * 100) : null;

  const byDomainRaw = email
    ? await prisma.questionAttempt.groupBy({
        by: ["questionId"],
        where: { learnerEmail: email },
        _count: { _all: true },
      })
    : [];

  // Prisma groupBy can't join domain directly; do a single query for attempts with domain and aggregate in JS.
  const attempts = email
    ? await prisma.questionAttempt.findMany({
        where: { learnerEmail: email },
        select: {
          correct: true,
          question: { select: { domain: { select: { id: true, name: true } } } },
        },
      })
    : [];

  const domainMap = new Map<string, { id: string; name: string; attempts: number; correct: number }>();

  for (const a of attempts) {
    const d = a.question.domain;
    if (!d) continue;
    const current = domainMap.get(d.id) ?? { id: d.id, name: d.name, attempts: 0, correct: 0 };
    current.attempts += 1;
    if (a.correct) current.correct += 1;
    domainMap.set(d.id, current);
  }

  const domains: DomainRow[] = Array.from(domainMap.values())
    .map((d) => ({
      ...d,
      accuracy: d.attempts ? Math.round((d.correct / d.attempts) * 100) : null,
    }))
    .sort((a, b) => (b.attempts - a.attempts) || (b.accuracy ?? 0) - (a.accuracy ?? 0));

  return (
    <DashboardShell
      title="Readiness analytics"
      subtitle="Readiness is currently accuracy-only (correct ÷ attempts)."
      userEmail={email ?? undefined}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Overall accuracy</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{overallAccuracy === null ? "—" : `${overallAccuracy}%`}</p>
            <p className="mt-2 text-sm text-slate-500">Based on {attemptsTotal} total attempts.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Correct</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{correctTotal}</p>
            <p className="mt-2 text-sm text-slate-500">Correct answers recorded.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Attempts</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{attemptsTotal}</p>
            <p className="mt-2 text-sm text-slate-500">Total attempts recorded.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Accuracy by domain</h2>
              <p className="mt-1 text-sm text-slate-500">Only domains with attempts are shown.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              ← Back to dashboard
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Domain</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">Accuracy</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">Correct</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {domains.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{d.accuracy === null ? "—" : `${d.accuracy}%`}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{d.correct}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{d.attempts}</td>
                  </tr>
                ))}

                {!domains.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-600">
                      No domain data yet. Answer a few questions to populate readiness analytics.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
