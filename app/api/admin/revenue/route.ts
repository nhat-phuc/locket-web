import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({ 
    where: { id: session.userId }, 
    select: { role: true } 
  });
  return u?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const days: { date: string; amount: number; count: number }[] = [];
    const now = new Date();
    let total = 0;

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
      total += amount;
    }

    return NextResponse.json({ success: true, days, total });
  } catch (error) {
    console.error("[admin/revenue]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
