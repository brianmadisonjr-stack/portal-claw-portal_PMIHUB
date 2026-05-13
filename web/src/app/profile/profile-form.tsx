"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import {
  computeProfileCompleteness,
  educationLevels,
  type EducationLevel,
  isValidLinkedInUrl,
} from "@/lib/profile";

type Profile = {
  id: string;
  supabaseUserId: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  suffix: string | null;
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  educationLevel: EducationLevel | null;
  linkedInUrl: string | null;
};

type Completeness = {
  missing: string[];
  percent: number;
  total: number;
  completeCount: number;
};

function labelForEducation(level: EducationLevel) {
  switch (level) {
    case "HIGH_SCHOOL":
      return "High school";
    case "ASSOCIATES":
      return "Associate's";
    case "BACHELORS":
      return "Bachelor's";
    case "MASTERS":
      return "Master's";
    case "DOCTORATE":
      return "Doctorate";
    case "OTHER":
      return "Other";
  }
}

function isNonEmpty(value: string) {
  return value.trim().length > 0;
}

export function ProfileForm({
  initialProfile,
  initialCompleteness,
  nextPath,
}: {
  initialProfile: Profile;
  initialCompleteness: Completeness;
  nextPath: string;
}) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(initialProfile.displayName ?? "");
  const [firstName, setFirstName] = useState(initialProfile.firstName ?? "");
  const [lastName, setLastName] = useState(initialProfile.lastName ?? "");
  const [suffix, setSuffix] = useState(initialProfile.suffix ?? "");
  const [street1, setStreet1] = useState(initialProfile.street1 ?? "");
  const [street2, setStreet2] = useState(initialProfile.street2 ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [state, setState] = useState(initialProfile.state ?? "");
  const [postalCode, setPostalCode] = useState(initialProfile.postalCode ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "US");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | "">(
    initialProfile.educationLevel ?? "",
  );
  const [linkedInUrl, setLinkedInUrl] = useState(initialProfile.linkedInUrl ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const completeness = useMemo(() => {
    // compute based on current form state (email from profile)
    return computeProfileCompleteness({
      email: initialProfile.email,
      firstName,
      lastName,
      street1,
      city,
      state,
      postalCode,
      country,
      educationLevel: educationLevel ? String(educationLevel) : null,
      linkedInUrl,
    });
  }, [
    city,
    country,
    educationLevel,
    firstName,
    initialProfile.email,
    lastName,
    linkedInUrl,
    postalCode,
    state,
    street1,
  ]);

  function validate() {
    const next: Record<string, string> = {};

    if (!isNonEmpty(firstName)) next.firstName = "First name is required";
    if (!isNonEmpty(lastName)) next.lastName = "Last name is required";

    if (!isNonEmpty(street1)) next.street1 = "Street address is required";
    if (!isNonEmpty(city)) next.city = "City is required";
    if (!isNonEmpty(state)) next.state = "State is required";
    if (!isNonEmpty(postalCode)) next.postalCode = "Postal code is required";
    if (!isNonEmpty(country)) next.country = "Country is required";

    if (!educationLevel) next.educationLevel = "Education level is required";

    if (!isNonEmpty(linkedInUrl)) {
      next.linkedInUrl = "LinkedIn URL is required";
    } else if (!isValidLinkedInUrl(linkedInUrl.trim())) {
      next.linkedInUrl = "Please enter a valid LinkedIn URL";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(redirectAfterSave?: boolean) {
    setSaving(true);
    setSaved("idle");
    setError(null);

    if (!validate()) {
      setSaving(false);
      return;
    }

    const payload = {
      displayName,
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
    };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved("saved");

    if (redirectAfterSave && completeness.percent === 100) {
      router.push(nextPath);
      return;
    }

    window.setTimeout(() => setSaved("idle"), 2000);
  }

  const missingText = completeness.missing.length
    ? `Missing: ${completeness.missing.join(", ")}`
    : "All set.";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-blue-500">Profile</p>
          <h1 className="text-2xl font-semibold text-slate-900">Account details</h1>
          <p className="text-sm text-slate-500">Keep your info up to date.</p>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Profile completeness</p>
            <p className="mt-1 text-sm text-slate-500">{missingText}</p>
          </div>
          <p className="text-sm font-semibold text-slate-900">{completeness.percent}%</p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-blue-500" style={{ width: `${completeness.percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {initialCompleteness.percent}% when loaded · {completeness.completeCount}/{completeness.total} complete
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold text-slate-900">Basic info</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              readOnly
              value={initialProfile.email ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Display name (optional)</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">First name</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.firstName ? <p className="text-xs text-red-600">{fieldErrors.firstName}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Last name</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.lastName ? <p className="text-xs text-red-600">{fieldErrors.lastName}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Suffix (optional)</span>
            <input
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Jr, Sr, III"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">LinkedIn URL</span>
            <input
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.linkedInUrl ? <p className="text-xs text-red-600">{fieldErrors.linkedInUrl}</p> : null}
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Education level</span>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel | "")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select…</option>
              {educationLevels.map((level) => (
                <option key={level} value={level}>
                  {labelForEducation(level)}
                </option>
              ))}
            </select>
            {fieldErrors.educationLevel ? (
              <p className="text-xs text-red-600">{fieldErrors.educationLevel}</p>
            ) : null}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold text-slate-900">Home address</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Street address</span>
            <input
              value={street1}
              onChange={(e) => setStreet1(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.street1 ? <p className="text-xs text-red-600">{fieldErrors.street1}</p> : null}
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Street address line 2 (optional)</span>
            <input
              value={street2}
              onChange={(e) => setStreet2(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">City</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.city ? <p className="text-xs text-red-600">{fieldErrors.city}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">State</span>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.state ? <p className="text-xs text-red-600">{fieldErrors.state}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Postal code</span>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.postalCode ? <p className="text-xs text-red-600">{fieldErrors.postalCode}</p> : null}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Country</span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="US"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldErrors.country ? <p className="text-xs text-red-600">{fieldErrors.country}</p> : null}
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {completeness.percent === 100 ? (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save & continue"}
            </button>
          ) : null}

          {saved === "saved" ? <p className="text-sm text-slate-500">Saved.</p> : null}
        </div>
      </section>
    </div>
  );
}
