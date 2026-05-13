"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";

type TrainingSessionState = {
  mode: "timed" | "tutor";
  count: number;
  domain: string;
  startedAtIso: string;
  pausedAtIso?: string;
};

const storageKey = (credential: string) => `pmihub:training:${credential}:draft`;

export default function TrainingSessionPage() {
  const params = useParams<{ credential: string }>();
  const searchParams = useSearchParams();

  const credential = params.credential;
  const credentialLabel = useMemo(() => credential.toUpperCase(), [credential]);

  const initialState = useMemo((): TrainingSessionState | null => {
    // Prefer query string (new session) and fall back to localStorage (resume).
    const mode = (searchParams.get("mode") as "timed" | "tutor" | null) ?? undefined;
    const count = searchParams.get("count");
    const domain = searchParams.get("domain");

    if (mode && count && domain) {
      return {
        mode,
        count: Number(count),
        domain,
        startedAtIso: new Date().toISOString(),
      };
    }

    try {
      const existing = localStorage.getItem(storageKey(credential));
      return existing ? (JSON.parse(existing) as TrainingSessionState) : null;
    } catch {
      return null;
    }
  }, [credential, searchParams]);

  const [state, setState] = useState<TrainingSessionState | null>(initialState);

  useEffect(() => {
    // Persist newly started sessions from query string.
    const mode = (searchParams.get("mode") as "timed" | "tutor" | null) ?? undefined;
    const count = searchParams.get("count");
    const domain = searchParams.get("domain");

    if (mode && count && domain && state) {
      try {
        localStorage.setItem(storageKey(credential), JSON.stringify(state));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credential]);

  function pause() {
    if (!state) return;
    const next: TrainingSessionState = {
      ...state,
      pausedAtIso: new Date().toISOString(),
    };
    setState(next);
    try {
      localStorage.setItem(storageKey(credential), JSON.stringify(next));
    } catch {}
  }

  function restart() {
    if (!state) return;
    const next: TrainingSessionState = {
      ...state,
      startedAtIso: new Date().toISOString(),
      pausedAtIso: undefined,
    };
    setState(next);
    try {
      localStorage.setItem(storageKey(credential), JSON.stringify(next));
    } catch {}
  }

  function clear() {
    try {
      localStorage.removeItem(storageKey(credential));
    } catch {}
    setState(null);
  }

  return (
    <DashboardShell title="Training session" subtitle={`Credential: ${credentialLabel}`}> 
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        {state ? (
          <>
            <p className="text-sm text-slate-700">
              Training session in progress for <span className="font-semibold">{credentialLabel}</span>.
            </p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mode</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-800">{state.mode}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Question count</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-800">{state.count}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Domain</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-800">{state.domain}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-800">
                  {state.pausedAtIso ? "Paused" : "Active"}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-sm text-slate-600">
              Next step: render questions + spaced repetition / coaching. For now this page demonstrates pause/resume/restart wiring.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={pause}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={restart}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Clear saved
              </button>

              <Link
                href={`/dashboard/training/${credential}/new`}
                className="ml-auto rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Back to config
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-700">No saved training session found.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/training/${credential}/new`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Start training
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
