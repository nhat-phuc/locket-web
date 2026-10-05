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
    const now = new Date();

    // ═══ 1. DOANH THU 30 NGÀY QUA ═══
    const days: { date: string; amount: number; count: number }[] = [];
    let total30d = 0;
    let today = 0;
    let yesterday = 0;

    for (let i = 29; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      const orders = await prisma.order.findMany({
        where: {
          status: { in: ["paid", "completed"] },
          paidAt: { gte: start, lt: end },
        },
        select: { finalAmount: true },
      });

      const amount = orders.reduce((s, o) => s + o.finalAmount, 0);
      days.push({
        date: start.toISOString().slice(0, 10),
        amount,
        count: orders.length,
      });
      total30d += amount;

      if (i === 0) today = amount;
      if (i === 1) yesterday = amount;
    }

    // ═══ 2. TỔNG DOANH THU ALL TIME ═══
    const allTimeAgg = await prisma.order.aggregate({
      where: { status: { in: ["paid", "completed"] } },
      _sum: { finalAmount: true },
      _count: { id: true },
    });
    const total = allTimeAgg._sum.finalAmount || 0;

    // ═══ 3. THÁNG NÀY ═══
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthAgg = await prisma.order.aggregate({
      where: {
        status: { in: ["paid", "completed"] },
        paidAt: { gte: monthStart },
      },
      _sum: { finalAmount: true },
    });
    const month = monthAgg._sum.finalAmount || 0;

    // ═══ 4. TOP DỊCH VỤ ═══
    const byService = await prisma.order.groupBy({
      by: ["serviceName"],
      where: { status: { in: ["paid", "completed"] } },
      _count: { id: true },
      _sum: { finalAmount: true },
    });
    const topServices = byService
      .map((s) => ({
        name: s.serviceName,
        count: s._count.id,
        revenue: s._sum.finalAmount || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ═══ 5. DOANH THU THEO PHƯƠNG THỨC ═══
    const byMethod = await prisma.order.groupBy({
      by: ["paymentMethod"],
      where: { status: { in: ["paid", "completed"] } },
      _sum: { finalAmount: true },
      _count: { id: true },
    });
    const byPaymentMethod = byMethod.map((m) => ({
      method: m.paymentMethod || "bank_transfer",
      revenue: m._sum.finalAmount || 0,
      count: m._count.id,
    }));

    // ═══ 6. GROWTH ═══
    const yesterdayGrowth =
      yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

    return NextResponse.json({
      success: true,
      days,
      total,
      today,
      month,
      yesterday,
      yesterdayGrowth,
      total30d,
      totalOrders: allTimeAgg._count.id,
      topServices,
      byPaymentMethod,
    });
  } catch (error) {
    console.error("[admin/revenue]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
