import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token || body.code;
    const chatId = body.chatId;

    if (!token || !chatId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" });
    }

    const user = await prisma.user.findFirst({
      where: { telegramLinkCode: token },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Token không hợp lệ" });
    }

    const existing = await prisma.user.findFirst({
      where: { telegramId: String(chatId), id: { not: user.id } },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Chat đã liên kết tài khoản khác" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramId: String(chatId),
        telegramLinkCode: null,
        telegramLinkedAt: new Date(),
      },
    });

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
    console.error("[link]", error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
