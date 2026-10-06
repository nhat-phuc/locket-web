import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function notifyAdmin(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
    console.warn("[withdrawal] Chưa cấu hình Telegram admin");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[withdrawal] Telegram error:", e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const { amount, bankName, bankAccount, accountName } = await req.json();

    if (!amount || !bankName || !bankAccount || !accountName) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    if (Number(amount) < 50000) {
      return NextResponse.json({ success: false, message: "Số tiền rút tối thiểu 50.000đ" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
    }

    if (user.balance < Number(amount)) {
      return NextResponse.json(
        { success: false, message: `Số dư không đủ. Hiện có: ${user.balance.toLocaleString("vi-VN")}đ` },
        { status: 400 }
      );
    }

    const newBalance = user.balance - Number(amount);

    // ═══ Tạo yêu cầu + trừ tiền ═══
    const withdrawal = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "withdraw",
          amount: Number(amount),
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          status: "pending",
          method: "bank_transfer",
          description: `Yêu cầu rút tiền về ${bankName} - ${bankAccount}`,
        },
      });

      return await tx.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: Number(amount),
          bankName,
          bankAccount,
          accountName,
          status: "pending",
        },
      });
    });

    // ═══ Gửi Telegram cho admin ═══
    const userName = user.name || user.username || user.email;
    const shortId = withdrawal.id.slice(-6).toUpperCase();

    await notifyAdmin(
      `💸 <b>YÊU CẦU RÚT TIỀN MỚI</b>\n\n` +
      `🆔 Mã: <code>WD-${shortId}</code>\n` +
      `👤 User: <b>${userName}</b>\n` +
      `📧 Email: <code>${user.email}</code>\n` +
      `${user.phone ? `📱 SĐT: <code>${user.phone}</code>\n` : ""}` +
      `\n💰 <b>Số tiền: ${Number(amount).toLocaleString("vi-VN")}đ</b>\n\n` +
      `🏦 <b>Thông tin nhận tiền:</b>\n` +
      `• Ngân hàng: <b>${bankName}</b>\n` +
      `• Số TK: <code>${bankAccount}</code>\n` +
      `• Chủ TK: <b>${accountName}</b>\n\n` +
      `💳 Số dư sau khi trừ: ${newBalance.toLocaleString("vi-VN")}đ\n` +
      `🕒 ${new Date().toLocaleString("vi-VN")}\n\n` +
      `👉 Duyệt tại: ${process.env.NEXT_PUBLIC_APP_URL || "https://locket-web-eight.vercel.app"}/admin/withdrawals`
    );

    return NextResponse.json({
      success: true,
      message: "Đã gửi yêu cầu rút tiền. Admin sẽ xử lý trong 1-24h.",
      balance: newBalance,
      withdrawalId: withdrawal.id,
    });
  } catch (error) {
    console.error("[withdrawals/create]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
