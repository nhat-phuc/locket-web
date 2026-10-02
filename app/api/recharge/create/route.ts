import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, amount, content, orderCode } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json(
        { success: false, message: "Số tiền tối thiểu 10.000đ" },
        { status: 400 }
      );
    }

    // Tìm user
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user && username) {
      user = await prisma.user.findUnique({ where: { username } });
    }
    if (!user) {
      const session = await getSession();
      if (session) {
        user = await prisma.user.findUnique({ where: { id: session.userId } });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    // Tạo Order (dùng serviceId rỗng hoặc lấy service đầu tiên)
    const firstService = await prisma.service.findFirst({
      where: { isActive: true },
    });

    if (!firstService) {
      return NextResponse.json(
        { success: false, message: "Chưa có dịch vụ nào trong hệ thống" },
        { status: 400 }
      );
    }

    const code = orderCode || `NPT${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderCode: code,
        userId: user.id,
        serviceId: firstService.id,
        serviceName: "Nạp tiền vào ví",
        amount: Number(amount),
        finalAmount: Number(amount),
        status: "pending",
        paymentMethod: "bank_transfer",
        note: content || "Nạp tiền tự động",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order: order,
    });
  } catch (error) {
    console.error("[recharge/create]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
