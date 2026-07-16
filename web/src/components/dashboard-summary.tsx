import Link from "next/link";

export type DashboardSummary = {
  profileComplete: boolean;
  membershipCount: number;
  attempts: {
    total: number;
    correct: number;
    accuracy: number | null;
    lastAttemptAt: string | null;
    lastAttemptQuestionStem: string | null;
    lastAttemptCertification: string | null;
    lastAttemptCorrect: boolean | null;
  };
};

function MetricCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:border-slate-300">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function DashboardSummaryCards({ summary }: { summary: DashboardSummary }) {
  const accuracyLabel =
    summary.attempts.accuracy === null ? "—" : `${summary.attempts.accuracy}%`;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Attempts"
        value={summary.attempts.total}
        hint="Your recorded question attempts."
        href="/dashboard/attempts"
      />
      <MetricCard
        label="Accuracy"
        value={accuracyLabel}
        hint={summary.attempts.total ? `${summary.attempts.correct} correct` : "No attempts yet"}
        href="/dashboard/attempts"
      />
      <MetricCard
        label="Profile"
        value={summary.profileComplete ? "Complete" : "Incomplete"}
        hint={summary.profileComplete ? "Ready for training/tests." : "Finish profile to unlock everything."}
        href="/profile"
      />
    </section>
  );
}
