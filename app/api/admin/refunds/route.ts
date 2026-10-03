import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({ 
    where: { id: session.userId }, 
    select: { role: true } 
  });
  return u?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { status: "refund_requested" },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json({ success: true, orders });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const { orderId } = await req.json();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const newBalance = user.balance + order.finalAmount;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "refunded" },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "refund",
          amount: order.finalAmount,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "admin",
          description: `Hoàn tiền đơn #${order.orderCode}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/refunds]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
