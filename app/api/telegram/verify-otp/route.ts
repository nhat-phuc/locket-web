import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp, chatId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.otpCode !== otp.trim()) {
      return NextResponse.json({ success: false, message: "OTP không đúng" });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: "OTP hết hạn" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramId: String(chatId),
        otpCode: null,
        otpExpiry: null,
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
