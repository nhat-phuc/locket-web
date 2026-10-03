import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, coupons });
  } catch (e) {
    console.error("[coupons/my]", e);
    return NextResponse.json({ success: false, coupons: [] });
  }
}
