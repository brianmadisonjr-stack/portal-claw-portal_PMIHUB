import Link from "next/link";

type SettingsLink = {
  href: string;
  label: string;
};

const links: SettingsLink[] = [
  { href: "/settings/org", label: "Organization" },
  { href: "/settings/members", label: "Members" },
  { href: "/settings/roles", label: "Roles" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/integrations", label: "Integrations" },
  { href: "/settings/audit-log", label: "Audit log" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/data", label: "Data" },
];

export function SettingsShell({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
            <nav className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
