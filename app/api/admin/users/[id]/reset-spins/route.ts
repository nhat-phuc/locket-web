import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return u?.role === "admin";
}

// POST: Reset lượt quay hôm nay cho user
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Lấy đầu ngày VN
    const now = new Date();
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + vnOffset);
    vnNow.setUTCHours(0, 0, 0, 0);
    const start = new Date(vnNow.getTime() - vnOffset);

    // Xóa lượt quay hôm nay
    const deleted = await prisma.spin.deleteMany({
      where: {
        userId: id,
        createdAt: { gte: start },
      },
    });

    // Log
    const user = await prisma.user.findUnique({ where: { id }, select: { username: true } });
    await prisma.log.create({
      data: {
        action: "ADMIN_RESET_SPINS",
        detail: `Reset ${deleted.count} lượt quay cho @${user?.username || id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã reset ${deleted.count} lượt quay`,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("[admin reset-spins]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
