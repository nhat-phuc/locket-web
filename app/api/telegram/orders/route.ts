import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  if (!chatId) return NextResponse.json({ success: false });

  const user = await prisma.user.findFirst({ where: { telegramId: String(chatId) } });
  if (!user) return NextResponse.json({ success: false });

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
