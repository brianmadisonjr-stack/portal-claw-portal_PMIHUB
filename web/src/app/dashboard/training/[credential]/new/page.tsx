import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { NewTrainingForm } from "@/components/training/new-training-form";
import { getServerSession } from "@/lib/supabase-server";

export default async function NewTrainingSessionPage({
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

  // Require complete profile before starting training
  const { requireCompleteProfile } = await import("@/lib/require-profile");
  await requireCompleteProfile({
    supabaseUserId: session.user.id,
    nextPath: `/dashboard/training/${credential}/new`,
  });

  return (
    <DashboardShell
      title="Start a training / study session"
      subtitle={`Credential: ${credentialLabel}`}
      userEmail={session.user.email ?? ""}
    >
      <NewTrainingForm credential={credential} />
    </DashboardShell>
  );
}
