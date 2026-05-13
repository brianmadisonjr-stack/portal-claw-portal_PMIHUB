"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_COUNTS = [10, 25, 50, 100];
const DEFAULT_DOMAINS = [
  { value: "all", label: "All domains" },
  { value: "people", label: "People" },
  { value: "process", label: "Process" },
  { value: "business", label: "Business environment" },
];

export function NewTestForm({
  credential,
}: {
  credential: string;
}) {
  const router = useRouter();
  const credentialLabel = useMemo(() => credential.toUpperCase(), [credential]);

  const [mode, setMode] = useState<"timed" | "tutor">("timed");
  const [count, setCount] = useState<number>(50);
  const [domain, setDomain] = useState<string>("all");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-700">
        Configure a <span className="font-semibold">{credentialLabel}</span> test.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "timed" | "tutor")}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            <option value="timed">Timed (no pause)</option>
            <option value="tutor">Tutor (no pause)</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Tests can’t be paused/restarted.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Question count</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            {DEFAULT_COUNTS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Domain focus</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            {DEFAULT_DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">Replace with credential-specific domains later.</p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const qs = new URLSearchParams({
              mode,
              count: String(count),
              domain,
            });
            router.push(`/dashboard/tests/${credential}/session?${qs.toString()}`);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Start test
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
