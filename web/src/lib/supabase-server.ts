import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabaseServer = () =>
  createServerComponentClient({
    cookies,
  });

export async function getServerSession() {
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { supabase, session };
}

export async function requireServerSession() {
  const { supabase, session } = await getServerSession();
  if (!session) {
    throw new Error("Missing Supabase session on protected server route");
  }
  return { supabase, session };
}
