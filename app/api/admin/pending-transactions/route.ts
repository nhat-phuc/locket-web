import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";
  const items = await prisma.pendingTransaction.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, items });
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    const { id, action, note } = await req.json();
    if (!id || !["resolve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }
    const pending = await prisma.pendingTransaction.findUnique({ where: { id } });
    if (!pending) {
      return NextResponse.json({ success: false, message: "Không tìm thấy GD" }, { status: 404 });
    }
    if (action === "resolve" && pending.orderCode) {
      const order = await prisma.order.findUnique({ where: { orderCode: pending.orderCode } });
      if (order && order.status !== "paid" && order.status !== "completed") {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "paid",
              paidAt: new Date(),
              paymentRef: pending.referenceCode || order.paymentRef,
              note: (order.note || "") + `\n[Admin duyệt GD lúc ${new Date().toLocaleString("vi-VN")}]`,
            },
          });
          const user = await tx.user.findUnique({ where: { id: order.userId } });
          if (user) {
            await tx.transaction.create({
              data: {
                userId: order.userId,
                type: "payment",
                amount: order.finalAmount,
                balanceBefore: user.balance,
                balanceAfter: user.balance,
                status: "completed",
                method: "bank_transfer",
                reference: pending.referenceCode || pending.sepayId || undefined,
                description: `Thanh toán đơn ${order.orderCode}`,
                orderId: order.id,
                completedAt: new Date(),
              },
            });
          }
          await tx.pendingTransaction.update({
            where: { id },
            data: {
              status: "resolved",
              note: note || "Admin duyệt thủ công",
              resolvedBy: session.userId,
              resolvedAt: new Date(),
              orderId: order.id,
            },
          });
          await tx.log.create({
            data: {
              userId: session.userId,
              action: "PENDING_TX_RESOLVE",
              detail: `Duyệt GD ${pending.orderCode} (${pending.amount.toLocaleString("vi-VN")}đ) → đơn paid`,
            },
          });
        });
        return NextResponse.json({
          success: true,
          message: `Đã duyệt. Đơn ${order.orderCode} chuyển sang "Đã thanh toán".`,
        });
      }
    }
    await prisma.pendingTransaction.update({
      where: { id },
      data: {
        status: action === "resolve" ? "resolved" : "rejected",
        note: note || (action === "resolve" ? "Admin duyệt" : "Admin từ chối"),
        resolvedBy: session.userId,
        resolvedAt: new Date(),
      },
    });
    await prisma.log.create({
      data: {
        userId: session.userId,
        action: action === "resolve" ? "PENDING_TX_RESOLVE" : "PENDING_TX_REJECT",
        detail: `${action === "resolve" ? "Duyệt" : "Từ chối"} GD ${pending.orderCode || pending.id}`,
      },
    });
    return NextResponse.json({
      success: true,
      message: action === "resolve" ? "Đã đánh dấu xử lý" : "Đã từ chối",
    });
  } catch (error) {
    console.error("Pending transaction error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
