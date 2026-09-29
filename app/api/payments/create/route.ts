import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, paymentMethod } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ success: false, message: "Đơn đã thanh toán" }, { status: 400 });
    }

    const method = paymentMethod || "bank_transfer";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: method,
        status: "pending",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    if (method === "bank_transfer") {
      // Đọc từ .env — fallback nếu thiếu
      const BANK_INFO = {
        bank: process.env.NEXT_PUBLIC_BANK_NAME || "TPBANK",
        bankId: process.env.NEXT_PUBLIC_BANK_ID || "TPBANK",
        accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NO || "36886368888",
        accountName: process.env.NEXT_PUBLIC_ACCOUNT_NAME || "TRAN NHAT PHUC",
      };

      const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_INFO.accountNumber}&bank=${BANK_INFO.bankId}&amount=${order.finalAmount}&des=${encodeURIComponent(order.orderCode)}`;

      return NextResponse.json({
        success: true,
        method: "bank_transfer",
        orderId: order.id,
        orderCode: order.orderCode,
        amount: order.finalAmount,
        bank: BANK_INFO.bank,
        accountNumber: BANK_INFO.accountNumber,
        accountName: BANK_INFO.accountName,
        qrUrl,
        expiresAt: order.expiresAt,
      });
    }

    return NextResponse.json({ success: true, method });
  } catch (error) {
    console.error("[payments/create]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
