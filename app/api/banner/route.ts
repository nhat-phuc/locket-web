import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "home_banner_url" },
    });

    return NextResponse.json({
      success: true,
      url: setting?.value || "/img/logo/banner.jpg",
    });
  } catch {
    return NextResponse.json({ success: true, url: "/img/logo/banner.jpg" });
  }
}
