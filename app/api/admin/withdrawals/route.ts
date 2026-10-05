import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const where = status === "all" ? {} : { status };

    const list = await prisma.withdrawalRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            picture: true,
            phone: true,
            telegramId: true,
            balance: true,           // ✅ Số dư hiện tại
            bonusBalance: true,      // ✅ Tiền vòng quay
            totalWithdrawn: true,    // ✅ Tổng đã rút (nếu có)
          },
        },
      },
    });

    // Đếm số lần rút thành công của mỗi user
    const userIds = [...new Set(list.map((w) => w.userId))];
    const withdrawCounts = await prisma.withdrawalRequest.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        status: "completed",
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    const statsMap = new Map(
      withdrawCounts.map((s) => [
        s.userId,
        { count: s._count.id, total: s._sum.amount || 0 },
      ])
    );

    // Merge vào list
    const listWithStats = list.map((w) => ({
      ...w,
      userStats: statsMap.get(w.userId) || { count: 0, total: 0 },
    }));

    return NextResponse.json({ success: true, list: listWithStats });
  } catch (error) {
    console.error("[admin/withdrawals GET]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
