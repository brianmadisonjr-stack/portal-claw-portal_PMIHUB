import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/supabase-server";

export async function GET() {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;
  const email = session.user.email ?? null;

  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId },
    update: {
      email,
    },
    create: {
      supabaseUserId,
      email,
      displayName: session.user.user_metadata?.full_name ?? null,
    },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;

  const body = (await request.json().catch(() => null)) as null | {
    displayName?: unknown;
  };

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const displayName = body.displayName;
  if (displayName !== undefined && typeof displayName !== "string") {
    return NextResponse.json({ error: "displayName must be a string" }, { status: 400 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId },
    update: {
      displayName: displayName?.trim() ? displayName.trim() : null,
    },
    create: {
      supabaseUserId,
      email: session.user.email ?? null,
      displayName: displayName?.trim() ? displayName.trim() : null,
    },
  });

  return NextResponse.json({ profile });
}
