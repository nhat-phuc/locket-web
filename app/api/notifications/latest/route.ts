import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Lấy thông báo mới nhất trong 7 ngày qua
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const latest = await prisma.notification.findFirst({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, notification: latest });
  } catch (error) {
    console.error("[notifications/latest]", error);
    return NextResponse.json({ success: false, notification: null });
  }
}
