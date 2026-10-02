import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const amount = Number(body.amount);
    const note = String(body.note || "").trim() || "Admin cộng tiền";
    const type = body.type === "subtract" ? "subtract" : "add";

    // Validate
    if (!amount || amount <= 0 || isNaN(amount)) {
      return NextResponse.json(
        { success: false, message: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    // Tìm user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    const finalAmount = type === "subtract" ? -amount : amount;
    const newBalance = user.balance + finalAmount;

    if (newBalance < 0) {
      return NextResponse.json(
        { success: false, message: "Số dư không đủ để trừ" },
        { status: 400 }
      );
    }

    // Transaction: cập nhật balance + tạo Transaction + Log
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { balance: newBalance },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: id,
          type: type === "add" ? "admin_recharge" : "admin_deduct",
          amount: Math.abs(amount),
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "admin",
          description: note,
          completedAt: new Date(),
        },
      });

      const log = await tx.log.create({
        data: {
          userId: auth.session!.userId,
          action: type === "add" ? "ADMIN_RECHARGE" : "ADMIN_DEDUCT",
          detail: `${type === "add" ? "Cộng" : "Trừ"} ${Math.abs(amount).toLocaleString("vi-VN")}đ cho user ${user.username} (${user.email}). Lý do: ${note}`,
        },
      });

      return { updatedUser, transaction, log };
    });

    return NextResponse.json({
      success: true,
      message: `${type === "add" ? "Cộng" : "Trừ"} ${Math.abs(amount).toLocaleString("vi-VN")}đ thành công. Số dư mới: ${newBalance.toLocaleString("vi-VN")}đ`,
      user: {
        id: result.updatedUser.id,
        balance: result.updatedUser.balance,
      },
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Admin recharge error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
