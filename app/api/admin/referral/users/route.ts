import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_SPINS_PER_DAY = 3;

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return u?.role === "admin";
}

function getTodayVN() {
  const now = new Date();
  const vnOffset = 7 * 60 * 60 * 1000;
  const vnNow = new Date(now.getTime() + vnOffset);
  vnNow.setUTCHours(0, 0, 0, 0);
  return new Date(vnNow.getTime() - vnOffset);
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    const onlyWithReferrals = url.searchParams.get("hasReferrals") === "true";
    const onlyWithReferrer = url.searchParams.get("hasReferrer") === "true";
    const onlyNoCode = url.searchParams.get("noCode") === "true";

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        picture: true,
        phone: true,
        role: true,
        balance: true,
        bonusBalance: true,
        isActive: true,
        isBanned: true,
        referralCode: true,
        codeChangedAt: true,
        referredBy: true,
        commission: true,
        totalReferrals: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    const todayStart = getTodayVN();
    const userIds = users.map((u) => u.id);
    const todaySpins = await prisma.spin.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, createdAt: { gte: todayStart } },
      _count: { userId: true },
    });
    const spinMap = new Map(todaySpins.map((s) => [s.userId, s._count.userId]));

    const referralCounts = await prisma.referral.groupBy({
      by: ["referrerId"],
      _count: { _all: true },
      _sum: { commission: true },
    });
    const countMap = new Map(
      referralCounts.map((r) => [
        r.referrerId,
        { count: r._count._all, commission: r._sum.commission || 0 },
      ])
    );

    const referrerIds = users.map((u) => u.referredBy).filter((id): id is string => !!id);
    const referrers = referrerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: referrerIds } },
          select: { id: true, username: true, email: true, referralCode: true },
        })
      : [];
    const referrerMap = new Map(referrers.map((r) => [r.id, r]));

    let result = users.map((u) => {
      const stats = countMap.get(u.id) || { count: 0, commission: 0 };
      const referrer = u.referredBy ? referrerMap.get(u.referredBy) : null;
      const usedSpins = spinMap.get(u.id) || 0;
      const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : 0;
      const isOnline = Date.now() - lastActive < 5 * 60 * 1000;

      return {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        picture: u.picture,
        phone: u.phone,
        balance: u.balance,
        bonusBalance: u.bonusBalance,
        role: u.role,
        isActive: u.isActive,
        isBanned: u.isBanned,
        isOnline,
        lastActiveAt: u.lastActiveAt,
        createdAt: u.createdAt,
        spinsUsed: usedSpins,
        spinsLeft: Math.max(0, MAX_SPINS_PER_DAY - usedSpins),
        maxSpins: MAX_SPINS_PER_DAY,
        referralCode: u.referralCode,
        codeChangedAt: u.codeChangedAt,
        totalReferrals: stats.count,
        commissionEarned: stats.commission,
        referredBy: referrer
          ? {
              username: referrer.username,
              email: referrer.email,
              referralCode: referrer.referralCode,
            }
          : null,
      };
    });

    if (q) {
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          (u.name || "").toLowerCase().includes(q) ||
          (u.referralCode || "").toLowerCase().includes(q)
      );
    }
    if (onlyWithReferrals) result = result.filter((u) => u.totalReferrals > 0);
    if (onlyWithReferrer) result = result.filter((u) => u.referredBy !== null);
    if (onlyNoCode) result = result.filter((u) => !u.referralCode);

    const stats = {
      totalUsers: result.length,
      usersWithCode: result.filter((u) => u.referralCode).length,
      usersWithReferrals: result.filter((u) => u.totalReferrals > 0).length,
      usersWithReferrer: result.filter((u) => u.referredBy).length,
      totalCommissionEarned: result.reduce((s, u) => s + u.commissionEarned, 0),
      totalReferralsCount: result.reduce((s, u) => s + u.totalReferrals, 0),
      admins: result.filter((u) => u.role === "admin").length,
      banned: result.filter((u) => u.isBanned).length,
      totalBalance: result.reduce((s, u) => s + (u.balance || 0), 0),
    };

    return NextResponse.json({ success: true, stats, users: result });
  } catch (error) {
    console.error("[admin/referral/users]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
