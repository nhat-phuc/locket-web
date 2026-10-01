import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return NextResponse.json(
        { success: false, error: "Mã OTP không hợp lệ" },
        { status: 400 }
      );
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: "Mã OTP đã hết hạn" },
        { status: 400 }
      );
    }

    if (user.otpCode !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Mã OTP không đúng" },
        { status: 400 }
      );
    }

    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        resetToken,
        resetTokenExpiry,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mã OTP chính xác",
      resetToken,
    });
  } catch (error) {
    console.error("[verify-otp]", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
