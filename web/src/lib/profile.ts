export const educationLevels = [
  "HIGH_SCHOOL",
  "ASSOCIATES",
  "BACHELORS",
  "MASTERS",
  "DOCTORATE",
  "OTHER",
] as const;

export type EducationLevel = (typeof educationLevels)[number];

export type UserProfileUpdate = {
  firstName?: string | null;
  lastName?: string | null;
  suffix?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  educationLevel?: EducationLevel | null;
  linkedInUrl?: string | null;
};

export function normalizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

export function computeProfileCompleteness(profile: {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  street1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  educationLevel?: string | null;
  linkedInUrl?: string | null;
}) {
  const required: Array<[label: string, present: boolean]> = [
    ["email", !!profile.email],
    ["first name", !!profile.firstName?.trim()],
    ["last name", !!profile.lastName?.trim()],
    ["street address", !!profile.street1?.trim()],
    ["city", !!profile.city?.trim()],
    ["state", !!profile.state?.trim()],
    ["postal code", !!profile.postalCode?.trim()],
    ["country", !!profile.country?.trim()],
    ["education level", !!profile.educationLevel],
    ["LinkedIn URL", !!profile.linkedInUrl?.trim()],
  ];

  const missing = required.filter(([, ok]) => !ok).map(([label]) => label);
  const percent = Math.round(((required.length - missing.length) / required.length) * 100);
  return { missing, percent, total: required.length, completeCount: required.length - missing.length };
}
