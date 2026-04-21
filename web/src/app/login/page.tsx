import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-16 lg:flex-row lg:items-center lg:py-24">
        <section className="flex-1 space-y-6 text-zinc-700">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
            Secure client access
          </p>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 lg:text-4xl">Sign in to PM Intelligence Hub</h1>
            <p className="mt-4 text-base text-zinc-500 lg:text-lg">
              Access performance labs, cohort readiness metrics, and billing controls from one authenticated workspace.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
              Zero-maintenance Supabase auth with server-side route protection.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
              Multi-tenant readiness dashboards, Square invoicing, and CRM data in one place.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
              Password resets and email confirmations handled in-app—no manual intervention.
            </li>
          </ul>
        </section>
        <div className="flex-1">
         <Suspense fallback={null}>
	   <AuthForm variant="login" />
	 </Suspense>
        </div>
      </div>
    </main>
  );
}
