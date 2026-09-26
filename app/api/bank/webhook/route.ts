import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markOrderAsPaid } from "@/lib/payment";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Webhook đang chạy. Cấu hình URL này trong SePay.",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const expectedKey = process.env.SEPAY_API_KEY || "";
    const providedKey = authHeader.replace(/^Apikey\s+/i, "").trim();

    if (expectedKey && providedKey !== expectedKey) {
      console.warn("Webhook: Sai API key");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    const {
      transferType,
      transferAmount,
      content,
      code: orderCode,
      referenceCode,
    } = payload;

    if (transferType !== "in") {
      return NextResponse.json({ success: true, message: "Bỏ qua giao dịch ra" });
    }

    let order = null;

    if (orderCode) {
      order = await prisma.order.findFirst({
        where: { orderCode, status: "pending", paymentMethod: "bank_transfer" },
      });
    }

    if (!order && content) {
      const cleanContent = String(content).toUpperCase().trim();
      const match = cleanContent.match(/NAP\s+([A-Z0-9]+)/);
      const username = match ? match[1].toLowerCase() : cleanContent.replace(/^NAP\s+/, "").toLowerCase();
      order = await prisma.order.findFirst({
        where: {
          status: "pending",
          paymentMethod: "bank_transfer",
          paymentRef: { contains: username },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!order && transferAmount) {
      order = await prisma.order.findFirst({
        where: {
          status: "pending",
          paymentMethod: "bank_transfer",
          finalAmount: Number(transferAmount),
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!order) {
      console.warn("Webhook: Không tìm thấy order", { orderCode, content, transferAmount });
      return NextResponse.json({ success: true, message: "Không tìm thấy order" });
    }

    if (Number(transferAmount) < order.finalAmount) {
      return NextResponse.json({
        success: false,
        message: `Số tiền không đủ (nhận ${transferAmount}, cần ${order.finalAmount})`,
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: referenceCode || order.paymentRef },
    });

    const result = await markOrderAsPaid(order.id);

    console.log(`Webhook: Đã xử lý đơn ${order.orderCode} — +${transferAmount}đ`);

    return NextResponse.json({
      success: true,
      message: "Đã xử lý thanh toán",
      orderCode: order.orderCode,
      amount: transferAmount,
      balanceAfter: result.balanceAfter,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
