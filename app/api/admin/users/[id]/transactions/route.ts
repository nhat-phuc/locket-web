import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false }, { status: auth.status });

  try {
    const { id } = await params;
    const txs = await prisma.transaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      transactions: txs.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[user-transactions]", error);
    return NextResponse.json({ success: false, transactions: [] }, { status: 500 });
  }
}
