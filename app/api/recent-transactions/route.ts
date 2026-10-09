import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const typeMeta: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  gold:     { icon: "⭐", label: "GOLD",    color: "#e63946", bg: "rgba(230,57,70,0.12)" },
  vip:      { icon: "💜", label: "VIP",     color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  luxury:   { icon: "💎", label: "LUXURY",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  adr:      { icon: "📱", label: "ADR",     color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  agent:    { icon: "🤝", label: "ĐẠI LÝ",  color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  recharge: { icon: "💰", label: "NẠP",     color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

function maskName(name: string): string {
  if (!name) return "***";
  const n = name.replace(/^@/, "").trim();
  if (n.length <= 4) return n.charAt(0) + "***" + n.charAt(n.length - 1);
  return n.slice(0, 2) + "***" + n.slice(-2);
}

function detectType(serviceName: string, serviceId: string): string {
  if (serviceId === "recharge" || serviceName.toLowerCase().includes("nạp")) return "recharge";
  const s = serviceName.toLowerCase();
  if (s.includes("gold")) return "gold";
  if (s.includes("vip")) return "vip";
  if (s.includes("luxury") || s.includes("lux")) return "luxury";
  if (s.includes("android") || s.includes("adr")) return "adr";
  if (s.includes("đại lý") || s.includes("agent")) return "agent";
  return "vip";
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 15), 100);
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Orders paid trong 24h
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["paid", "completed", "processing"] },
        OR: [
          { paidAt: { gte: since24h } },
          { paidAt: null, createdAt: { gte: since24h } },
        ],
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        orderCode: true,
        serviceName: true,
        amount: true,
        discount: true,
        finalAmount: true,
        paidAt: true,
        createdAt: true,
        locketUsername: true,
        user: { select: { username: true, email: true, picture: true, name: true } },
      },
    });

    // Recharge transactions trong 24h — cả success và completed
    const txs = await prisma.transaction.findMany({
      where: {
        type: { in: ["recharge", "deposit", "admin_recharge"] },
        status: { in: ["success", "completed"] },
        createdAt: { gte: since24h },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { username: true, email: true, picture: true, name: true } },
      },
    });

    // Merge
    const merged = [
      ...orders.map((o) => {
        const name = o.locketUsername || o.user?.username || o.user?.name || o.user?.email?.split("@")[0] || "user";
        const type = detectType(o.serviceName, "");
        const discountPercent = o.amount > 0 && o.discount > 0
          ? Math.round((o.discount / o.amount) * 100)
          : 0;

        return {
          id: o.id,
          kind: "order" as const,
          name: maskName(name),
          initial: name.charAt(0).toUpperCase(),
          avatar: o.user?.picture || null,
          type,
          typeMeta: typeMeta[type],
          amount: o.finalAmount,
          originalAmount: o.amount,
          discount: o.discount,
          discountPercent,
          time: o.paidAt ? relativeTime(o.paidAt) : relativeTime(o.createdAt),
          timestamp: (o.paidAt || o.createdAt).getTime(),
        };
      }),
      ...txs.map((t) => {
        const name = t.user?.username || t.user?.name || t.user?.email?.split("@")[0] || "user";
        return {
          id: t.id,
          kind: "recharge" as const,
          name: maskName(name),
          initial: name.charAt(0).toUpperCase(),
          avatar: t.user?.picture || null,
          type: "recharge",
          typeMeta: typeMeta.recharge,
          amount: Math.abs(t.amount),
          originalAmount: Math.abs(t.amount),
          discount: 0,
          discountPercent: 0,
          time: relativeTime(t.createdAt),
          timestamp: t.createdAt.getTime(),
        };
      }),
    ];

    merged.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      transactions: merged.slice(0, limit),
    });
  } catch (error) {
    console.error("[recent-transactions]", error);
    return NextResponse.json({ success: false, transactions: [] }, { status: 500 });
  }
}
