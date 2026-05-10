import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const userEmail = session.user.email ?? "";
  const cards = [
    {
      title: "Accounts & Cohorts",
      description: "Spin up accounts, set stages, and enroll cohorts against the Prisma CRM schema.",
      href: "/dashboard/cohorts",
      badge: "CRM",
    },
    {
      title: "Readiness Analytics",
      description: "Overlay PracticeQuestion + QuestionAttempt data to see PMP readiness by domain.",
      href: "/dashboard/readiness",
      badge: "Insights",
    },
    {
      title: "Billing & Invoices",
      description: "Link Square invoices to Account records and reconcile payments inside the hub.",
      href: "/dashboard/billing",
      badge: "Finance",
    },
  ];

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

        <section className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{card.badge}</span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Explore →
              </span>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-dashed border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <p className="font-semibold text-slate-800">Session metadata</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <span>User ID</span>
            <span className="truncate font-mono text-slate-900">{session.user.id}</span>
            <span>Role</span>
            <span className="text-slate-900">authenticated</span>
          </div>
        </section>
      </div>
    </main>
  );
}
