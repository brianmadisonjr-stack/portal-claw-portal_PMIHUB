import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/profile")}`);
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-blue-500">Profile</p>
          <h1 className="text-2xl font-semibold text-slate-900">Account details</h1>
          <p className="text-sm text-slate-500">Manage the identity Supabase knows about you.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <dl className="space-y-4 text-sm text-slate-700">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">User ID</dt>
              <dd className="font-mono text-xs text-slate-900">{user.id}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
