import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || "locket-internal-secret-2026";

async function isAdminBot(req: Request): Promise<boolean> {
  const key = req.headers.get("x-internal-key");
  if (key !== INTERNAL_KEY) return false;
  const { searchParams } = new URL(req.url);
  const tgId = searchParams.get("telegramId");
  if (!tgId) return false;
  const u = await prisma.user.findFirst({ where: { telegramId: tgId } });
  return u?.role === "admin";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  if (!(await isAdminBot(req))) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  const { action } = await params;
  const { searchParams } = new URL(req.url);

  try {
    // ── THỐNG KÊ ──
    if (action === "stats") {
      const [totalUsers, totalOrders, paidOrders, pendingOrders, revenueAgg, todayRevenueAgg] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: "paid" } }),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.order.aggregate({
          where: { status: { in: ["paid", "completed"] } },
          _sum: { finalAmount: true },
        }),
        prisma.order.aggregate({
          where: {
            status: { in: ["paid", "completed"] },
            paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          _sum: { finalAmount: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          totalUsers,
          totalOrders,
          paidOrders,
          pendingOrders,
          totalRevenue: revenueAgg._sum.finalAmount || 0,
          todayRevenue: todayRevenueAgg._sum.finalAmount || 0,
        },
      });
    }

    // ── DANH SÁCH USER ──
    if (action === "users") {
      const search = searchParams.get("search") || "";
      const users = await prisma.user.findMany({
        where: search ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {},
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true, username: true, email: true, name: true, role: true,
          balance: true, bonusBalance: true, isBanned: true,
          telegramId: true, createdAt: true,
        },
      });
      return NextResponse.json({ success: true, users });
    }

    // ── CHI TIẾT USER ──
    if (action === "user-detail") {
      const userId = searchParams.get("userId");
      if (!userId) return NextResponse.json({ success: false, message: "Thiếu userId" });

      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) user = await prisma.user.findFirst({ where: { username: userId } });
      if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" });

      const [orders, txs, spins] = await Promise.all([
        prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { orderCode: true, serviceName: true, finalAmount: true, status: true, createdAt: true },
        }),
        prisma.transaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { type: true, amount: true, description: true, createdAt: true },
        }),
        prisma.spin.count({ where: { userId: user.id } }),
      ]);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id, username: user.username, email: user.email, name: user.name,
          role: user.role, balance: user.balance, bonusBalance: user.bonusBalance,
          isBanned: user.isBanned, telegramId: user.telegramId, totalSpins: spins,
        },
        orders, transactions: txs,
      });
    }

    // ── ĐƠN HÀNG ──
    if (action === "orders") {
      const status = searchParams.get("status") || "";
      const orders = await prisma.order.findMany({
        where: status ? { status } : {},
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { username: true, email: true } } },
      });
      return NextResponse.json({ success: true, orders });
    }

    // ── RÚT TIỀN ──
    if (action === "withdrawals") {
      const ws = await prisma.withdrawalRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { username: true, email: true } } },
      });
      return NextResponse.json({ success: true, withdrawals: ws });
    }

    // ── VÒNG QUAY ──
    if (action === "wheel") {
      const [totalSpins, todaySpins, totalPaid, uniqueUsers] = await Promise.all([
        prisma.spin.count(),
        prisma.spin.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        prisma.transaction.aggregate({
          where: { method: "lucky_wheel", status: "success" },
          _sum: { amount: true },
        }),
        prisma.spin.groupBy({ by: ["userId"] }),
      ]);
      return NextResponse.json({
        success: true,
        stats: {
          totalSpins,
          todaySpins,
          totalPaid: totalPaid._sum.amount || 0,
          totalPlayers: uniqueUsers.length,
        },
      });
    }

    return NextResponse.json({ success: false, message: "Action không hợp lệ" });
  } catch (error) {
    console.error("[telegram/admin GET]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  if (!(await isAdminBot(req))) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  const { action } = await params;

  try {
    const body = await req.json();
    const { userId, targetUsername, amount, reason } = body;

    // ── BAN / UNBAN ──
    if (action === "ban" || action === "unban") {
      if (!userId) return NextResponse.json({ success: false, message: "Thiếu userId" });
      const u = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: action === "ban" },
        select: { id: true, username: true, isBanned: true },
      });
      return NextResponse.json({
        success: true,
        message: action === "ban" ? `Đã ban @${u.username}` : `Đã bỏ ban @${u.username}`,
        user: u,
      });
    }

    // ── CỘNG TIỀN ──
    if (action === "add-balance") {
      if (!targetUsername || !amount) {
        return NextResponse.json({ success: false, message: "Thiếu username hoặc amount" });
      }
      const user = await prisma.user.findFirst({ where: { username: targetUsername } });
      if (!user) return NextResponse.json({ success: false, message: "User không tồn tại" });

      const amt = Number(amount);
      const newBalance = user.balance + amt;

      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { balance: newBalance } }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "admin",
            amount: amt,
            balanceBefore: user.balance,
            balanceAfter: newBalance,
            status: "success",
            method: "admin",
            description: `Admin cộng tiền qua bot${reason ? `: ${reason}` : ""}`,
            completedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Đã cộng ${amt.toLocaleString("vi-VN")}đ cho @${user.username}`,
        newBalance,
      });
    }

    // ── ĐỔI ROLE ──
    if (action === "set-role") {
      if (!userId || !body.role) {
        return NextResponse.json({ success: false, message: "Thiếu userId hoặc role" });
      }
      if (!["user", "admin"].includes(body.role)) {
        return NextResponse.json({ success: false, message: "Role không hợp lệ" });
      }
      const u = await prisma.user.update({
        where: { id: userId },
        data: { role: body.role },
        select: { id: true, username: true, role: true },
      });
      return NextResponse.json({
        success: true,
        message: `Đã đổi role @${u.username} thành ${u.role}`,
        user: u,
      });
    }

    // ── RESET LƯỢT QUAY ──
    if (action === "reset-spins") {
      if (!userId) return NextResponse.json({ success: false, message: "Thiếu userId" });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const deleted = await prisma.spin.deleteMany({
        where: { userId, createdAt: { gte: todayStart } },
      });
      return NextResponse.json({
        success: true,
        message: `Đã reset ${deleted.count} lượt quay`,
      });
    }

    // ── DUYỆT ĐƠN ──
    if (action === "approve-order") {
      if (!body.orderCode) return NextResponse.json({ success: false, message: "Thiếu mã đơn" });
      const order = await prisma.order.update({
        where: { orderCode: body.orderCode },
        data: { status: "paid", paidAt: new Date() },
        select: { orderCode: true, status: true },
      });
      return NextResponse.json({
        success: true,
        message: `Đã duyệt đơn ${order.orderCode}`,
        order,
      });
    }

    // ── HỦY ĐƠN ──
    if (action === "cancel-order") {
      if (!body.orderCode) return NextResponse.json({ success: false, message: "Thiếu mã đơn" });
      const order = await prisma.order.update({
        where: { orderCode: body.orderCode },
        data: { status: "cancelled" },
        select: { orderCode: true, status: true },
      });
      return NextResponse.json({
        success: true,
        message: `Đã hủy đơn ${order.orderCode}`,
        order,
      });
    }

    // ── DUYỆT RÚT TIỀN ──
    if (action === "approve-withdrawal" || action === "reject-withdrawal") {
      if (!body.withdrawalId) return NextResponse.json({ success: false, message: "Thiếu ID" });
      const w = await prisma.withdrawalRequest.update({
        where: { id: body.withdrawalId },
        data: { status: action === "approve-withdrawal" ? "approved" : "rejected" },
      });
      return NextResponse.json({
        success: true,
        message: action === "approve-withdrawal" ? "Đã duyệt yêu cầu" : "Đã từ chối yêu cầu",
        withdrawal: w,
      });
    }

    return NextResponse.json({ success: false, message: "Action không hợp lệ" });
  } catch (error) {
    console.error("[telegram/admin POST]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
