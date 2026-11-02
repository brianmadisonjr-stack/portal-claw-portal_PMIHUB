"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthModal from "@/components/auth-modal";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function HeaderSessionControls() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="h-9 w-28 rounded-lg bg-slate-200/60" />;
  }

  return (
    <>
      {authed ? (
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Log in
          </button>
          <AuthModal open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </>
  );
}
