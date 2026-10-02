import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, chatId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) return NextResponse.json({ success: false, message: "Email không tồn tại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiry: expiry },
    });

    const isDev = process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      ...(isDev && { devOtp: otp }),
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
