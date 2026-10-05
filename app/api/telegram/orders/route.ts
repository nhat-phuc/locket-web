import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("telegramId") || searchParams.get("chatId");
  if (!chatId) return NextResponse.json({ success: false, message: "Thiếu telegramId" });

  const user = await prisma.user.findFirst({ where: { telegramId: String(chatId) } });
  if (!user) return NextResponse.json({ success: false, message: "Chưa liên kết" });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true, orderCode: true, serviceName: true,
      finalAmount: true, status: true, locketUsername: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, orders });
}
