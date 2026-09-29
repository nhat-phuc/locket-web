import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/admin/pending-transactions?status=pending
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const items = await prisma.pendingTransaction.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, items });
}

// PATCH /api/admin/pending-transactions — resolve/reject
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { id, action, note } = await req.json();
  if (!id || !["resolve", "reject"].includes(action)) {
    return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
  }

  await prisma.pendingTransaction.update({
    where: { id },
    data: {
      status: action === "resolve" ? "resolved" : "rejected",
      note: note || null,
      resolvedBy: session.userId,
      resolvedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
