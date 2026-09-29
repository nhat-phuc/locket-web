import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/admin/users/{id}/recharge
// Body: { amount: number, note?: string }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { id } = await params;
    const { amount, note } = await req.json();

    const amt = Number(amount);
    if (!amt || amt === 0) {
      return NextResponse.json({ success: false, message: "Số tiền không hợp lệ" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const before = user.balance;
      const after = before + amt;

      await tx.user.update({
        where: { id },
        data: { balance: after },
      });

      await tx.transaction.create({
        data: {
          userId: id,
          type: amt > 0 ? "admin_credit" : "admin_debit",
          amount: amt,
          balanceBefore: before,
          balanceAfter: after,
          status: "success",
          method: "admin",
          reference: session.userId,
          description: note || `Admin ${amt > 0 ? "cộng" : "trừ"} ${Math.abs(amt).toLocaleString("vi-VN")}đ`,
        },
      });

      return { before, after };
    });

    // Thông báo cho user
    await prisma.notification.create({
      data: {
        userId: id,
        title: amt > 0 ? "💰 Tài khoản được cộng tiền" : "⚠️ Tài khoản bị trừ tiền",
        content: `${amt > 0 ? "+" : ""}${amt.toLocaleString("vi-VN")}đ. ${note || ""}`,
        type: amt > 0 ? "success" : "warning",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã ${amt > 0 ? "cộng" : "trừ"} ${Math.abs(amt).toLocaleString("vi-VN")}đ`,
      balance: result.after,
    });
  } catch (error) {
    console.error("[admin/recharge]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
