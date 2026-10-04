import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Gửi thông báo Telegram cho admin
async function notifyAdmin(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[sepay] Chưa cấu hình Telegram");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[sepay] Telegram error:", e);
  }
}

export async function POST(req: Request) {
  try {
    // 1. Xác thực API Key
    const authHeader = req.headers.get("authorization") || "";
    const expectedKey = process.env.SEPAY_API_KEY;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Gửi thông báo Telegram cho admin
async function notifyAdmin(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[sepay] Chưa cấu hình Telegram");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[sepay] Telegram error:", e);
  }
}

export async function POST(req: Request) {
  try {
    // ═══ 1. VERIFY HMAC-SHA256 ═══
    const rawBody = await req.text();
    const signature = req.headers.get("x-sepay-signature");
    const timestamp = req.headers.get("x-sepay-timestamp");

    const secret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.SEPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[sepay-webhook] Chưa cấu hình PAYMENT_WEBHOOK_SECRET");
      return NextResponse.json(
        { success: false, message: "Server chưa cấu hình" },
        { status: 500 }
      );
    }

    if (!signature || !timestamp) {
      console.warn("[sepay-webhook] Thiếu signature hoặc timestamp");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Chống replay: timestamp không quá 5 phút
    const now = Math.floor(Date.now() / 1000);
    const ts = Number(timestamp);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      console.warn("[sepay-webhook] Timestamp không hợp lệ:", timestamp);
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");

    // So sánh constant-time để tránh timing attack
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      console.warn("[sepay-webhook] Chữ ký không hợp lệ");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ═══ 2. PARSE PAYLOAD ═══
    const payload = JSON.parse(rawBody);
    console.log("[sepay-webhook] Payload:", JSON.stringify(payload));

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

    // ═══ 3. CHỈ XỬ LÝ TIỀN VÀO ═══
    if (transferType !== "in") {
      return NextResponse.json({ success: true });
    }

    // ═══ 4. IDEMPOTENT — chống xử lý trùng ═══
    if (sepayId) {
      const existingTx = await prisma.transaction.findFirst({
        where: { reference: String(sepayId) },
      });
      if (existingTx) {
        console.log("[sepay-webhook] Đã xử lý:", sepayId);
        return NextResponse.json({ success: true });
      }
    }

    // ═══ 5. TÌM ORDER — THỬ NHIỀU CÁCH ═══
    let order = null;
    let matchedCode = code;

    // 5a. Tìm theo code SePay gửi
    if (code) {
      order = await prisma.order.findFirst({ where: { orderCode: code } });
    }

    // 5b. Tìm theo regex LKT-... trong content
    if (!order && content) {
      const match = content.match(/LKT-[A-Z]+-[A-Z0-9]+-[A-Z0-9]+/i);
      if (match) {
        matchedCode = match[0].toUpperCase();
        order = await prisma.order.findFirst({
          where: { orderCode: matchedCode },
        });
      }
    }

    // 5c. Tìm nội dung nạp tiền: <username>nap<amount><rand>
    if (!order && content) {
      const patterns = [/NPT[A-Z0-9]+/i, /[a-z0-9]+nap[0-9]+[a-z0-9]*/i];
      for (const p of patterns) {
        const m = content.match(p);
        if (m) {
          matchedCode = m[0];
          order = await prisma.order.findFirst({
            where: { orderCode: matchedCode },
          });
          if (order) break;
          order = await prisma.order.findFirst({
            where: {
              orderCode: { equals: matchedCode, mode: "insensitive" },
            },
          });
          if (order) break;
        }
      }
    }

    // 5d. Quét toàn bộ order pending
    if (!order && content) {
      const contentUpper = content.toUpperCase();
      const pendingOrders = await prisma.order.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, orderCode: true },
      });
      const found = pendingOrders.find((o) =>
        contentUpper.includes(o.orderCode.toUpperCase())
      );
      if (found) {
        order = await prisma.order.findUnique({ where: { id: found.id } });
        matchedCode = found.orderCode;
      }
    }

    // ═══ 6. KHÔNG KHỚP ĐƠN → GHI PENDING + BÁO TELEGRAM ═══
    if (!order) {
      console.warn("[sepay-webhook] Không khớp đơn:", { code, content });
      await prisma.pendingTransaction.create({
        data: {
          sepayId: sepayId ? String(sepayId) : null,
          amount: transferAmount || 0,
          content: content || null,
          referenceCode: referenceCode || null,
          bankAccount: accountNumber || null,
          gateway: gateway || null,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          reason: `Không khớp đơn. Code: ${code || "—"}, Content: ${content || "—"}`,
          status: "pending",
        },
      });

      await notifyAdmin(
        `⚠️ <b>Giao dịch KHÔNG KHỚP ĐƠN</b>\n\n` +
          `💰 Số tiền: <b>${(transferAmount || 0).toLocaleString("vi-VN")}đ</b>\n` +
          `🏦 Ngân hàng: ${gateway || "—"}\n` +
          `📝 Nội dung: <code>${content || "—"}</code>\n` +
          `🔖 Mã SePay: ${sepayId || "—"}\n\n` +
          `👉 Vào /admin/pending-transactions để xử lý`
      );

      return NextResponse.json({ success: true });
    }

    // ═══ 7. KIỂM TRA SỐ TIỀN ═══
    if (Number(transferAmount) < Number(order.finalAmount)) {
      console.warn("[sepay-webhook] Số tiền không khớp");
      await prisma.pendingTransaction.create({
        data: {
          sepayId: sepayId ? String(sepayId) : null,
          orderCode: order.orderCode,
          orderId: order.id,
          amount: transferAmount || 0,
          content: content || null,
          referenceCode: referenceCode || null,
          bankAccount: accountNumber || null,
          gateway: gateway || null,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          reason: `Số tiền không khớp. Đơn ${order.finalAmount.toLocaleString("vi-VN")}đ, nhận ${transferAmount.toLocaleString("vi-VN")}đ`,
          status: "pending",
        },
      });

      await notifyAdmin(
        `⚠️ <b>GIAO DỊCH THIẾU TIỀN</b>\n\n` +
          `📦 Đơn: <code>${order.orderCode}</code>\n` +
          `💰 Đơn yêu cầu: ${order.finalAmount.toLocaleString("vi-VN")}đ\n` +
          `💸 Thực nhận: ${(transferAmount || 0).toLocaleString("vi-VN")}đ\n` +
          `📝 Nội dung: <code>${content || "—"}</code>\n\n` +
          `👉 Vào /admin/pending-transactions để xử lý`
      );

      return NextResponse.json({ success: true });
    }

    // ═══ 8. CỘNG TIỀN + CẬP NHẬT ORDER ═══
    let userInfo = { name: "", balance: 0, newBalance: 0 };

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          paymentRef: String(sepayId || referenceCode || ""),
        },
      });

      const user = await tx.user.findUnique({ where: { id: order.userId } });
      if (user) {
        const newBalance = user.balance + Number(transferAmount);
        await tx.user.update({
          where: { id: user.id },
          data: { balance: newBalance },
        });

        await tx.transaction.create({
          data: {
            userId: user.id,
            type: "recharge",
            amount: Number(transferAmount),
            balanceBefore: user.balance,
            balanceAfter: newBalance,
            status: "completed",
            method: "bank_transfer",
            reference: String(sepayId || referenceCode || ""),
            description: `Nạp tiền tự động qua ${gateway || "ngân hàng"}`,
            orderId: order.id,
            completedAt: new Date(),
          },
        });

        userInfo = {
          name: user.name || user.username || user.email,
          balance: user.balance,
          newBalance,
        };
      }

      await tx.log.create({
        data: {
          action: "SEPAY_WEBHOOK_SUCCESS",
          detail: `Đơn ${order.orderCode} đã thanh toán ${transferAmount.toLocaleString("vi-VN")}đ → cộng ví ${userInfo.name}`,
        },
      });
    });

    // ═══ 9. BÁO TELEGRAM ADMIN ═══
    await notifyAdmin(
      `✅ <b>NẠP TIỀN THÀNH CÔNG</b>\n\n` +
        `👤 Khách: <b>${userInfo.name}</b>\n` +
        `📦 Đơn: <code>${order.orderCode}</code>\n` +
        `💰 Số tiền: <b>+${(transferAmount || 0).toLocaleString("vi-VN")}đ</b>\n` +
        `🏦 Ngân hàng: ${gateway || "—"}\n` +
        `💳 Số dư mới: ${userInfo.newBalance.toLocaleString("vi-VN")}đ\n` +
        `📝 Nội dung: <code>${content || "—"}</code>\n` +
        `🕒 ${new Date().toLocaleString("vi-VN")}`
    );

    console.log(
      "[sepay-webhook] ✅ Đã cộng tiền:",
      order.orderCode,
      transferAmount
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sepay-webhook] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SePay webhook endpoint (HMAC-SHA256). Use POST.",
    timestamp: new Date().toISOString(),
  });
}
