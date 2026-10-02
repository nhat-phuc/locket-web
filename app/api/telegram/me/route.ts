import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) return NextResponse.json({ success: false });

    const user = await prisma.user.findFirst({
      where: { telegramId: String(chatId) },
    });

    if (!user) return NextResponse.json({ success: false });

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
        balance: user.balance,
        totalOrders,
        paidOrders,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
