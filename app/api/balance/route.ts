import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Thiếu email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { balance: true, bonusBalance: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      balance: user.balance,
      bonusBalance: user.bonusBalance,
      total: user.balance + user.bonusBalance,
    });
  } catch (error) {
    console.error("[balance]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
