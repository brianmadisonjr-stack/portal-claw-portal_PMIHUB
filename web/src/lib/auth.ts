import { redirect } from "next/navigation";

import type { Session } from "@supabase/supabase-js";

/**
 * Shared auth helper for server components.
 *
 * Keeps per-page boilerplate tiny while still allowing pages to build even
 * when Supabase env vars are missing (getServerSession() returns null).
 */
export function requireSession(session: Session | null, nextPath: string) {
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
