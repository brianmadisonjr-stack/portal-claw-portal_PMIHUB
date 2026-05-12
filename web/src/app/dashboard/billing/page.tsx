import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const placeholderInvoices = [
  {
    id: "INV-10012",
    account: "Acme Construction",
    amount: "$1,250.00",
    status: "Open",
    issued: "May 2, 2026",
  },
  {
    id: "INV-10008",
    account: "BrightPath Consulting",
    amount: "$499.00",
    status: "Paid",
    issued: "Apr 21, 2026",
  },
  {
    id: "INV-10003",
    account: "Northwind Labs",
    amount: "$799.00",
    status: "Draft",
    issued: "Apr 7, 2026",
  },
];

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "Paid"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "Open"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles}`}>{status}</span>
  );
}

export default async function BillingPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/billing")}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm backdrop-blur md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-amber-500">Billing</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Invoices & payments</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              A working surface for Square invoice IDs, payment status, and internal reconciliation notes. Data will hydrate from Prisma&apos;s <code className="font-mono">Invoice</code> model once the sync job lands.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              ← Dashboard
            </Link>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg bg-amber-500/80 px-4 py-2 text-sm font-semibold text-white shadow-sm opacity-80"
            >
              Sync with Square (soon)
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Current plan</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">Ops Sandbox</p>
            <p className="mt-2 text-sm text-slate-500">Placeholder until we wire subscription / account tier metadata.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Outstanding balance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">$1,250.00</p>
            <p className="mt-2 text-sm text-slate-500">Based on invoices marked <span className="font-medium text-slate-700">Open</span>.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Integration status</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-900">Square</p>
              <StatusPill status="Not connected" />
            </div>
            <p className="mt-2 text-sm text-slate-500">Connect when env vars + webhook endpoints are ready.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent invoices</h2>
              <p className="text-sm text-slate-500">This table is mocked for MVP navigation.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
              >
                Export CSV
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
              >
                Create invoice
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Invoice
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Account
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Issued
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {placeholderInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-800">{invoice.id}</td>
                    <td className="px-4 py-3 text-slate-700">{invoice.account}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.issued}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{invoice.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusPill status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">Reconciliation checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">1</span>
                Confirm <span className="font-mono text-slate-700">squareInvoiceId</span> mapped for each invoice.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">2</span>
                Compare payment state vs Square dashboard.
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">3</span>
                Log exceptions / refunds in internal notes.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">Integration notes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                Webhook targets will live under <code className="font-mono">/api/square/webhooks</code>. For MVP we&apos;re only displaying placeholders so the dashboard nav has a real landing page.
              </p>
              <p>
                When ready, we&apos;ll add server actions for:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Manual sync trigger (admin-only).</li>
                <li>Retry failed invoice imports.</li>
                <li>Write-through updates for paid / void / refunded statuses.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="pb-6 text-center text-xs text-slate-400">Signed in as {session.user.email ?? session.user.id}</footer>
      </div>
    </main>
  );
}
