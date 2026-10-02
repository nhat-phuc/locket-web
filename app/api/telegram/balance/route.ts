import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json({ success: false, message: "Thiếu telegramId" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { telegramId: String(telegramId) },
      select: { balance: true, name: true, username: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Chưa liên kết" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      balance: user.balance,
      name: user.name || user.username || user.email,
    });
  } catch (error) {
    console.error("[telegram/balance]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
