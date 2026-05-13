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

type TrainingSessionState = {
  mode: "timed" | "tutor";
  count: number;
  domain: string;
  startedAtIso: string;
};

const storageKey = (credential: string) => `pmihub:training:${credential}:draft`;

export function NewTrainingForm({ credential }: { credential: string }) {
  const router = useRouter();
  const credentialLabel = useMemo(() => credential.toUpperCase(), [credential]);

  const [mode, setMode] = useState<"timed" | "tutor">("tutor");
  const [count, setCount] = useState<number>(25);
  const [domain, setDomain] = useState<string>("all");
  const resumeAvailable = useMemo(() => {
    // localStorage is only available client-side; this file is a client component.
    try {
      return Boolean(localStorage.getItem(storageKey(credential)));
    } catch {
      return false;
    }
  }, [credential]);

  function startNew() {
    const state: TrainingSessionState = {
      mode,
      count,
      domain,
      startedAtIso: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey(credential), JSON.stringify(state));
    } catch {
      // ignore storage failures; user can still proceed
    }

    const qs = new URLSearchParams({
      mode,
      count: String(count),
      domain,
    });

    router.push(`/dashboard/training/${credential}/session?${qs.toString()}`);
  }

  function resume() {
    router.push(`/dashboard/training/${credential}/session`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-700">
        Configure a <span className="font-semibold">{credentialLabel}</span> training session.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "timed" | "tutor")}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            <option value="tutor">Tutor (recommended)</option>
            <option value="timed">Timed</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Training can be paused and resumed.</p>
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

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={startNew}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Start training
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Cancel
        </button>

        {resumeAvailable ? (
          <button
            type="button"
            onClick={resume}
            className="ml-auto rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Resume last training
          </button>
        ) : null}
      </div>
    </div>
  );
}
