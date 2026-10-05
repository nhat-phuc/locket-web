import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return u?.role === "admin";
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        picture: true,
        phone: true,
        password: true,
        role: true,
        balance: true,
        bonusBalance: true,
        isActive: true,
        isBanned: true,
        telegramId: true,
        telegramLinkedAt: true,
        referralCode: true,
        referredBy: true,
        totalReferrals: true,
        commission: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Map data — che mật khẩu, chỉ hiện 20 ký tự đầu
    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      name: u.name,
      picture: u.picture,
      phone: u.phone,
      passwordMasked: u.password ? u.password.substring(0, 20) + "..." : "(trống)",
      passwordFull: u.password, // Admin mới xem được
      registerMethod: u.telegramId ? "Telegram" : u.password ? "Email/Google" : "Không rõ",
      role: u.role,
      balance: u.balance,
      bonusBalance: u.bonusBalance,
      isActive: u.isActive,
      isBanned: u.isBanned,
      telegramId: u.telegramId,
      telegramLinkedAt: u.telegramLinkedAt,
      referralCode: u.referralCode,
      referredBy: u.referredBy,
      totalReferrals: u.totalReferrals,
      commission: u.commission,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total: safeUsers.length,
    });
  } catch (error) {
    console.error("[admin/user-credentials]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST: Đổi mật khẩu user
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: { id: true, username: true, email: true },
    });

    return NextResponse.json({
      success: true,
      message: `Đã đổi mật khẩu cho @${user.username}`,
      user,
    });
  } catch (error) {
    console.error("[admin/change-password]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
