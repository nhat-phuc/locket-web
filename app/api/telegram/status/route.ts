import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { telegramId: true, telegramLinkedAt: true },
    });

    return NextResponse.json({
      success: true,
      linked: !!user?.telegramId,
      telegramId: user?.telegramId || null,
    });
  } catch (error) {
    console.error("[telegram/status]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
