import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export const REFERRAL_COMMISSION = 30000; // 30.000đ

/**
 * Sinh mã GT unique từ username/id.
 */
export async function generateUniqueReferralCode(
  seed: string,
  maxRetries = 10
): Promise<string> {
  const clean = (seed || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase() || "USER";

  for (let i = 0; i < maxRetries; i++) {
    const rand = randomBytes(2).toString("hex").toUpperCase();
    const code = `${clean}${rand}`.slice(0, 12);

    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!exists) return code;
  }

  return `REF${randomBytes(5).toString("hex").toUpperCase()}`.slice(0, 12);
}

/**
 * Đảm bảo user có mã GT.
 */
export async function ensureReferralCode(user: {
  id: string;
  username: string | null;
  referralCode: string | null;
}): Promise<string> {
  if (user.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode(user.username || user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { referralCode: code },
  });

  return code;
}

/**
 * Xử lý hoa hồng khi đơn đầu tiên của người được mời paid.
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

    const referrer = await prisma.user.findUnique({
      where: { id: referral.referrerId },
      select: { id: true, email: true, balance: true, bonusBalance: true },
    });
    if (!referrer) return;

    const balanceBefore = referrer.balance;
    const balanceAfter = balanceBefore + REFERRAL_COMMISSION;

    await prisma.$transaction([
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          commission: REFERRAL_COMMISSION,
          commissionPaid: true,
          firstOrderId: order.id,
          paidAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: REFERRAL_COMMISSION },
          commission: { increment: REFERRAL_COMMISSION },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: referrer.id,
          type: "referral_bonus",
          amount: REFERRAL_COMMISSION,
          balanceBefore,
          balanceAfter,
          status: "completed",
          method: "referral",
          description: `Hoa hồng GT từ ${order.user?.name || order.user?.email || "user"}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),
      prisma.notification.create({
        data: {
          userId: referrer.id,
          title: "🎁 Bạn nhận 30.000đ hoa hồng!",
          content: `Bạn vừa nhận ${REFERRAL_COMMISSION.toLocaleString("vi-VN")}đ từ người bạn giới thiệu.`,
          type: "success",
        },
      }),
    ]);

    console.log(`[Commission] ✅ Trả ${REFERRAL_COMMISSION}đ cho ${referrer.email}`);
  } catch (error) {
    console.error("[processReferralCommission]", error);
  }
}
