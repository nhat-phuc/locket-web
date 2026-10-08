import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { price: "asc" }],
      include: {
        packages: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        services,
        _debug: {
          db_host: (process.env.DATABASE_URL || "").split("@")[1]?.split("/")[0] || "N/A",
          db_name: (process.env.DATABASE_URL || "").split("/").pop()?.split("?")[0] || "N/A",
          count: services.length,
          time: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[api/services]", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi hệ thống",
        services: [],
        _debug: {
          db_host: (process.env.DATABASE_URL || "").split("@")[1]?.split("/")[0] || "N/A",
          db_name: (process.env.DATABASE_URL || "").split("/").pop()?.split("?")[0] || "N/A",
          error: String(error),
        },
      },
      { status: 500 }
    );
  }
}
