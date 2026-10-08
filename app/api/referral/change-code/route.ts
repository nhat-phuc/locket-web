import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const BANNED = ["admin", "system", "root", "locket", "gold", "support", "vip", "mod"];
const REGEX = /^[A-Z0-9]{4,12}$/;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { code } = await req.json();
    const cleaned = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!REGEX.test(cleaned)) {
      return NextResponse.json(
        { success: false, message: "Mã phải 4-12 ký tự, chỉ A-Z và 0-9" },
        { status: 400 }
      );
    }

    if (BANNED.some((w) => cleaned.toLowerCase().includes(w))) {
      return NextResponse.json(
        { success: false, message: "Mã chứa từ không được phép" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { referralCode: true, codeChangedAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    if (user.codeChangedAt) {
      return NextResponse.json(
        { success: false, message: "Bạn đã đổi mã 1 lần rồi" },
        { status: 400 }
      );
    }

    const taken = await prisma.user.findUnique({
      where: { referralCode: cleaned },
    });
    if (taken) {
      return NextResponse.json({ success: false, message: "Mã đã có người dùng" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { referralCode: cleaned, codeChangedAt: new Date() },
    });

    return NextResponse.json({ success: true, code: cleaned });
  } catch (error) {
    console.error("[referral/change-code]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
