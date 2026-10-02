import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, phone, username, otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ success: false, message: "Thiếu OTP" }, { status: 400 });
    }

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
      return NextResponse.json({ success: false, message: "Không tìm thấy tài khoản" }, { status: 400 });
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return NextResponse.json({ success: false, message: "Mã OTP không đúng" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: "OTP đã hết hạn. Gửi lại." }, { status: 400 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        resetToken,
        resetTokenExpiry: resetExpiry,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác thực thành công",
      resetToken,
    });
  } catch (error) {
    console.error("[verify-otp]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
