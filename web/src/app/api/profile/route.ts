import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/supabase-server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import type { EducationLevel } from "@prisma/client";
import {
  computeProfileCompleteness,
  educationLevels,
  isValidLinkedInUrl,
  normalizeNullableString,
} from "@/lib/profile";

export async function GET() {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;
  const email = session.user.email ?? null;

  const prisma = getPrisma();

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

  return NextResponse.json({ profile, completeness: computeProfileCompleteness(profile) });
}

export async function PATCH(request: Request) {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;

  const prisma = getPrisma();

  const body = (await request.json().catch(() => null)) as null | {
    displayName?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    suffix?: unknown;
    street1?: unknown;
    street2?: unknown;
    city?: unknown;
    state?: unknown;
    postalCode?: unknown;
    country?: unknown;
    educationLevel?: unknown;
    linkedInUrl?: unknown;
  };

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const displayName = body.displayName;
  if (displayName !== undefined && typeof displayName !== "string") {
    return NextResponse.json({ error: "displayName must be a string" }, { status: 400 });
  }

  const firstName = normalizeNullableString(body.firstName);
  const lastName = normalizeNullableString(body.lastName);
  const suffix = normalizeNullableString(body.suffix);
  const street1 = normalizeNullableString(body.street1);
  const street2 = normalizeNullableString(body.street2);
  const city = normalizeNullableString(body.city);
  const state = normalizeNullableString(body.state);
  const postalCode = normalizeNullableString(body.postalCode);
  const country = normalizeNullableString(body.country);

  const educationLevelRaw = body.educationLevel;
  const educationLevel =
    educationLevelRaw === null || educationLevelRaw === undefined
      ? null
      : typeof educationLevelRaw === "string" && (educationLevels as readonly string[]).includes(educationLevelRaw)
        ? (educationLevelRaw as EducationLevel)
        : "__invalid__";

  if (educationLevel === "__invalid__") {
    return NextResponse.json(
      { error: `educationLevel must be one of: ${educationLevels.join(", ")}` },
      { status: 400 },
    );
  }

  const linkedInUrl = normalizeNullableString(body.linkedInUrl);
  if (linkedInUrl && !isValidLinkedInUrl(linkedInUrl)) {
    return NextResponse.json({ error: "linkedInUrl must be a valid LinkedIn URL" }, { status: 400 });
  }

  // Server-side required fields check for completeness requirements.
  // (Email is derived from the session and stored on read.)
  const requiredMissing: string[] = [];
  if (!firstName) requiredMissing.push("firstName");
  if (!lastName) requiredMissing.push("lastName");
  if (!street1) requiredMissing.push("street1");
  if (!city) requiredMissing.push("city");
  if (!state) requiredMissing.push("state");
  if (!postalCode) requiredMissing.push("postalCode");
  if (!country) requiredMissing.push("country");
  if (!educationLevel) requiredMissing.push("educationLevel");
  if (!linkedInUrl) requiredMissing.push("linkedInUrl");

  if (requiredMissing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${requiredMissing.join(", ")}` },
      { status: 400 },
    );
  }

  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId },
    update: {
      displayName: displayName?.trim() ? displayName.trim() : null,
      firstName,
      lastName,
      suffix,
      street1,
      street2,
      city,
      state,
      postalCode,
      country,
      educationLevel,
      linkedInUrl,
    },
    create: {
      supabaseUserId,
      email: session.user.email ?? null,
      displayName: displayName?.trim() ? displayName.trim() : null,
      firstName,
      lastName,
      suffix,
      street1,
      street2,
      city,
      state,
      postalCode,
      country,
      educationLevel,
      linkedInUrl,
    },
  });

  return NextResponse.json({ profile, completeness: computeProfileCompleteness(profile) });
}
