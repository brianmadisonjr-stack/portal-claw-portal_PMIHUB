import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/billing")}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-amber-500">Billing & invoices</p>
          <h1 className="text-3xl font-semibold text-slate-900">Square integration lane</h1>
          <p className="mt-2 text-sm text-slate-500">
            This area will surface invoices from the Prisma <code className="font-mono">Invoice</code> model, link them to Square IDs, and let ops mark payment states without leaving the hub.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="space-y-4 text-sm text-slate-700">
            <p>On deck:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Square invoice sync + webhook ingestion.</li>
              <li>Account-level billing history and outstanding balance summaries.</li>
              <li>Automated reminders once Supabase background jobs spin up.</li>
            </ul>
            <p>
              The schema already has <code className="font-mono">squareInvoiceId</code>, so wiring this UI mainly means dropping in the Square SDK + a couple of server actions.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-900"
          >
            ← Back to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
