import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { telegramId, amount } = await req.json();

    if (!telegramId || !amount) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    if (Number(amount) < 10000) {
      return NextResponse.json({ success: false, message: "Số tiền tối thiểu 10.000đ" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Chưa liên kết. Gõ /link MÃ_CODE trước." },
        { status: 404 }
      );
    }

    // ═══ Ưu tiên Service "Nạp tiền" ═══
    let service = await prisma.service.findFirst({
      where: { slug: "nap-tien", isActive: true },
    });

    // Fallback: service bất kỳ
    if (!service) {
      service = await prisma.service.findFirst({
        where: { isActive: true },
      });
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Chưa có dịch vụ nào. Liên hệ admin." },
        { status: 400 }
      );
    }

    const orderCode = `NPT${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        serviceId: service.id,
        serviceName: "Nạp tiền vào ví",
        amount: Number(amount),
        finalAmount: Number(amount),
        status: "pending",
        paymentMethod: "bank_transfer",
        note: `Nạp tiền qua Telegram`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const BANK = {
      bankId: process.env.NEXT_PUBLIC_BANK_ID || "TPBANK",
      accountNo: process.env.NEXT_PUBLIC_ACCOUNT_NO || "36886368888",
      accountName: process.env.NEXT_PUBLIC_ACCOUNT_NAME || "TRAN NHAT PHUC",
      bankName: process.env.NEXT_PUBLIC_BANK_NAME || "TPBank",
    };

    const qrUrl = `https://img.vietqr.io/image/${BANK.bankId}-${BANK.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(BANK.accountName)}`;

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        orderCode: order.orderCode,
        amount: order.finalAmount,
      },
      bank: BANK,
      qrUrl,
    });
  } catch (error) {
    console.error("[telegram/recharge]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
