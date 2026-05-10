import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-16 lg:flex-row lg:items-center lg:py-24">
        <section className="flex-1 space-y-6 text-zinc-700">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            New to PM Intelligence Hub?
          </p>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 lg:text-4xl">Spin up your portal credentials</h1>
            <p className="mt-4 text-base text-zinc-500 lg:text-lg">
              Create an account to invite cohorts, monitor readiness, and sync billing—Supabase auth keeps everything secure by default.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
            <p className="text-sm font-semibold text-emerald-800">What you unlock:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600">
              <li>Role-aware access to CRM + learning data models.</li>
              <li>Square-ready invoicing tied to each account.</li>
              <li>Upcoming PMP workbook imports and practice analytics.</li>
            </ul>
          </div>
        </section>
        <div className="flex-1">
          <Suspense fallback={null}><AuthForm variant="signup" /></Suspense>
        </div>
      </div>
    </main>
  );
}
