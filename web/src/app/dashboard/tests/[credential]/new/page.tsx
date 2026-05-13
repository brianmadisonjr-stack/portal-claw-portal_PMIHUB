import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { NewTestForm } from "@/components/tests/new-test-form";
import { getServerSession } from "@/lib/supabase-server";

export default async function NewTestPage({
  params,
}: {
  params: Promise<{ credential: string }>;
}) {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const { credential } = await params;
  const credentialLabel = credential.toUpperCase();

  // Require complete profile before starting tests
  const { requireCompleteProfile } = await import("@/lib/require-profile");
  await requireCompleteProfile({
    supabaseUserId: session.user.id,
    nextPath: `/dashboard/tests/${credential}/new`,
  });

  return (
    <DashboardShell
      title="Start a new test"
      subtitle={`Credential: ${credentialLabel}`}
      userEmail={session.user.email ?? ""}
    >
      <NewTestForm credential={credential} />
    </DashboardShell>
  );
}
