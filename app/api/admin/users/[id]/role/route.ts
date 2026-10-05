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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { role } = await req.json();

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ success: false, message: "Role không hợp lệ" }, { status: 400 });
    }

    const session = await getSession();
    if (session?.userId === id) {
      return NextResponse.json({ success: false, message: "Không thể tự đổi quyền chính mình" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    await prisma.log.create({
      data: {
        action: "ADMIN_CHANGE_ROLE",
        detail: `Đổi role user @${user.username} thành ${role}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[admin/users/role]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
