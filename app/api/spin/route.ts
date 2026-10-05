import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { label, value, type } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    const bonusBefore = user.bonusBalance;
    const bonusAfter = bonusBefore + (value || 0);
    const totalBefore = user.balance + user.bonusBalance;
    const totalAfter = totalBefore + (value || 0);

    const ops: any[] = [
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "bonus",
          amount: value || 0,
          balanceBefore: totalBefore,
          balanceAfter: totalAfter,
          status: "success",
          method: "lucky_wheel",
          description: `Vòng quay: ${label}`,
          completedAt: new Date(),
        },
      }),
    ];

    // ✅ QUAN TRỌNG: Cộng vào `bonusBalance`, KHÔNG cộng vào `balance`
    if (value > 0) {
      ops.push(
        prisma.user.update({
          where: { id: user.id },
          data: { bonusBalance: bonusAfter },
        })
      );
    }

    await prisma.$transaction(ops);

    return NextResponse.json({
      success: true,
      balance: user.balance,           // Tiền rút được (không đổi)
      bonusBalance: bonusAfter,        // Tiền vòng quay (tăng)
      total: totalAfter,
      message: value > 0 ? `Chúc mừng! Bạn nhận ${value.toLocaleString("vi-VN")}đ vào Ví Vòng Quay` : "Chúc bạn may mắn lần sau!",
    });
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
