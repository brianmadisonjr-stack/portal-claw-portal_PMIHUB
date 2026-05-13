import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";
import { computeProfileCompleteness } from "@/lib/profile";

/**
 * Server-side guard to enforce a completed profile before allowing access
 * to protected app flows (training/tests/etc).
 */
export async function requireCompleteProfile({
  supabaseUserId,
  nextPath,
}: {
  supabaseUserId: string;
  nextPath: string;
}) {
  const prisma = getPrisma();

  const profile = await prisma.userProfile.findUnique({
    where: { supabaseUserId },
  });

  const completeness = computeProfileCompleteness(profile ?? {});

  if (completeness.percent < 100) {
    redirect(`/profile?next=${encodeURIComponent(nextPath)}`);
  }

  return { profile, completeness };
}
