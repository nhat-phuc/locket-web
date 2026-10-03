import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    const limit = rateLimit(`forgot:${ip}`, 3, 3600000);
    if (!limit.success) {
      return NextResponse.json(
        { success: false, message: "Quá nhiều yêu cầu. Thử lại sau 1 giờ." },
        { status: 429 }
      );
    }
    const body = await req.json();
    const { identifier } = body;

    if (!identifier || identifier.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Nhập tên, email hoặc SĐT" },
        { status: 400 }
      );
    }

    const id = identifier.trim();

    // Tìm user theo email / username / name / phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: id },
          { username: id },
          { name: id },
          { phone: id },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    // Tạo token reset (hết hạn 15 phút)
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Link reset
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/dat-lai-mat-khau?token=${token}`;

    // TODO: Gửi email thật (Resend)
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    console.log(`[RESET] User: ${user.email}`);
    console.log(`[RESET] Link: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: "Đã gửi link đặt lại. Kiểm tra email của bạn!",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
