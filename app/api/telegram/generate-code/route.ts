import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        telegramLinkCode: token,
      },
    });

    // Lưu expiry vào telegramLinkedAt tạm (hoặc bỏ nếu không có field)
    const botUsername = "amirose_bot";
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      deepLink,
    });
  } catch (error) {
    console.error("[generate-code]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
