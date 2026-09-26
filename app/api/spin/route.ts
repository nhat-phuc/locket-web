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

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + (value || 0);

    const ops: any[] = [
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "bonus",
          amount: value || 0,
          balanceBefore,
          balanceAfter,
          status: "success",
          method: "lucky_wheel",
          description: `Vòng quay: ${label}`,
          completedAt: new Date(),
        },
      }),
    ];

    if (value > 0) {
      ops.push(
        prisma.user.update({
          where: { id: user.id },
          data: { balance: balanceAfter },
        })
      );
    }

    await prisma.$transaction(ops);

    return NextResponse.json({
      success: true,
      balance: balanceAfter,
      message: value > 0 ? `Chúc mừng! Bạn nhận ${value.toLocaleString("vi-VN")}đ` : "Chúc bạn may mắn lần sau!",
    });
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
