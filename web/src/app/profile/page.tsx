"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Profile</h1>
      <p style={{ marginTop: 8 }}>Email: {email ?? "…"}</p>
    </main>
  );
}
