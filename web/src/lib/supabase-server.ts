import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function supabase() {
return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
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
}
);
}

export const supabaseServer = () => supabase();

export async function getServerSession() {
const client = supabase();
const { data, error } = await client.auth.getSession();
if (error) throw error;
return { session: data.session };
}
