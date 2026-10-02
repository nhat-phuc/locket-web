import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn" }, { status: 404 });
    }

    if (order.userId !== session.userId) {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
    }

    if (order.status === "paid" || order.status === "completed") {
      return NextResponse.json({ success: true, message: "Đơn đã được xác nhận", order });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentRef: order.paymentRef || `USER_CONFIRM_${Date.now()}`,
        note: (order.note || "") + `\n[User xác nhận lúc ${new Date().toLocaleString("vi-VN")}]`,
      },
    });

    await prisma.log.create({
      data: {
        userId: session.userId,
        action: "USER_CONFIRM_PAYMENT",
        detail: `User xác nhận đã thanh toán đơn ${order.orderCode} (${order.finalAmount.toLocaleString("vi-VN")}đ)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đang xác nhận thanh toán. Hệ thống sẽ tự động cập nhật trong vài giây...",
      order: updated,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
