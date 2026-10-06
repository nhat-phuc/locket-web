import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");
  if (!telegramId) {
    return NextResponse.json({ success: false, message: "Thiếu telegramId" });
  }

  const user = await prisma.user.findFirst({ where: { telegramId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "Chưa liên kết" });
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      serviceName: "Nạp tiền",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      orderCode: true,
      amount: true,
      finalAmount: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, orders });
}
