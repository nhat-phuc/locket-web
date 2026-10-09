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
    const orders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        serviceName: o.serviceName,
        amount: o.finalAmount,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("[user-orders]", error);
    return NextResponse.json({ success: false, orders: [] }, { status: 500 });
  }
}
