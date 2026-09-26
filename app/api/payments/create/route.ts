import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateQRUrl, BANK_CONFIG } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }

    // Nội dung chuyển khoản = mã đơn
    const content = order.orderCode;

    // Tạo QR URL
    const qrUrl = generateQRUrl(order.finalAmount, content);

    return NextResponse.json({
      success: true,
      qrUrl,
      bank: BANK_CONFIG,
      content,
      amount: order.finalAmount,
    });
  } catch (error: any) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
