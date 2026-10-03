import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function getAdmin() {
  const session = await getSession();
  if (!session?.userId) return null;
  const u = await prisma.user.findUnique({ 
    where: { id: session.userId }, 
    select: { id: true, role: true } 
  });
  return u?.role === "admin" ? u : null;
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const { email, amount, type, reason } = await req.json();

    if (!email || !amount || !type) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
    }

    const change = type === "add" ? amount : -amount;
    const newBalance = user.balance + change;

    if (newBalance < 0) {
      return NextResponse.json({ success: false, message: "Số dư không đủ" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: type === "add" ? "admin_add" : "admin_subtract",
          amount: Math.abs(amount),
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "admin",
          description: reason || "Admin điều chỉnh",
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error("[admin/balance]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
