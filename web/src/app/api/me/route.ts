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

  const memberships = await prisma.accountMembership.findMany({
    where: { user: { supabaseUserId: session.user.id } },
    include: {
      account: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const roles = Array.from(new Set(memberships.map((m) => m.role)));

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
    profile,
    memberships,
    roles,
  });
}
