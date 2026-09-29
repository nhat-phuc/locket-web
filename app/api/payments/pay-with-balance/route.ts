import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

    // 1. Lấy order + user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ success: false, message: "Đơn đã thanh toán" }, { status: 400 });
    }

    if (order.status === "cancelled" || order.status === "expired") {
      return NextResponse.json({ success: false, message: "Đơn đã bị hủy" }, { status: 400 });
    }

    // 2. Kiểm tra số dư
    if (order.user.balance < order.finalAmount) {
      return NextResponse.json({
        success: false,
        message: `Số dư không đủ. Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, hiện có ${order.user.balance.toLocaleString("vi-VN")}đ`,
        code: "INSUFFICIENT_BALANCE",
        currentBalance: order.user.balance,
        required: order.finalAmount,
      }, { status: 400 });
    }

    // 3. Transaction: trừ tiền + update order + log
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = order.user.balance;
      const balanceAfter = balanceBefore - order.finalAmount;

      // Trừ balance
      await tx.user.update({
        where: { id: order.userId },
        data: { balance: balanceAfter },
      });

      // Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentMethod: "balance",
        },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId: order.userId,
          type: "payment",
          amount: -order.finalAmount,
          balanceBefore,
          balanceAfter,
          status: "success",
          method: "balance",
          reference: order.orderCode,
          description: `Thanh toán đơn ${order.orderCode} - ${order.serviceName}`,
        },
      });

      return { balanceAfter };
    });

    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      redirect: `/thanh-toan/thanh-cong?orderId=${orderId}`,
      balanceAfter: result.balanceAfter,
    });
  } catch (error) {
    console.error("[pay-with-balance]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
