import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    let user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, referralCode: true, balance: true },
    });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    // Nếu chưa có code → sinh luôn
    if (!user.referralCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
      user.referralCode = code;
    }

    const invited = await prisma.user.findMany({
      where: { referredBy: user.id },
      select: { id: true, username: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const totalBonus = await prisma.transaction.aggregate({
      where: { userId: user.id, type: "referral_bonus", status: "completed" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      balance: user.balance,
      totalInvited: invited.length,
      totalBonus: totalBonus._sum.amount || 0,
      invited,
    });
  } catch (e) {
    console.error("[referral/stats]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
