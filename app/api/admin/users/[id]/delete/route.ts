import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { id } = await params;

    // Không cho xóa chính mình
    if (id === auth.session!.userId) {
      return NextResponse.json({ success: false, message: "Không thể xóa chính mình" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    // Soft delete: đổi email + username + set isBanned
    const timestamp = Date.now();
    await prisma.user.update({
      where: { id },
      data: {
        email: `deleted_${timestamp}_${user.email}`,
        username: `deleted_${timestamp}_${user.username}`,
        isBanned: true,
        isActive: false,
      },
    });

    await prisma.log.create({
      data: {
        userId: auth.session!.userId,
        action: "ADMIN_DELETE_USER",
        detail: `Xóa user @${user.username} (${user.email})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa user @${user.username}`,
    });
  } catch (error) {
    console.error("[delete-user]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
