import { cache } from "react";

export type MeResponse = {
  user: { id: string; email: string | null };
  profile: unknown;
  memberships: Array<{ role: string; account: { id: string; name: string } }>;
  roles: string[];
};

export const getMe = cache(async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/me`, {
    // ensure we include cookies in server fetch
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as MeResponse;
});
