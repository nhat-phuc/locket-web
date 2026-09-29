import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// SePay webhook handler
// Xử lý mọi trường hợp: đúng/thiếu/sai nội dung/không match
// Trả { success: true } để SePay không retry

export async function POST(req: Request) {
  try {
    // 1. Xác thực API Key
    const authHeader = req.headers.get("authorization") || "";
    const expectedKey = process.env.SEPAY_API_KEY;

    if (!expectedKey) {
      console.error("[sepay-webhook] SEPAY_API_KEY chưa cấu hình");
      return NextResponse.json({ success: false, message: "Server chưa cấu hình" }, { status: 500 });
    }

    const expected = `Apikey ${expectedKey}`;
    if (authHeader !== expected) {
      console.warn("[sepay-webhook] Xác thực thất bại");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse payload
    const payload = await req.json();
    console.log("[sepay-webhook] Payload:", JSON.stringify(payload, null, 2));

    const {
      id: sepayId,
      transferType,
      transferAmount,
      code,
      content,
      referenceCode,
      accountNumber,
      gateway,
      transactionDate,
    } = payload;

    // 3. Chỉ xử lý tiền vào
    if (transferType !== "in") {
      console.log("[sepay-webhook] Bỏ qua tiền ra");
      return NextResponse.json({ success: true });
    }

    // 4. Idempotent — check sepayId đã xử lý chưa
    if (sepayId) {
      const existing = await prisma.pendingTransaction.findUnique({
        where: { sepayId: String(sepayId) },
      });
      if (existing) {
        console.log("[sepay-webhook] Đã xử lý:", sepayId);
        return NextResponse.json({ success: true });
      }

      const existingTx = await prisma.transaction.findFirst({
        where: { reference: String(sepayId) },
      });
      if (existingTx) {
        console.log("[sepay-webhook] Đã có transaction:", sepayId);
        return NextResponse.json({ success: true });
      }
    }

    // 5. Tìm order từ code hoặc content
    let order = null;
    let matchedCode = code;

    // 5a. Thử match theo code trước
    if (code) {
      order = await prisma.order.findFirst({ where: { orderCode: code } });
    }

    // 5b. Nếu không có code, parse từ content (VD: "LKT-GOLD-1T-A3F9 chuyen tien")
    if (!order && content) {
      const match = content.match(/LKT-[A-Z]+-[A-Z0-9]+-[A-Z0-9]+/i);
      if (match) {
        matchedCode = match[0].toUpperCase();
        order = await prisma.order.findFirst({
          where: { orderCode: matchedCode },
        });
      }
    }

    // 5c. Fallback — thử tìm bất kỳ orderCode nào trong content
    if (!order && content) {
      const allOrders = await prisma.order.findMany({
        where: { status: "pending" },
        select: { orderCode: true },
        take: 200,
      });
      const found = allOrders.find((o) =>
        content.toUpperCase().includes(o.orderCode.toUpperCase())
      );
      if (found) {
        order = await prisma.order.findUnique({ where: { orderCode: found.orderCode } });
      }
    }

    // ============ TRƯỜNG HỢP A: KHÔNG MATCH ORDER ============
    if (!order) {
      console.warn("[sepay-webhook] Orphan transaction:", { code, content });

      await prisma.pendingTransaction.create({
        data: {
          sepayId: sepayId ? String(sepayId) : null,
          orderCode: matchedCode || code || null,
          amount: transferAmount,
          content: content || null,
          referenceCode: referenceCode || null,
          bankAccount: accountNumber || null,
          gateway: gateway || null,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          reason: "orphan",
          status: "pending",
        },
      });

      // Thông báo admin
      await createAdminNotification(
        "⚠️ Giao dịch không khớp đơn",
        `CK ${transferAmount.toLocaleString("vi-VN")}đ — Nội dung: "${content || "trống"}"`
      );

      return NextResponse.json({ success: true });
    }

    // ============ TRƯỜNG HỢP B: ORDER ĐÃ PAID ============
    if (order.status === "paid") {
      console.warn("[sepay-webhook] Đơn đã thanh toán:", order.orderCode);

      await prisma.pendingTransaction.create({
        data: {
          sepayId: sepayId ? String(sepayId) : null,
          orderCode: order.orderCode,
          orderId: order.id,
          amount: transferAmount,
          content: content || null,
          referenceCode: referenceCode || null,
          bankAccount: accountNumber || null,
          gateway: gateway || null,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          reason: "overpaid",
          status: "pending",
          note: "Đơn đã thanh toán trước đó",
        },
      });

      await createAdminNotification(
        "⚠️ Chuyển khoản trùng",
        `Đơn ${order.orderCode} đã paid — nhận thêm ${transferAmount.toLocaleString("vi-VN")}đ`
      );

      return NextResponse.json({ success: true });
    }

    // ============ TRƯỜNG HỢP C: THIẾU TIỀN ============
    if (transferAmount < order.finalAmount) {
      console.warn("[sepay-webhook] Thiếu tiền:", {
        orderCode: order.orderCode,
        need: order.finalAmount,
        got: transferAmount,
      });

      await prisma.pendingTransaction.create({
        data: {
          sepayId: sepayId ? String(sepayId) : null,
          orderCode: order.orderCode,
          orderId: order.id,
          amount: transferAmount,
          content: content || null,
          referenceCode: referenceCode || null,
          bankAccount: accountNumber || null,
          gateway: gateway || null,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          reason: "insufficient",
          status: "pending",
          note: `Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, nhận ${transferAmount.toLocaleString("vi-VN")}đ`,
        },
      });

      await createAdminNotification(
        "⚠️ Chuyển khoản thiếu tiền",
        `Đơn ${order.orderCode} — Cần ${order.finalAmount.toLocaleString("vi-VN")}đ, nhận ${transferAmount.toLocaleString("vi-VN")}đ`
      );

      return NextResponse.json({ success: true });
    }

    // ============ TRƯỜNG HỢP D: ĐÚNG — MARK PAID ============
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentMethod: "bank_transfer",
          paymentRef: referenceCode || String(sepayId),
        },
      });

      await tx.transaction.create({
        data: {
          userId: order.userId,
          type: "payment",
          amount: transferAmount,
          balanceBefore: 0,
          balanceAfter: 0,
          status: "success",
          method: "bank_transfer",
          reference: String(sepayId),
          description: `Thanh toán CK — Đơn ${order.orderCode}`,
        },
      });
    });

    // Thông báo user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "✅ Thanh toán thành công",
        content: `Đơn ${order.orderCode} đã được xác nhận. Chúng tôi sẽ xử lý trong 5-15 phút.`,
        type: "success",
      },
    });

    console.log("[sepay-webhook] ✓ Mark paid:", order.orderCode);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sepay-webhook] Error:", error);
    // Luôn trả success để SePay không retry vô hạn
    return NextResponse.json({ success: true });
  }
}

// Tạo thông báo cho admin (userId = null → broadcast cho role admin)
async function createAdminNotification(title: string, content: string) {
  try {
    // Tìm user có role admin
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title,
        content,
        type: "warning",
      })),
    });
  } catch (e) {
    console.error("[createAdminNotification]", e);
  }
}
