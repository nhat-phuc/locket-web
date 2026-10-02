import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    const user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
    });

    if (!user) return NextResponse.json({ success: false, message: "Chưa đăng nhập" });

    let rechargeService = await prisma.service.findFirst({ where: { slug: "nap-tien" } });
    if (!rechargeService) {
      rechargeService = await prisma.service.create({
        data: {
          name: "Nạp tiền vào ví",
          slug: "nap-tien",
          description: "Nạp tiền",
          type: "recharge",
          platform: "wallet",
          price: 50000,
          features: "Nạp tiền",
        },
      });
    }

    const orderCode = `NPT${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        serviceId: rechargeService.id,
        serviceName: "Nạp tiền",
        amount: 50000,
        finalAmount: 50000,
        status: "pending",
        paymentMethod: "bank_transfer",
        locketUsername: user.username,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
