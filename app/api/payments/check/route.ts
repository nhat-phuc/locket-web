import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }

    if (order.status === "pending" && order.expiresAt && new Date() > order.expiresAt) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "expired" },
      });
      return NextResponse.json({ success: true, status: "expired" });
    }

    return NextResponse.json({
      success: true,
      status: order.status,
      orderCode: order.orderCode,
      finalAmount: order.finalAmount,
      paidAt: order.paidAt,
    });
  } catch (error) {
    console.error("Check payment error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
