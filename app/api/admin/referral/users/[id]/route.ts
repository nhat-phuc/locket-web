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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        referralCode: true,
        codeChangedAt: true,
        referredBy: true,
        balance: true,
        bonusBalance: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
    }

    const invited = await prisma.referral.findMany({
      where: { referrerId: id },
      orderBy: { createdAt: "desc" },
      include: {
        referred: {
          select: { id: true, username: true, email: true, createdAt: true },
        },
      },
    });

    let referredBy = null;
    if (user.referredBy) {
      const ref = await prisma.referral.findUnique({
        where: { referredUserId: id },
        include: {
          referrer: {
            select: { id: true, username: true, email: true, referralCode: true },
          },
        },
      });
      if (ref) {
        referredBy = {
          username: ref.referrer.username,
          email: ref.referrer.email,
          referralCode: ref.referrer.referralCode,
          commission: ref.commission,
          commissionPaid: ref.commissionPaid,
          paidAt: ref.paidAt,
          createdAt: ref.createdAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        codeChangedAt: user.codeChangedAt,
        totalReferrals: invited.length,
        commission: invited.filter((r) => r.commissionPaid).reduce((s, r) => s + r.commission, 0),
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        role: user.role,
        joinedAt: user.createdAt,
      },
      invited: invited.map((r) => ({
        id: r.id,
        username: r.referred.username,
        email: r.referred.email,
        code: r.code,
        commission: r.commission,
        commissionPaid: r.commissionPaid,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
        joinedAt: r.referred.createdAt,
      })),
      referredBy,
    });
  } catch (error) {
    console.error("[admin/referral/users/[id]]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
