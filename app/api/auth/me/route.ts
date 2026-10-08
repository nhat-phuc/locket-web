import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        picture: true,
        balance: true,
        bonusBalance: true,
        role: true,
        referralCode: true,
        commission: true,
        totalReferrals: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    // Tính totalReferrals + commission từ bảng Referral (đảm bảo chính xác)
    const referralAgg = await prisma.referral.aggregate({
      where: { referrerId: user.id },
      _count: { _all: true },
      _sum: { commission: true },
    });

    // Override counters từ User bằng giá trị thật từ Referral
    (user as any).totalReferrals = referralAgg._count._all;
    (user as any).commission = referralAgg._sum.commission || 0;

    // Lazy-generate referralCode nếu user chưa có
    if (!user.referralCode) {
      const newCode = (
        user.id.slice(0, 6) + Math.random().toString(36).slice(2, 6)
      )
        .toUpperCase()
        .slice(0, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: newCode },
      });
      user.referralCode = newCode;
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
