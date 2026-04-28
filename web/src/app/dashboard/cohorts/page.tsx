import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CohortsPage() {
  // Temporarily hidden per product decision.
  redirect("/dashboard");
}
