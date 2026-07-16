import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AttemptRow = {
  id: string;
  createdAt: Date;
  certification: string;
  correct: boolean;
  elapsedMs: number | null;
  question: {
    stem: string;
    domain: { name: string } | null;
  };
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AttemptsPage() {
  const { session } = await getServerSession();
  if (!session) redirect(`/login?next=${encodeURIComponent("/dashboard/attempts")}`);

  const prisma = getPrisma();

  const email = session.user.email;
  const attempts: AttemptRow[] = email
    ? await prisma.questionAttempt.findMany({
        where: { learnerEmail: email },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          question: {
            select: {
              stem: true,
              domain: { select: { name: true } },
            },
          },
        },
      })
    : [];

  return (
    <DashboardShell title="Attempts" subtitle="Your most recent question attempts." userEmail={email ?? undefined}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">Showing last {attempts.length} attempts.</p>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            ← Back to dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">When</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Certification</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Result</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">Question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{formatWhen(a.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.certification}</td>
                  <td className="px-4 py-3 text-slate-600">{a.question.domain?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        a.correct
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-rose-50 text-rose-700 ring-rose-200"
                      }`}
                    >
                      {a.correct ? "Correct" : "Miss"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a.question.stem}</td>
                </tr>
              ))}

              {!attempts.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-600">
                    No attempts yet. Start a training session or test to populate this list.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
