import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-16 lg:flex-row lg:items-center lg:py-24">
        <section className="flex-1 space-y-6 text-zinc-700">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
            PM Intelligence Hub
          </p>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 lg:text-5xl">Practice smarter. Track readiness.</h1>
            <p className="mt-4 text-base text-zinc-500 lg:text-lg">
              A streamlined workspace for PMP practice sessions, cohort analytics, and performance insights—powered by Supabase.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white/70 px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-white"
            >
              Create account
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Go to dashboard →
            </Link>
          </div>
        </section>

        <aside className="flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">What you get</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                Fast, SSR-safe authentication and route protection.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                Clean dashboards with cohort and readiness insights.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                Modern UI defaults (spacing, typography, responsive layout).
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
