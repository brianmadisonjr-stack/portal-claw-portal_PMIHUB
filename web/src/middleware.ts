import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/billing", "/app"];
const AUTH_PAGES = ["/login", "/signup"] as const;
const DEFAULT_APP_ROUTE = "/dashboard";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => {
          res.cookies.set({ name: key, value, ...options });
        },
        remove: (key, options) => {
          res.cookies.set({ name: key, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  const isAuthPage = AUTH_PAGES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = DEFAULT_APP_ROUTE;
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/billing/:path*",
    "/app/:path*",
    "/login",
    "/signup",
  ],
};
