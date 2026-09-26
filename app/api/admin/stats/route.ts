import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền admin" }, { status: 403 });
    }

    const [totalUsers, totalOrders, totalRevenue, pendingOrders, paidOrders, completedOrders, recentOrders] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: { in: ["paid", "completed"] } },
          _sum: { finalAmount: true },
        }),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.order.count({ where: { status: "paid" } }),
        prisma.order.count({ where: { status: "completed" } }),
        prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        pendingOrders,
        paidOrders,
        completedOrders,
      },
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
