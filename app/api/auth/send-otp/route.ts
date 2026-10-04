import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY chưa cấu hình");
  return new Resend(key);
}

const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function POST(req: Request) {
  try {
    const { email, phone, username } = await req.json();

    let user = null;

    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      let p = String(phone).replace(/\D/g, "");
      if (p.startsWith("84")) p = "0" + p.slice(2);
      user = await prisma.user.findFirst({ where: { phone: p } });
    } else if (username) {
      user = await prisma.user.findFirst({ where: { username: String(username).trim() } });
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Nếu tài khoản tồn tại, bạn sẽ nhận được mã OTP.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiry: expiry },
    });

    try {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: "🔐 Mã OTP đặt lại mật khẩu - Locket Gold",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">🔐 Đặt lại mật khẩu</h2>
            <p>Xin chào <b>${user.name || user.username || user.email}</b>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã OTP của bạn là:</p>
            <div style="background: #f5f3ff; border: 2px dashed #a78bfa; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #7c3aed;">${otp}</div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">⏱ Mã có hiệu lực trong <b>5 phút</b>.</p>
            <p style="color: #ef4444; font-size: 13px;">⚠️ Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">© 2026 Locket Gold - Phúc Nexus</p>
          </div>
        `,
      });

      console.log(`[OTP] Gửi cho ${user.email}: ${otp}`);
    } catch (emailError) {
      console.error("[OTP] Lỗi gửi email:", emailError);
      console.log(`[OTP FALLBACK] ${user.email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi mã OTP tới email liên kết.",
      maskedEmail: user.email.replace(/(.{2}).*@/, "$1***@"),
    });
  } catch (error) {
    console.error("[send-otp]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
