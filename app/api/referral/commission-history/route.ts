import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // Lấy tất cả referrals mà user là người giới thiệu
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            username: true,
            name: true,
            picture: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Tính tổng
    const totalCommission = referrals.reduce((sum, r) => sum + r.commission, 0);
    const paidCommission = referrals
      .filter((r) => r.commissionPaid)
      .reduce((sum, r) => sum + r.commission, 0);
    const pendingCommission = referrals
      .filter((r) => !r.commissionPaid && r.commission > 0)
      .reduce((sum, r) => sum + r.commission, 0);

    // Map data trả về
    const history = referrals.map((r) => ({
      id: r.id,
      username: r.referred.username,
      name: r.referred.name,
      avatar: r.referred.picture,
      joinedAt: r.referred.createdAt,
      commission: r.commission,
      paid: r.commissionPaid,
      createdAt: r.createdAt,
      paidAt: r.paidAt,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        total: totalCommission,
        paid: paidCommission,
        pending: pendingCommission,
        totalReferrals: referrals.length,
      },
      history,
    });
  } catch (error) {
    console.error("Commission history error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
