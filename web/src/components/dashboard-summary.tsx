import Link from "next/link";
import { InfoBubble } from "@/components/info-bubble";

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
  infoNode,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
  infoNode?: React.ReactNode;
}) {
  const inner = (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:border-slate-300">
      <div className="flex items-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        {infoNode}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function DashboardSummaryCards({ summary }: { summary: DashboardSummary }) {
  const accuracyLabel = summary.attempts.accuracy === null ? "—" : `${summary.attempts.accuracy}%`;

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
        infoNode={
          <InfoBubble label="Accuracy">
            Accuracy is currently calculated as <strong>correct answers ÷ total attempts</strong> (percentage). We are
            not weighting by recency or volume yet.
          </InfoBubble>
        }
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
