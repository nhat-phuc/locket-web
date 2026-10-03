import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processReferralCommission } from "@/lib/commission";
import { deductPayment, getTotalBalance } from "@/lib/balance";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

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

    // ✅ Check TỔNG tiền (balance + bonusBalance)
    const totalBalance = getTotalBalance(order.user);
    if (totalBalance < order.finalAmount) {
      return NextResponse.json({
        success: false,
        message: `Số dư không đủ. Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, hiện có ${totalBalance.toLocaleString("vi-VN")}đ`,
        code: "INSUFFICIENT_BALANCE",
        currentBalance: totalBalance,
        required: order.finalAmount,
      }, { status: 400 });
    }

    // ✅ Transaction với deductPayment (trừ bonus trước, balance sau)
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = order.user.balance;
      const bonusBefore = order.user.bonusBalance;

      const { fromBonus, fromBalance, newBonus, newBalance } = await deductPayment(
        tx,
        order.userId,
        order.finalAmount
      );

      // Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentMethod: "balance",
        },
      });

      // Log transaction — ghi rõ đã trừ bao nhiêu từ bonus, bao nhiêu từ balance
      await tx.transaction.create({
        data: {
          userId: order.userId,
          type: "payment",
          amount: -order.finalAmount,
          balanceBefore,
          balanceAfter: newBalance,
          status: "success",
          method: "balance",
          reference: order.orderCode,
          description: `Thanh toán đơn ${order.orderCode} - ${order.serviceName}` +
            (fromBonus > 0 ? ` (dùng ${fromBonus.toLocaleString("vi-VN")}đ tiền thưởng)` : ""),
        },
      });

      return { newBalance, newBonus, fromBonus, fromBalance };
    });

    // ✅ Trả hoa hồng cho người giới thiệu
    await processReferralCommission(orderId);

    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      redirect: `/thanh-toan/thanh-cong?orderId=${orderId}`,
      balanceAfter: result.newBalance,
      bonusAfter: result.newBonus,
      usedBonus: result.fromBonus,
      usedBalance: result.fromBalance,
    });
  } catch (error) {
    console.error("[pay-with-balance]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
