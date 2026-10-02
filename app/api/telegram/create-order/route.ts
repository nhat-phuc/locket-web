import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { chatId, serviceId, locketUsername } = await req.json();

    const user = await prisma.user.findFirst({
      where: { telegramId: String(chatId) },
    });

    if (!user) return NextResponse.json({ success: false, message: "Chưa liên kết" });

    const service = await prisma.service.findFirst({
      where: {
        OR: [{ slug: serviceId }, { id: serviceId }],
        isActive: true,
      },
    });

    if (!service) return NextResponse.json({ success: false, message: "Gói không tồn tại" });

    const orderCode = `LKT-${service.type.toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        amount: service.price,
        finalAmount: service.price,
        status: "pending",
        paymentMethod: "bank_transfer",
        locketUsername,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
