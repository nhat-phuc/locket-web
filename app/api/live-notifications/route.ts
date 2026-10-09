import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

function hideName(name: string): string {
  if (!name) return "Một người dùng";
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || "";
  if (first.length <= 2) return first.charAt(0) + "***";
  return first.slice(0, 2) + "***";
}

export async function GET() {
  try {
    const session = await getSession();

    // 20 giao dịch nạp gần nhất
    const txs = await prisma.transaction.findMany({
      where: {
        type: { in: ["recharge", "deposit", "admin_recharge"] },
        status: { in: ["completed", "success"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, username: true, picture: true } },
      },
    });

    const items = txs.map((t) => {
      const isMine = session?.userId === t.userId;
      const displayName = isMine
        ? "Bạn"
        : hideName(t.user.name || t.user.username || "Người dùng");
      return {
        id: t.id,
        name: displayName,
        amount: t.amount,
        avatar: t.user.picture,
        isMine,
        createdAt: t.createdAt,
      };
    });

    // Nạp tiền gần đây (<5 phút)
    let myRecentRecharge: any = null;
    if (session) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const mine = await prisma.transaction.findFirst({
        where: {
          userId: session.userId,
          type: { in: ["recharge", "deposit", "admin_recharge"] },
          status: { in: ["completed", "success"] },
          createdAt: { gte: fiveMinAgo },
        },
        orderBy: { createdAt: "desc" },
      });
      if (mine) {
        myRecentRecharge = {
          id: mine.id,
          amount: mine.amount,
          createdAt: mine.createdAt,
        };
      }
    }

    // Mua gói gần đây (<5 phút) — đơn đã thanh toán
    let myRecentOrder: any = null;
    if (session) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const order = await prisma.order.findFirst({
        where: {
          userId: session.userId,
          status: { in: ["paid", "completed", "processing"] },
          paidAt: { gte: fiveMinAgo },
        },
        orderBy: { paidAt: "desc" },
      });
      if (order) {
        myRecentOrder = {
          id: order.id,
          orderCode: order.orderCode,
          serviceName: order.serviceName,
          amount: order.finalAmount,
          createdAt: order.paidAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      items,
      myRecentRecharge,
      myRecentOrder,
    });
  } catch (error) {
    console.error("[live-notifications]", error);
    return NextResponse.json({
      success: true,
      items: [],
      myRecentRecharge: null,
      myRecentOrder: null,
    });
  }
}
