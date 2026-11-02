import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function SettingsBillingPage() {
  const { session } = await getServerSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/settings/billing")}`);
  }

  // Quickest v1: keep existing /dashboard/billing and redirect.
  redirect("/dashboard/billing");
}
