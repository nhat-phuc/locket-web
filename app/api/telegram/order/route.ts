import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const order = await prisma.order.findUnique({ where: { id: orderId! } });
    return NextResponse.json({ success: !!order, order });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
