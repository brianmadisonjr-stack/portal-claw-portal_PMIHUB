import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";

export default async function CohortsPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/cohorts")}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-emerald-500">Accounts & Cohorts</p>
          <h1 className="text-3xl font-semibold text-slate-900">Multi-account CRM workspace</h1>
          <p className="mt-2 text-sm text-slate-500">
            This view will let you spin up accounts, enroll cohorts, and track owner notes directly against the Prisma models already in the repo.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700">
            <li>Create/edit Account records, with stage, industry, and owners pulled from Prisma.</li>
            <li>Attach Cohorts + Enrollments so readiness data has context.</li>
            <li>Pipe everything into Supabase Postgres so Square billing and readiness reporting stay in sync.</li>
          </ol>
          <div className="mt-6 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
            Backend schema is live; UI hooks land next. If you need to review the data model today, jump into <code className="font-mono">prisma/schema.prisma</code> or the Supabase dashboard.
          </div>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            ← Back to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
