"use client";

import { useMemo, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type Profile = {
  id: string;
  supabaseUserId: string;
  email: string | null;
  displayName: string | null;
};

export function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const completeness = useMemo(() => {
    const missing: string[] = [];
    if (!initialProfile.email) missing.push("email");
    if (!(displayName ?? "").trim()) missing.push("display name");
    const percent = Math.round(((2 - missing.length) / 2) * 100);
    return { missing, percent };
  }, [displayName, initialProfile.email]);

  async function handleSave() {
    setSaving(true);
    setSaved("idle");
    setError(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved("saved");
    window.setTimeout(() => setSaved("idle"), 2000);
  }

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
            {completeness.missing.length ? (
              <p className="mt-1 text-sm text-slate-500">
                Missing: <span className="font-medium text-slate-700">{completeness.missing.join(", ")}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">All set.</p>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900">{completeness.percent}%</p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-blue-500" style={{ width: `${completeness.percent}%` }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              readOnly
              value={initialProfile.email ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved === "saved" ? <p className="text-sm text-slate-500">Saved.</p> : null}
        </div>
      </section>
    </div>
  );
}
