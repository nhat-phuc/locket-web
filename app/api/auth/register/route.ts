import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { isValidEmail, isValidUsername, isStrongPassword } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, name } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Email không hợp lệ" }, { status: 400 });
    }
    if (!isValidUsername(username)) {
      return NextResponse.json({ success: false, message: "Username chỉ chứa chữ, số, gạch dưới (3-20 ký tự)" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json({
        success: false,
        message: existing.email === email ? "Email đã được sử dụng" : "Username đã tồn tại",
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || username,
        role: "user",
        balance: 0,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        picture: user.picture,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại" }, { status: 500 });
  }
}
