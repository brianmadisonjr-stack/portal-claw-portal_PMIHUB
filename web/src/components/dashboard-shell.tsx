import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export type CredentialType = {
  key: string;
  label: string;
  trainingHref: string;
  testHref: string;
};

const DEFAULT_CREDENTIAL_TYPES: CredentialType[] = [
  {
    key: "pmp",
    label: "PMP",
    trainingHref: "/dashboard/training/pmp/new",
    testHref: "/dashboard/tests/pmp/new",
  },
  {
    key: "capm",
    label: "CAPM",
    trainingHref: "/dashboard/training/capm/new",
    testHref: "/dashboard/tests/capm/new",
  },
  {
    key: "pmi-acp",
    label: "PMI-ACP",
    trainingHref: "/dashboard/training/pmi-acp/new",
    testHref: "/dashboard/tests/pmi-acp/new",
  },
];

export function DashboardShell({
  title,
  subtitle,
  userEmail,
  credentialTypes = DEFAULT_CREDENTIAL_TYPES,
  children,
}: {
  title: string;
  subtitle?: string;
  userEmail?: string;
  credentialTypes?: CredentialType[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-10">
        <aside className="hidden w-72 shrink-0 flex-col gap-6 md:flex">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">PM Intelligence Hub</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{title}</p>
            {userEmail ? <p className="mt-1 text-sm text-slate-500">{userEmail}</p> : null}
          </div>

          <nav className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Start</p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">New training / study session</p>
                <ul className="mt-2 space-y-2">
                  {credentialTypes.map((cred) => (
                    <li key={`training-${cred.key}`}>
                      <Link
                        href={cred.trainingHref}
                        className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        {cred.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">New test</p>
                <ul className="mt-2 space-y-2">
                  {credentialTypes.map((cred) => (
                    <li key={`test-${cred.key}`}>
                      <Link
                        href={cred.testHref}
                        className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        {cred.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Account</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/profile"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Profile
                </Link>
                <LogoutButton />
              </div>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
            <p className="text-sm uppercase tracking-widest text-blue-500">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
