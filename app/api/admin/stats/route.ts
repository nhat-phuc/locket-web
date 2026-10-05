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

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      paidOrders,
      completedOrders,
      recentOrders,
    ] = await Promise.all([
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

    // ═══ THỐNG KÊ THEO DỊCH VỤ ═══
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        sold: true,
        isActive: true,
        isFeatured: true,
      },
    });

    // Đếm đơn hàng theo serviceName + tính doanh thu
    const ordersByService = await prisma.order.groupBy({
      by: ["serviceName"],
      where: { status: { in: ["paid", "completed"] } },
      _count: { id: true },
      _sum: { finalAmount: true },
    });

    // Map order stats theo tên dịch vụ
    const orderStatsMap = new Map<
      string,
      { count: number; revenue: number }
    >();
    ordersByService.forEach((o) => {
      orderStatsMap.set(o.serviceName, {
        count: o._count.id,
        revenue: o._sum.finalAmount || 0,
      });
    });

    // Tổng hợp thống kê dịch vụ
    const serviceStats = services.map((s) => {
      const orderStats = orderStatsMap.get(s.name) || { count: 0, revenue: 0 };
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        price: s.price,
        stock: s.stock || 0,
        sold: s.sold,
        isActive: s.isActive,
        isFeatured: s.isFeatured,
        orderCount: orderStats.count,
        revenue: orderStats.revenue,
      };
    });

    // Tính tổng
    const totalServiceOrders = serviceStats.reduce(
      (sum, s) => sum + s.orderCount,
      0
    );
    const totalServiceRevenue = serviceStats.reduce(
      (sum, s) => sum + s.revenue,
      0
    );
    const totalStock = serviceStats.reduce((sum, s) => sum + s.stock, 0);

    // Dịch vụ bán chạy nhất
    const topServices = [...serviceStats]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

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
      serviceStats,
      serviceSummary: {
        totalServices: services.length,
        totalOrders: totalServiceOrders,
        totalRevenue: totalServiceRevenue,
        totalStock,
      },
      topServices,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
