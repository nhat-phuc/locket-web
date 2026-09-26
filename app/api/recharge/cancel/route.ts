import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderCode, email } = await req.json();
    if (!orderCode) {
      return NextResponse.json({ success: false, message: "Thiếu orderCode" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { orderCode, status: "pending" },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
