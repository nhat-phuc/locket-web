import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { isValidEmail, isValidUsername, isStrongPassword } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, name, phone } = body;

    // Validate bắt buộc
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { success: false, message: "Username chỉ chứa chữ, số, gạch dưới (3-20 ký tự)" },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Validate phone (bắt buộc)
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập số điện thoại" },
        { status: 400 }
      );
    }

    if (!/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)" },
        { status: 400 }
      );
    }

    // Kiểm tra email/username đã tồn tại
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.email === email
              ? "Email đã được sử dụng"
              : "Username đã tồn tại",
        },
        { status: 400 }
      );
    }

    // Kiểm tra phone đã tồn tại
    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "Số điện thoại đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user với phone
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || username,
        phone: phone || null,
        role: "user",
        balance: 0,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        picture: user.picture,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
