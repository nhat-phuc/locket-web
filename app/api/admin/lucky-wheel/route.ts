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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    // 1. Lịch sử spin gần đây
    const spins = await prisma.spin.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 2. Tổng hợp
    const totalSpins = await prisma.spin.count();
    const totalPaid = await prisma.transaction.aggregate({
      where: { method: "lucky_wheel", status: "success" },
      _sum: { amount: true },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySpins = await prisma.spin.count({
      where: { createdAt: { gte: today } },
    });

    // 3. Top user quay nhiều
    const topUsers = await prisma.spin.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 10,
    });

    const userIds = topUsers.map((t) => t.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      success: true,
      stats: {
        totalSpins,
        todaySpins,
        totalPaid: totalPaid._sum.amount || 0,
      },
      spins: spins.map((s) => ({
        id: s.id,
        userId: s.userId,
        label: s.label,
        value: s.value,
        createdAt: s.createdAt,
      })),
      topUsers: topUsers.map((t) => ({
        userId: t.userId,
        username: userMap.get(t.userId)?.username || "—",
        email: userMap.get(t.userId)?.email || "—",
        count: t._count.userId,
      })),
    });
  } catch (error) {
    console.error("[admin/lucky-wheel]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
