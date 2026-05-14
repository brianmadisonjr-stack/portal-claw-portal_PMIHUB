import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
            PM Intelligence Hub
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Portal
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Access your dashboard, manage your profile, and start training sessions or tests.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Go to dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Profile</p>
              <p className="mt-2 text-sm text-slate-200">
                Keep your account details up to date to unlock training & tests.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Training</p>
              <p className="mt-2 text-sm text-slate-200">Start a session you can pause and resume.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Tests</p>
              <p className="mt-2 text-sm text-slate-200">Simulate exam conditions with timed mode.</p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-slate-400">
          © {new Date().getFullYear()} PM Intelligence Hub
        </p>
      </div>
    </main>
  );
}
