import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { id } = await params;
    const { title, content, type } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Thiếu tiêu đề hoặc nội dung" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    await prisma.notification.create({
      data: {
        userId: id,
        title,
        content,
        type: type || "info",
      },
    });

    await prisma.log.create({
      data: {
        userId: auth.session!.userId,
        action: "ADMIN_NOTIFY_USER",
        detail: `Gửi thông báo cho @${user.username}: ${title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi thông báo cho @${user.username}`,
    });
  } catch (error) {
    console.error("[notify]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
