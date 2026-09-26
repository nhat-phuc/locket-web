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

    if (!email || !amount || !content || !orderCode) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    const existing = await prisma.order.findFirst({ where: { orderCode } });
    if (existing) {
      return NextResponse.json({ success: true, message: "Đơn đã tồn tại" });
    }

    await prisma.order.create({
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

    return NextResponse.json({ success: true, message: "Đã tạo đơn nạp tiền" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
