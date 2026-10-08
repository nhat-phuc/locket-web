import { prisma } from "@/lib/db";
import { REFERRAL_COMMISSION } from "@/lib/config";

/**
 * Xử lý hoa hồng khi đơn đầu tiên của người được mời thanh toán thành công.
 * Cộng 30.000đ vào balance (số dư chính, rút được).
 */
export async function processReferralCommission(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!order) return;
    if (order.status !== "paid" && order.status !== "completed") return;
    if (order.serviceName === "Nạp tiền vào ví") return;

    const referral = await prisma.referral.findUnique({
      where: { referredUserId: order.userId },
    });

    if (!referral) return;
    if (referral.commissionPaid) return;
    if (referral.firstOrderId) return;

    const commission = REFERRAL_COMMISSION;
    if (commission < 1000) return;

    const referrer = await prisma.user.findUnique({
      where: { id: referral.referrerId },
      select: { id: true, email: true, balance: true },
    });
    if (!referrer) return;

    const balanceBefore = referrer.balance;
    const balanceAfter = balanceBefore + commission;

    await prisma.$transaction([
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          commission,
          commissionPaid: true,
          firstOrderId: order.id,
          paidAt: new Date(),
        },
      }),

      prisma.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: commission },
          commission: { increment: commission },
        },
      }),

      prisma.transaction.create({
        data: {
          userId: referrer.id,
          type: "referral_bonus",
          amount: commission,
          balanceBefore,
          balanceAfter,
          status: "completed",
          method: "referral",
          description: `Hoa hồng giới thiệu từ ${order.user?.name || order.user?.email || "user"}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),

      prisma.notification.create({
        data: {
          userId: referrer.id,
          title: "🎁 Bạn nhận được 30.000đ hoa hồng!",
          content: `Bạn vừa nhận ${commission.toLocaleString("vi-VN")}đ từ người bạn giới thiệu.`,
          type: "success",
        },
      }),
    ]);

    console.log(`[Commission] ✅ Đã trả ${commission}đ cho ${referrer.email}`);
  } catch (error) {
    console.error("[processReferralCommission]", error);
  }
}
