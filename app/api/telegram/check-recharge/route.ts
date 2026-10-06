import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderCode = searchParams.get("orderCode");
  const telegramId = searchParams.get("telegramId");

  if (!orderCode) {
    return NextResponse.json({ success: false, message: "Thiếu mã đơn" });
  }

  const order = await prisma.order.findUnique({
    where: { orderCode },
    select: {
      id: true,
      orderCode: true,
      serviceName: true,
      amount: true,
      finalAmount: true,
      status: true,
      paidAt: true,
      createdAt: true,
      expiresAt: true,
      userId: true,
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "Không tìm thấy đơn" });
  }

  // Nếu có telegramId → verify quyền
  if (telegramId) {
    const user = await prisma.user.findFirst({ where: { telegramId } });
    if (!user || user.id !== order.userId) {
      return NextResponse.json({ success: false, message: "Không có quyền" });
    }
  }

  return NextResponse.json({ success: true, order });
}
