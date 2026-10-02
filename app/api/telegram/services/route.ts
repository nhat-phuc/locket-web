import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true, type: { in: ["vip", "gold", "luxury", "adr"] } },
      orderBy: { price: "asc" },
      select: { id: true, slug: true, name: true, type: true, price: true, features: true },
    });
    return NextResponse.json({ success: true, services });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
