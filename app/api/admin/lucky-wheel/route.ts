import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_SPINS_PER_DAY = 3;

function getTodayVN() {
  const now = new Date();
  const vnOffset = 7 * 60 * 60 * 1000;
  const vnNow = new Date(now.getTime() + vnOffset);
  vnNow.setUTCHours(0, 0, 0, 0);
  return new Date(vnNow.getTime() - vnOffset);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    if (me?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
    }

    // 1. TẤT CẢ users
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, username: true, email: true, name: true, picture: true,
        role: true, balance: true, bonusBalance: true, createdAt: true,
      },
    });

    // 2. Lịch sử spin
    const spins = await prisma.spin.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // 3. Spin hôm nay + tổng spin theo user
    const todayStart = getTodayVN();
    const [todaySpinsByUser, totalSpinsByUser] = await Promise.all([
      prisma.spin.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: todayStart } },
        _count: { userId: true },
      }),
      prisma.spin.groupBy({
        by: ["userId"],
        _count: { userId: true },
        _sum: { value: true },
      }),
    ]);
    const todayMap = new Map(todaySpinsByUser.map((t) => [t.userId, t._count.userId]));
    const totalMap = new Map(totalSpinsByUser.map((t) => [t.userId, { count: t._count.userId, sum: t._sum.value || 0 }]));

    // 4. Thống kê
    const totalSpins = await prisma.spin.count();
    const todaySpins = todaySpinsByUser.reduce((s, t) => s + t._count.userId, 0);
    const totalPaid = await prisma.transaction.aggregate({
      where: { method: "lucky_wheel", status: "success" },
      _sum: { amount: true },
    });

    // 5. Users với info
    const usersWithInfo = allUsers.map((u) => {
      const used = todayMap.get(u.id) || 0;
      const total = totalMap.get(u.id) || { count: 0, sum: 0 };
      return {
        ...u,
        spinsUsed: used,
        spinsLeft: Math.max(0, MAX_SPINS_PER_DAY - used),
        maxSpins: MAX_SPINS_PER_DAY,
        totalSpins: total.count,
        totalWon: total.sum,
      };
    });

    // 6. Spins với username
    const userMap = new Map(allUsers.map((u) => [u.id, { username: u.username, email: u.email }]));
    const spinsWithUser = spins.map((s) => ({
      id: s.id,
      userId: s.userId,
      username: userMap.get(s.userId)?.username || "—",
      email: userMap.get(s.userId)?.email || "—",
      label: s.label,
      value: s.value,
      type: s.type,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSpins,
        todaySpins,
        totalPaid: totalPaid._sum.amount || 0,
        totalUsers: allUsers.length,
      },
      users: usersWithInfo,
      spins: spinsWithUser,
    });
  } catch (error) {
    console.error("[admin/lucky-wheel]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
