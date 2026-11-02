import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/supabase-server";
import { getMe } from "@/lib/me";
import { hasRole } from "@/lib/roles";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[\n\r\",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const { session } = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await getMe();
  const roles = me?.roles ?? [];
  if (!hasRole(roles, ["OWNER", "ADMIN", "BILLING"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const prisma = getPrisma();

  // NOTE(v1): schema currently has Invoice.accountId (no org/workspace scoping yet).
  // Export all invoices; tighten once Account selection/org scoping lands.
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      account: { select: { id: true, name: true } },
    },
  });

  // Audit stub (replace with real audit log table when available).
  console.log(
    JSON.stringify({
      event: "export_csv",
      entity: "invoice",
      actorUserId: session.user.id,
      actorEmail: session.user.email ?? null,
      rowCount: invoices.length,
      ts: new Date().toISOString(),
    }),
  );

  const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;

  const header = [
    "invoiceId",
    "accountId",
    "accountName",
    "amountCents",
    "currency",
    "status",
    "dueDate",
    "squareInvoiceId",
    "createdAt",
    "updatedAt",
  ];

  const lines: string[] = [];
  lines.push(header.join(","));

  for (const inv of invoices) {
    lines.push(
      [
        inv.id,
        inv.accountId,
        inv.account?.name ?? "",
        inv.amountCents,
        inv.currency,
        inv.status,
        inv.dueDate ? inv.dueDate.toISOString() : "",
        inv.squareInvoiceId ?? "",
        inv.createdAt.toISOString(),
        inv.updatedAt.toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const body = lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
