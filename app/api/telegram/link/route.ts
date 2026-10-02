import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/telegram/link
// Body: { token, chatId }
export async function POST(req: Request) {
  try {
    const { token, chatId, code } = await req.json();
    const linkToken = token || code; // Hỗ trợ cả 2

    if (!linkToken || !chatId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" });
    }

    // Tìm user theo token (hỗ trợ cả telegramLinkCode cũ)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { telegramLinkCode: linkToken },
        ],
        telegramLinkExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
    }

    // Check chatId đã link với user khác chưa
    const existing = await prisma.user.findFirst({
      where: {
        telegramId: String(chatId),
        id: { not: user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Chat Telegram đã liên kết tài khoản khác" });
    }

    // Liên kết
    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramId: String(chatId),
        telegramLinkCode: null,
        telegramLinkExpiry: null,
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
    console.error("[telegram/link]", error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
