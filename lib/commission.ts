import { prisma } from "@/lib/db";
import { REFERRAL_COMMISSION_PERCENT } from "@/lib/config";

/**
 * Xử lý hoa hồng khi đơn hàng thanh toán thành công
 * Gọi hàm này sau khi order được update status = "paid"
 */
export async function processReferralCommission(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || order.status !== "paid") return;

    // Tìm record referral của user này
    const referral = await prisma.referral.findUnique({
      where: { referredUserId: order.userId },
    });

    if (!referral) return; // User không được giới thiệu
    if (referral.commissionPaid) return; // Đã trả hoa hồng rồi

    // Tính hoa hồng
    const commission = Math.floor(
      (order.finalAmount * REFERRAL_COMMISSION_PERCENT) / 100
    );

    if (commission < 1000) return; // Quá nhỏ

    // Cộng tiền cho người giới thiệu
    const referrer = await prisma.user.findUnique({
      where: { id: referral.referrerId },
    });

    if (!referrer) return;

    const newBalance = referrer.balance + commission;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: referrer.id },
        data: { balance: newBalance, commission: { increment: commission } },
      }),
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          commission,
          commissionPaid: true,
          firstOrderId: order.id,
          paidAt: new Date(),
        },
      }),
      prisma.transaction.create({
        data: {
          userId: referrer.id,
          type: "referral_commission",
          amount: commission,
          balanceBefore: referrer.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "referral",
          description: `Hoa hồng giới thiệu từ ${order.user?.name || order.user?.email}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),
    ]);

    console.log(`[Commission] Đã trả ${commission}đ cho ${referrer.email}`);
  } catch (error) {
    console.error("[processReferralCommission]", error);
  }
}
