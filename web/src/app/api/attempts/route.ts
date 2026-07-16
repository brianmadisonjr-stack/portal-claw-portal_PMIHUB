import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseIntParam(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: Request) {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseIntParam(url.searchParams.get("limit"), 25)));
  const page = Math.max(1, parseIntParam(url.searchParams.get("page"), 1));

  const prisma = getPrisma();

  const learnerEmail = session.user.email;
  if (!learnerEmail) {
    return NextResponse.json({ items: [], page, limit, total: 0 });
  }

  const where = { learnerEmail };

  const [total, items] = await Promise.all([
    prisma.questionAttempt.count({ where }),
    prisma.questionAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        question: {
          select: {
            id: true,
            stem: true,
            certification: true,
            domain: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ items, page, limit, total });
}
