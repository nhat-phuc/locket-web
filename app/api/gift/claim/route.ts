import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const GIFT_AMOUNT = 5000;

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    if (user.giftClaimed) {
      return NextResponse.json({ success: false, message: "Bạn đã nhận quà rồi 🎁" }, { status: 400 });
    }

    const newBalance = user.balance + GIFT_AMOUNT;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: newBalance, giftClaimed: true },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "gift",
          amount: GIFT_AMOUNT,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "system",
          description: "Quà tặng chào mừng",
          completedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "🎁 Nhận quà thành công",
          content: `Bạn đã nhận ${GIFT_AMOUNT.toLocaleString("vi-VN")}đ vào số dư.`,
          type: "success",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Nhận thành công ${GIFT_AMOUNT.toLocaleString("vi-VN")}đ!`,
      balance: newBalance,
      amount: GIFT_AMOUNT,
    });
  } catch (e) {
    console.error("[gift/claim]", e);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
