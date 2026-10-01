import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { target, email, title, content, type } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, message: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
    }

    if (target === "one") {
      if (!email) {
        return NextResponse.json({ success: false, message: "Thiếu email người nhận" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
      }
      await prisma.notification.create({
        data: { userId: user.id, title, content, type: type || "info" },
      });
      return NextResponse.json({ success: true, count: 1 });
    }

    // Target: all
    const users = await prisma.user.findMany({
      where: { isActive: true, isBanned: false },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        content,
        type: type || "info",
      })),
    });

    return NextResponse.json({ success: true, count: users.length });
  } catch (error) {
    console.error("[admin/notifications/send]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
