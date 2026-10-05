import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Nhận cả telegramId và chatId (fallback)
  const chatId = searchParams.get("telegramId") || searchParams.get("chatId");
  if (!chatId) return NextResponse.json({ success: false, message: "Thiếu telegramId" });

  const user = await prisma.user.findFirst({
    where: { telegramId: String(chatId) },
  });
  if (!user) return NextResponse.json({ success: false, message: "User chưa liên kết" });

  const [totalOrders, paidOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id, status: "paid" } }),
  ]);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      picture: user.picture,
      balance: user.balance,
      bonusBalance: user.bonusBalance,
      role: user.role,
      totalOrders,
      paidOrders,
    },
  });
}
