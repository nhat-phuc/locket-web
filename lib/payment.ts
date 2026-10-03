import { prisma } from "@/lib/db";

export async function markOrderAsPaid(orderId: string) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) throw new Error("Order không tồn tại");
    if (order.status === "paid" || order.status === "completed") {
      return { success: true, message: "Đơn đã được xử lý trước đó", order };
    }

    const isRecharge = order.serviceId === "recharge";
    const user = order.user;
    const balanceBefore = user.balance;
    const amount = order.finalAmount;
    const balanceAfter = isRecharge ? balanceBefore + amount : balanceBefore;

    await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paidAt: new Date() },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: order.userId,
        type: isRecharge ? "recharge" : "purchase",
        amount: isRecharge ? amount : -amount,
        balanceBefore,
        balanceAfter,
        status: "success",
        method: order.paymentMethod || "bank_transfer",
        reference: order.paymentRef || order.orderCode,
        description: isRecharge
          ? `Nạp tiền qua ${order.paymentMethod === "bank_transfer" ? "chuyển khoản" : order.paymentMethod}`
          : `Mua ${order.serviceName}`,
        orderId: order.id,
        completedAt: new Date(),
      },
    });

    if (isRecharge) {
      await tx.user.update({
        where: { id: order.userId },
        data: { balance: balanceAfter },
      });
    }

    if (!isRecharge) {
      await tx.service.update({
        where: { id: order.serviceId ?? undefined },
        data: { sold: { increment: 1 } },
      }).catch(() => {});
    }

    return { success: true, order, transaction, balanceAfter };
  });
}

// ═══════════════════════════════════════════
// BANK CONFIG + QR GENERATOR
// ═══════════════════════════════════════════

export const BANK_CONFIG = {
  bankId: "TPBank",
  bankName: "TPBank",
  accountNo: "36886368888",
  accountName: "TRAN NHAT PHUC",
  template: "compact",
};

/**
 * Tạo URL VietQR từ thông tin ngân hàng + số tiền + nội dung.
 */
export function generateQRUrl(
  amount: number,
  content: string,
  bankId?: string,
  accountNo?: string,
  accountName?: string,
  template?: string
): string {
  const bank = bankId || BANK_CONFIG.bankId;
  const acc = accountNo || BANK_CONFIG.accountNo;
  const name = accountName || BANK_CONFIG.accountName;
  const tpl = template || BANK_CONFIG.template;

  return (
    `https://img.vietqr.io/image/${bank}-${acc}-${tpl}.png` +
    `?amount=${amount}` +
    `&addInfo=${encodeURIComponent(content)}` +
    `&accountName=${encodeURIComponent(name)}`
  );
}
