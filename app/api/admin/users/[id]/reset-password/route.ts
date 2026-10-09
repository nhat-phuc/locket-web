import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { id } = await params;
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    await prisma.log.create({
      data: {
        userId: auth.session!.userId,
        action: "ADMIN_RESET_PASSWORD",
        detail: `Reset mật khẩu cho @${user.username} (${user.email})`,
      },
    });

    // Thông báo cho user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "🔑 Mật khẩu đã được đổi",
        content: "Admin vừa đặt lại mật khẩu cho tài khoản của bạn. Vui lòng liên hệ admin để biết mật khẩu mới.",
        type: "warning",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã reset mật khẩu cho @${user.username}`,
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
