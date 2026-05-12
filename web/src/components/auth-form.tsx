"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

type Mode = "login" | "signup";

type Banner = {
  tone: "error" | "success";
  message: string;
};

const EMAIL_REGEX = /.+@.+\..+/;

const copy: Record<Mode, { title: string; cta: string; alt: string; altHref: string }> = {
  login: {
    title: "Welcome back",
    cta: "Sign in",
    alt: "Need an account?",
    altHref: "/signup",
  },
  signup: {
    title: "Create your account",
    cta: "Create account",
    alt: "Already have access?",
    altHref: "/login",
  },
};

function AuthFormInner({ variant }: { variant: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params?.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResendingVerify, setIsResendingVerify] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  const disabled = useMemo(() => {
    if (!EMAIL_REGEX.test(email.trim())) return true;
    if (variant === "login" || variant === "signup") {
      return password.trim().length < 8;
    }
    return false;
  }, [email, password, variant]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;

    setBanner(null);
    setIsSubmitting(true);
    const supabase = supabaseBrowser();

    try {
      if (variant === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          const message = error.message.toLowerCase();
          if (message.includes("confirm")) {
            setNeedsVerification(true);
            setBanner({
              tone: "error",
              message: "We still need you to confirm that email. Check your inbox or resend the confirmation link below.",
            });
            return;
          }
          setNeedsVerification(false);
          throw error;
        }
        setNeedsVerification(false);
        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setBanner({
          tone: "success",
          message:
            "Check your inbox for the confirmation email. Once confirmed, you can sign in.",
        });
        return;
      }
    } catch (err) {
      setBanner({ tone: "error", message: err instanceof Error ? err.message : "Something went wrong" });
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (!EMAIL_REGEX.test(email.trim())) {
      setBanner({ tone: "error", message: "Enter a valid email before requesting a reset." });
      return;
    }

    setIsResetting(true);
    const supabase = supabaseBrowser();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (error) throw error;
      setBanner({ tone: "success", message: "Password reset link sent. Check your inbox." });
    } catch (err) {
      setBanner({ tone: "error", message: err instanceof Error ? err.message : "Unable to send reset link." });
    } finally {
      setIsResetting(false);
    }
  }

  async function handleResendVerification() {
    if (!EMAIL_REGEX.test(email.trim())) {
      setBanner({ tone: "error", message: "Enter a valid email before requesting a new confirmation link." });
      return;
    }

    setIsResendingVerify(true);
    const supabase = supabaseBrowser();
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
      if (error) throw error;
      setBanner({ tone: "success", message: "Verification email resent. Check your inbox." });
    } catch (err) {
      setBanner({ tone: "error", message: err instanceof Error ? err.message : "Unable to resend verification email." });
    } finally {
      setIsResendingVerify(false);
    }
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-lg backdrop-blur md:mt-24">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">PM Intelligence Hub</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">{copy[variant].title}</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter your credentials to continue.</p>
      </div>

      {banner && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            banner.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {banner.message}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-zinc-700" htmlFor="email">
          Email
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="you@company.com"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Minimum 8 characters"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Please wait…" : copy[variant].cta}
        </button>
      </form>

      {variant === "login" && (
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={isResetting}
          className="mt-4 w-full rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResetting ? "Sending reset link…" : "Send me a password reset link"}
        </button>
      )}

      {variant === "login" && needsVerification && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isResendingVerify}
          className="mt-3 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResendingVerify ? "Resending verification…" : "Resend verification email"}
        </button>
      )}

      <div className="mt-6 flex flex-col gap-2 text-sm text-zinc-600">
        <div className="flex items-center justify-between">
          <span>{copy[variant].alt}</span>
          <Link href={copy[variant].altHref} className="font-medium text-blue-600 hover:text-blue-700">
            {variant === "login" ? "Create one" : "Sign in"}
          </Link>
        </div>
        <p className="text-xs text-zinc-400">
          By continuing you agree to the PM Intelligence Hub terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

export function AuthForm({ variant }: { variant: Mode }) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner variant={variant} />
    </Suspense>
  );
}

// Exposed for testing and to keep Suspense wrapper minimal.
export { AuthFormInner };
