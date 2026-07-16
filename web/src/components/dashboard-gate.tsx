import { redirect } from "next/navigation";

import type { AccountRole } from "@/lib/roles";
import { hasRole } from "@/lib/roles";
import type { MeResponse } from "@/lib/me";

export function requireRoleOrRedirect(me: MeResponse | null, required: AccountRole | AccountRole[], nextPath: string) {
  const ok = hasRole(me?.roles ?? [], required);
  if (!ok) {
    redirect(`/dashboard?denied=${encodeURIComponent(nextPath)}`);
  }
}
