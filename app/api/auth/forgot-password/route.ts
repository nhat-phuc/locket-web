import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

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
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/dat-lai-mat-khau?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Đặt lại mật khẩu Locket Gold",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #7c3aed;">Đặt lại mật khẩu</h1>
          <p>Xin chào <strong>${user.name || user.username}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới:</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">
              Đặt lại mật khẩu
            </a>
          </p>
          <p style="color:#666;font-size:13px;">Link có hiệu lực trong 15 phút.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
      ...(process.env.NODE_ENV === "development" && { devResetLink: resetLink }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra, vui lòng thử lại" },
      { status: 500 }
    );
  }
}