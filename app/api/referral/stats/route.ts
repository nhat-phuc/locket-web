import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ensureReferralCode } from "@/lib/referral";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        referralCode: true,
        balance: true,
        bonusBalance: true,
      },
    });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const referralCode = await ensureReferralCode({
      id: user.id,
      username: user.username,
      referralCode: user.referralCode,
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: { id: true, username: true, name: true, picture: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReferrals = referrals.length;
    const totalCommission = referrals
      .filter((r) => r.commissionPaid)
      .reduce((s, r) => s + r.commission, 0);
    const pendingCommission = referrals
      .filter((r) => !r.commissionPaid && r.commission > 0)
      .reduce((s, r) => s + r.commission, 0);

    return NextResponse.json({
      success: true,
      referralCode,
      balance: user.balance,
      bonusBalance: user.bonusBalance,
      totalReferrals,
      totalCommission,
      pendingCommission,
      referrals: referrals.map((r) => ({
        id: r.id,
        username: r.referred.username,
        name: r.referred.name,
        avatar: r.referred.picture,
        commission: r.commission,
        commissionPaid: r.commissionPaid,
        createdAt: r.createdAt.toISOString(),
        paidAt: r.paidAt?.toISOString() ?? null,
      })),
    });
  } catch (e) {
    console.error("[referral/stats]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
