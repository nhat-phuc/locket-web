import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json({ status: "idle" });
    }

    const order = await prisma.order.findFirst({
      where: { orderCode: code, paymentMethod: "bank_transfer" },
    });

    if (!order) {
      return NextResponse.json({ status: "idle" });
    }

    // Đơn hết hạn → tự huỷ
    if (
      order.status === "pending" &&
      order.expiresAt &&
      new Date() > order.expiresAt
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ status: "expired" });
    }

    // Đơn đã paid (do webhook xử lý) → trả balance mới
    if (order.status === "paid" || order.status === "completed") {
      const user = await prisma.user.findUnique({ where: { email } });
      return NextResponse.json({
        status: "paid",
        balance: user?.balance || 0,
      });
    }

    // ⚠️ QUAN TRỌNG: Nếu đơn vẫn pending nhưng webhook không chạy,
    // kiểm tra xem đã có transaction deposit nào chưa
    if (order.status === "pending") {
      const existingTx = await prisma.transaction.findFirst({
        where: {
          orderId: order.id,
          type: "deposit",
          status: "success",
        },
      });

      // Nếu có transaction rồi → đơn đã paid (webhook chạy nhưng chưa update order)
      if (existingTx) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "paid", paidAt: existingTx.createdAt },
        });
        const user = await prisma.user.findUnique({ where: { email } });
        return NextResponse.json({
          status: "paid",
          balance: user?.balance || 0,
        });
      }
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "idle" });
  }
}
