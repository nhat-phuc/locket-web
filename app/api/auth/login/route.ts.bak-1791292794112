import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    const limit = rateLimit(`login:${ip}`, 5, 60000);
    if (!limit.success) {
      return NextResponse.json(
        { success: false, message: "Quá nhiều lần thử. Vui lòng đợi 1 phút." },
        { status: 429 }
      );
    }
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập email và mật khẩu" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }
    if (user.isBanned) {
      return NextResponse.json({ success: false, message: "Tài khoản đã bị khóa" }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        picture: user.picture,
        balance: user.balance,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}
