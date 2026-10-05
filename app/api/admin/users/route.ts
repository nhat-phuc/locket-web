import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_SPINS_PER_DAY = 3;

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return u?.role === "admin";
}

function getTodayVN() {
  const now = new Date();
  const vnOffset = 7 * 60 * 60 * 1000;
  const vnNow = new Date(now.getTime() + vnOffset);
  vnNow.setUTCHours(0, 0, 0, 0);
  return new Date(vnNow.getTime() - vnOffset);
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const take = Math.min(Number(searchParams.get("take") || 100), 500);

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      } : {},
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        picture: true,
        role: true,
        balance: true,
        bonusBalance: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
      },
    });

    // Đếm lượt quay hôm nay cho từng user
    const todayStart = getTodayVN();
    const userIds = users.map((u) => u.id);
    const todaySpins = await prisma.spin.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        createdAt: { gte: todayStart },
      },
      _count: { userId: true },
    });
    const spinMap = new Map(todaySpins.map((s) => [s.userId, s._count.userId]));

    const usersWithSpins = users.map((u) => {
      const used = spinMap.get(u.id) || 0;
      return {
        ...u,
        spinsUsed: used,
        spinsLeft: Math.max(0, MAX_SPINS_PER_DAY - used),
        maxSpins: MAX_SPINS_PER_DAY,
      };
    });

    return NextResponse.json({
      success: true,
      users: usersWithSpins,
      total: users.length,
    });
  } catch (error) {
    console.error("[admin/users]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
