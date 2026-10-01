import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Nếu email tồn tại, mã OTP đã được gửi.",
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiry },
    });

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Mã OTP đặt lại mật khẩu Locket Gold",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #7c3aed;">Mã OTP đặt lại mật khẩu</h1>
          <p>Xin chào <strong>${user.name || user.username}</strong>,</p>
          <p>Mã OTP của bạn là:</p>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #7c3aed; padding: 20px; background: #f5f3ff; border-radius: 12px; text-align: center; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 13px;">Mã có hiệu lực trong 10 phút.</p>
        </div>
      `,
    });

    const isDev = !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "Mã OTP đã được gửi đến email."
        : "Đã tạo mã OTP (dev mode).",
      ...(isDev && { devOtp: otpCode }),
    });
  } catch (error) {
    console.error("[send-otp]", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
