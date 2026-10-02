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

    const code = "LINK-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    await prisma.user.update({
      where: { id: session.userId },
      data: { telegramLinkCode: code },
    });

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("[telegram/generate-code]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
