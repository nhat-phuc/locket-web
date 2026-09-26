import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SEPAY_API_KEY = process.env.SEPAY_API_KEY || "";

export async function POST(req: Request) {
  try {
    // Verify API key
    const authHeader = req.headers.get("authorization");
    if (SEPAY_API_KEY && authHeader !== `Apikey ${SEPAY_API_KEY}`) {
      console.log("❌ Webhook: Unauthorized");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 SePay webhook body:", JSON.stringify(body));

    const { content, transferAmount, referenceCode, id } = body;

    if (!content || !transferAmount) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Tìm đơn hàng khớp với nội dung chuyển khoản
    const order = await prisma.order.findFirst({
      where: {
        paymentRef: { contains: content.trim() },
        status: "pending",
        paymentMethod: "bank_transfer",
      },
    });

    if (!order) {
      console.log("⚠️ Không tìm thấy đơn khớp với nội dung:", content);
      return NextResponse.json({ success: true, message: "Không tìm thấy đơn khớp" });
    }

    if (transferAmount < order.finalAmount) {
      console.log("⚠️ Số tiền không đủ:", transferAmount, "<", order.finalAmount);
      return NextResponse.json({ success: false, message: "Số tiền không đủ" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User không tồn tại" }, { status: 404 });
    }

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + transferAmount;

    // ✅ CỘNG TIỀN VÀO BALANCE
    await prisma.$transaction([
      // 1. Cập nhật đơn → paid
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentRef: referenceCode || content,
        },
      }),

      // 2. Cập nhật user balance
      prisma.user.update({
        where: { id: user.id },
        data: { balance: balanceAfter },
      }),

      // 3. Tạo transaction log
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "deposit",
          amount: transferAmount,
          balanceBefore,
          balanceAfter,
          status: "success",
          method: "bank_transfer",
          reference: referenceCode || id || content,
          description: `Nạp tiền thành công - Đơn ${order.orderCode}`,
          orderId: order.id,
          completedAt: new Date(),
        },
      }),

      // 4. Tạo thông báo
      prisma.notification.create({
        data: {
          userId: user.id,
          title: "Nạp tiền thành công",
          content: `Đơn ${order.orderCode} đã được xác nhận. Số dư mới: ${balanceAfter.toLocaleString("vi-VN")}đ`,
          type: "success",
        },
      }),
    ]);

    console.log("✅ Đã cộng tiền:", transferAmount, "cho user", user.email);
    return NextResponse.json({ success: true, message: "Đã xử lý thanh toán" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "SePay webhook endpoint. Use POST." });
}
