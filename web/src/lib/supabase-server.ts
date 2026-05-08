import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // During build/prerender (or misconfigured env), fail soft so Next can still build.
    // Runtime pages that require auth should redirect when session is null.
    return null;
  }

  return createServerClient(url, anon, {
    cookies: {
      async getAll() {
        const store = await cookies();
        return store.getAll();
      },
      async setAll(cookiesToSet) {
        const store = await cookies();
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set(name, value, options);
        });
      },
    },
  });
}

export const supabaseServer = () => supabase();

export async function getServerSession() {
  const client = supabase();
  if (!client) return { session: null };

  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return { session: data.session };
}
