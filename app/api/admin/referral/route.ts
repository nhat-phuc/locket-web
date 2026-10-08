import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return u?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const allReferrals = await prisma.referral.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        referrer: { select: { username: true, email: true } },
        referred: { select: { username: true, email: true } },
      },
    });

    const totalReferrals = allReferrals.length;
    const totalCommission = allReferrals
      .filter((r) => r.commissionPaid)
      .reduce((s, r) => s + r.commission, 0);
    const pendingCommission = allReferrals
      .filter((r) => !r.commissionPaid)
      .reduce((s, r) => s + r.commission, 0);

    const referrerMap = new Map<string, { username: string; email: string; count: number; commission: number }>();
    allReferrals.forEach((r) => {
      const key = r.referrerId;
      const cur = referrerMap.get(key) || {
        username: r.referrer.username,
        email: r.referrer.email,
        count: 0,
        commission: 0,
      };
      cur.count++;
      if (r.commissionPaid) cur.commission += r.commission;
      referrerMap.set(key, cur);
    });
    const topReferrers = Array.from(referrerMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      stats: {
        totalReferrals,
        totalCommission,
        pendingCommission,
        activeReferrers: referrerMap.size,
      },
      topReferrers,
      referrals: allReferrals.map((r) => ({
        id: r.id,
        referrer: r.referrer.username || r.referrer.email,
        referred: r.referred.username || r.referred.email,
        code: r.code,
        commission: r.commission,
        commissionPaid: r.commissionPaid,
        createdAt: r.createdAt,
        paidAt: r.paidAt,
      })),
    });
  } catch (error) {
    console.error("[admin/referral]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
