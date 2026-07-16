import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ items: [] });
  }

  const prisma = getPrisma();

  const attempts = await prisma.questionAttempt.findMany({
    where: { learnerEmail: email },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      question: {
        select: { stem: true, certification: true, domain: { select: { name: true } } },
      },
    },
  });

  const items = attempts.map((a) => ({
    id: a.id,
    kind: "attempt" as const,
    createdAt: a.createdAt,
    title: `${a.correct ? "✅" : "❌"} ${a.certification} question ${a.correct ? "correct" : "miss"}`,
    detail: a.question.domain?.name ?? null,
    href: "/dashboard/attempts",
  }));

  return NextResponse.json({ items });
}
