export type AccountRole = "OWNER" | "ADMIN" | "INSTRUCTOR" | "LEARNER" | "BILLING";

export function hasRole(roles: string[] | null | undefined, required: AccountRole | AccountRole[]) {
  if (!roles?.length) return false;
  const list = Array.isArray(required) ? required : [required];
  return list.some((r) => roles.includes(r));
}
