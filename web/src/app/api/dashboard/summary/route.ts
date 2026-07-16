import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();

  const profile = await prisma.userProfile.findUnique({
    where: { supabaseUserId: session.user.id },
  });

  const membershipCount = await prisma.accountMembership.count({
    where: { user: { supabaseUserId: session.user.id } },
  });

  const attemptCount = await prisma.questionAttempt.count({
    where: {
      learnerEmail: session.user.email ?? undefined,
    },
  });

  const correctCount = await prisma.questionAttempt.count({
    where: {
      learnerEmail: session.user.email ?? undefined,
      correct: true,
    },
  });

  const lastAttempt = session.user.email
    ? await prisma.questionAttempt.findFirst({
        where: { learnerEmail: session.user.email },
        orderBy: { createdAt: "desc" },
        include: { question: true },
      })
    : null;

  const accuracy = attemptCount ? Math.round((correctCount / attemptCount) * 100) : null;

  return NextResponse.json({
    profileComplete: Boolean(
      profile?.firstName &&
        profile?.lastName &&
        profile?.street1 &&
        profile?.city &&
        profile?.state &&
        profile?.postalCode &&
        profile?.country &&
        profile?.educationLevel &&
        profile?.linkedInUrl,
    ),
    membershipCount,
    attempts: {
      total: attemptCount,
      correct: correctCount,
      accuracy,
      lastAttemptAt: lastAttempt?.createdAt ?? null,
      lastAttemptQuestionStem: lastAttempt?.question?.stem ?? null,
      lastAttemptCertification: lastAttempt?.certification ?? null,
      lastAttemptCorrect: lastAttempt?.correct ?? null,
    },
  });
}
