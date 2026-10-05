import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "1");

    // ═══ QUAN TRỌNG: Chỉ lấy thông báo CỦA USER ĐANG ĐĂNG NHẬP ═══
    // - userId = user hiện tại → thông báo riêng
    // - userId = null → thông báo chung (broadcast)
    // - KHÔNG lấy thông báo của user khác

    const where: any = {
      OR: [
        { userId: session?.userId || "__none__" }, // Thông báo riêng
        { userId: null },                          // Thông báo chung
      ],
    };

    if (limit === 1) {
      // Trả về 1 cái mới nhất (cho thông báo popup)
      const latest = await prisma.notification.findFirst({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ success: true, notification: latest });
    }

    // Trả về danh sách
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      notification: notifications[0] || null, // backward compat
    });
  } catch (error) {
    console.error("[notifications/latest]", error);
    return NextResponse.json({ success: false, notification: null, notifications: [] });
  }
}
