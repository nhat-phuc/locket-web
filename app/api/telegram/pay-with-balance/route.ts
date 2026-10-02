import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, chatId } = await req.json();

    const user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
    });

    if (!user) return NextResponse.json({ success: false, message: "Chưa đăng nhập" });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ success: false, message: "Đơn không tồn tại" });
    if (order.userId !== user.id) return NextResponse.json({ success: false, message: "Không có quyền" });
    if (order.status === "paid") return NextResponse.json({ success: false, message: "Đã thanh toán" });
    if (user.balance < order.finalAmount) return NextResponse.json({ success: false, message: "Số dư không đủ" });

    const newBalance = user.balance - order.finalAmount;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: new Date() },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "payment",
          amount: -order.finalAmount,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "completed",
          method: "balance",
          description: `Mua ${order.serviceName}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderCode: order.orderCode,
      amount: order.finalAmount,
      newBalance,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
