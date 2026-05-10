import { getServerSession } from "@/lib/supabase-server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { session } = await getServerSession();
  requireSession(session, "/profile");

  const supabaseUserId = session!.user.id;
  const email = session!.user.email ?? null;

  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId },
    update: {
      email,
    },
    create: {
      supabaseUserId,
      email,
      displayName: session!.user.user_metadata?.full_name ?? null,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <ProfileForm initialProfile={profile} />
      </div>
    </main>
  );
}
