"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      aria-label="Logout"
      onClick={handleLogout}
      disabled={loading}
      className={`rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {loading ? "Signing out…" : "Logout"}
    </button>
  );
}
