import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function maskName(name: string): string {
  if (!name) return "***";
  const n = name.replace(/^@/, "").trim();
  if (n.length <= 4) return n.charAt(0) + "***" + n.charAt(n.length - 1);
  return n.slice(0, 2) + "***" + n.slice(-2);
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export async function GET() {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Orders paid
    const orders = await prisma.order.findMany({
      where: { status: "paid", paidAt: { gte: since24h } },
      orderBy: { paidAt: "desc" },
      take: 20,
      select: {
        id: true,
        serviceName: true,
        locketUsername: true,
        finalAmount: true,
        paidAt: true,
        createdAt: true,
        user: { select: { name: true, username: true, picture: true, email: true } },
      },
    });

    // Recharges
    const txs = await prisma.transaction.findMany({
      where: { type: "recharge", status: "success", createdAt: { gte: since24h } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, username: true, picture: true, email: true } },
      },
    });

    const notifications = [
      ...orders.map((o) => {
        const name = o.locketUsername || o.user?.name || o.user?.username || o.user?.email?.split("@")[0] || "user";
        return {
          id: o.id,
          kind: "order" as const,
          name: maskName(name),
          initial: name.charAt(0).toUpperCase(),
          avatar: o.user?.picture || null,
          message: `${maskName(name)} vừa đăng ký gói`,
          detail: o.serviceName,
          time: relativeTime(o.paidAt || o.createdAt),
          timestamp: (o.paidAt || o.createdAt).getTime(),
        };
      }),
      ...txs.map((t) => {
        const name = t.user?.name || t.user?.username || t.user?.email?.split("@")[0] || "user";
        const amount = Math.abs(t.amount);
        return {
          id: t.id,
          kind: "recharge" as const,
          name: maskName(name),
          initial: name.charAt(0).toUpperCase(),
          avatar: t.user?.picture || null,
          message: `${maskName(name)} vừa nạp tiền`,
          detail: `+${amount.toLocaleString("vi-VN")}đ vào số dư`,
          time: relativeTime(t.createdAt),
          timestamp: t.createdAt.getTime(),
        };
      }),
    ];

    notifications.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 30),
    });
  } catch (error) {
    console.error("[live-notifications]", error);
    return NextResponse.json({ success: false, notifications: [] }, { status: 500 });
  }
}
