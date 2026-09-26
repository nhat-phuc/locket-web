import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

interface GooglePayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ success: false, message: "Thiếu credential" }, { status: 400 });
    }

    const parts = credential.split(".");
    if (parts.length !== 3) {
      return NextResponse.json({ success: false, message: "Token không hợp lệ" }, { status: 400 });
    }

    const payload: GooglePayload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    if (!payload.email || !payload.email_verified) {
      return NextResponse.json({ success: false, message: "Email chưa xác thực" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      const baseUsername = payload.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      let username = baseUsername;
      let suffix = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix}`;
        suffix++;
      }

      user = await prisma.user.create({
        data: {
          email: payload.email,
          username,
          password: "",
          name: payload.name || username,
          picture: payload.picture || null,
          role: "user",
          balance: 0,
          isActive: true,
          isBanned: false,
        },
      });
    } else if (payload.picture && user.picture !== payload.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { picture: payload.picture },
      });
    }

    if (user.isBanned) {
      return NextResponse.json({ success: false, message: "Tài khoản đã bị khóa" }, { status: 403 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Đăng nhập Google thành công",
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
    console.error("Google auth error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
