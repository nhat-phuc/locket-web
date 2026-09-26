import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["pending", "paid", "processing", "completed", "cancelled", "expired"].includes(status)) {
      return NextResponse.json({ success: false, message: "Status không hợp lệ" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        completedAt: status === "completed" ? new Date() : undefined,
        paidAt: status === "paid" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
