import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { email, username, amount, content, orderCode } = await req.json();

    if (!amount || !content || !orderCode) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra đơn đã tồn tại
    const existing = await prisma.order.findFirst({ where: { orderCode } });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Đơn đã tồn tại",
        orderId: existing.id,
        order: existing,
      });
    }

    // Tạo đơn mới
    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: session.userId,
        serviceId: "recharge",
        serviceName: `Nạp tiền ${Number(amount).toLocaleString("vi-VN")}đ`,
        amount: Number(amount),
        discount: 0,
        finalAmount: Number(amount),
        status: "pending",
        paymentMethod: "bank_transfer",
        paymentRef: content,
        locketUsername: username || "recharge",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã tạo đơn nạp tiền",
      orderId: order.id,
      order,
    });
  } catch (error) {
    console.error("[recharge/create]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
