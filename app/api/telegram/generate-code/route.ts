import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import crypto from "crypto";

// POST /api/telegram/generate-code
// Tạo token ngẫu nhiên + trả deep link để mở bot
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    // Tạo token ngẫu nhiên 32 ký tự
    const token = crypto.randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        telegramLinkCode: token,
        telegramLinkExpiry: expiry,  // ← field này cần check
      },
    });

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YOUR_BOT";
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      deepLink,
      expiry: expiry.toISOString(),
    });
  } catch (error) {
    console.error("[generate-code]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
