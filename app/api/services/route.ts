import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const platform = searchParams.get("platform");

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    if (platform) where.platform = platform;

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
      include: {
        packages: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
