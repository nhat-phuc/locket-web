import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/orders/{id}/reorder
// Tạo đơn mới dựa trên đơn cũ (giữ nguyên service + username)

function buildOrderCode(type: string, duration: string | null): string {
  const typeMap: Record<string, string> = {
    gold: "GOLD", vip: "VIP", luxury: "LUX", adr: "ADR", agent: "AGT",
  };
  const typeCode = typeMap[type.toLowerCase()] || "LKT";

  let durCode = "XX";
  const src = (duration || "").toLowerCase();
  if (src.includes("vĩnh viễn")) durCode = "VV";
  else if (src.includes("15s")) durCode = "15S";
  else if (src.includes("3s")) durCode = "3S";
  else if (src.includes("1 năm")) durCode = "1N";
  else if (src.includes("6 tháng")) durCode = "6T";
  else if (src.includes("3 tháng")) durCode = "3T";
  else if (src.includes("1 tháng")) durCode = "1T";

  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");
  return `LKT-${typeCode}-${durCode}-${rand}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const { id } = await params;
    const oldOrder = await prisma.order.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!oldOrder || oldOrder.userId !== session.userId) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }

    // Chỉ cho phép reorder khi đơn expired/cancelled/failed
    if (!["expired", "cancelled", "failed"].includes(oldOrder.status)) {
      return NextResponse.json(
        { success: false, message: "Chỉ tạo lại được đơn đã hủy/hết hạn" },
        { status: 400 }
      );
    }

    // Check service tồn tại
    if (!oldOrder.service) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy service của đơn" },
        { status: 400 }
      );
    }

    // Lấy duration từ service
    const duration = oldOrder.service.duration || null;

    // Tạo mã mới
    let newCode = buildOrderCode(oldOrder.service.type, duration);
    for (let i = 0; i < 5; i++) {
      const exist = await prisma.order.findUnique({ where: { orderCode: newCode } });
      if (!exist) break;
      newCode = buildOrderCode(oldOrder.service.type, duration);
    }

    const newOrder = await prisma.order.create({
      data: {
        orderCode: newCode,
        userId: session.userId,
        serviceId: oldOrder.serviceId,
        packageId: oldOrder.packageId,
        serviceName: oldOrder.serviceName,
        amount: oldOrder.amount,
        discount: 0, // không áp lại coupon
        finalAmount: oldOrder.amount,
        status: "pending",
        paymentMethod: "bank_transfer",
        locketUsername: oldOrder.locketUsername,
        locketLink: oldOrder.locketLink,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("[reorder]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
