import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { ensureReferralCode } from "@/lib/referral";

interface GooglePayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
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

    let payload: GooglePayload;
    try {
      payload = JSON.parse(decodeBase64Url(parts[1]));
    } catch (e) {
      console.error("[GOOGLE] Decode error:", e);
      return NextResponse.json({ success: false, message: "Token không giải mã được" }, { status: 400 });
    }

    console.log("[GOOGLE PAYLOAD]", JSON.stringify(payload));

    if (!payload.email || typeof payload.email !== "string") {
      console.error("[GOOGLE] Missing email:", payload);
      return NextResponse.json({ success: false, message: "Không lấy được email" }, { status: 400 });
    }

    if (!payload.email_verified) {
      return NextResponse.json({ success: false, message: "Email chưa xác thực" }, { status: 400 });
    }

    const email = String(payload.email).trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "user";
      let username = baseUsername;
      let suffix = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix}`;
        suffix++;
        if (suffix > 9999) break;
      }

      user = await prisma.user.create({
        data: {
          email,
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

    // Đảm bảo user có mã GT riêng (Google login)
    await ensureReferralCode({
      id: user.id,
      username: user.username,
      referralCode: user.referralCode,
    });

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
    console.error("[GOOGLE] Auth error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
