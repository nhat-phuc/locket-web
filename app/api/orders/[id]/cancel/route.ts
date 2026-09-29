import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ success: false, message: "Đơn không tồn tại" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ success: false, message: "Không thể hủy đơn này" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cancel]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
