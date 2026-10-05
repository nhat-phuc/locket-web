import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const chatId = body.telegramId || body.chatId;
    const amount = Number(body.amount || 0);

    if (!chatId) return NextResponse.json({ success: false, message: "Thiếu telegramId" });
    if (!amount || amount < 10000) {
      return NextResponse.json({ success: false, message: "Số tiền tối thiểu 10.000đ" });
    }

    const user = await prisma.user.findFirst({ where: { telegramId: String(chatId) } });
    if (!user) return NextResponse.json({ success: false, message: "Chưa liên kết" });

    // Tìm hoặc tạo service nạp tiền
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
        amount,
        finalAmount: amount,
        status: "pending",
        paymentMethod: "bank_transfer",
        locketUsername: user.username,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Tạo QR URL
    const BANK_INFO = {
      bankId: process.env.NEXT_PUBLIC_BANK_ID || "BIDV",
      accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NO || "",
      accountName: process.env.NEXT_PUBLIC_ACCOUNT_NAME || process.env.NEXT_PUBLIC_BANK_NAME || "",
    };

    const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

    return NextResponse.json({
      success: true,
      order,
      orderCode,
      amount,
      qrUrl,
      bank: BANK_INFO.bankId,
      accountNumber: BANK_INFO.accountNumber,
      accountName: BANK_INFO.accountName,
    });
  } catch (error) {
    console.error("[telegram/create-recharge]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
