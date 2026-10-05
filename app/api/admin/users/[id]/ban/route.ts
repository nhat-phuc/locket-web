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
    const { isBanned } = await req.json();

    const session = await getSession();
    if (session?.userId === id) {
      return NextResponse.json({ success: false, message: "Không thể tự ban chính mình" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isBanned: Boolean(isBanned) },
      select: { id: true, username: true, isBanned: true },
    });

    await prisma.log.create({
      data: {
        action: isBanned ? "ADMIN_BAN_USER" : "ADMIN_UNBAN_USER",
        detail: `${isBanned ? "Ban" : "Unban"} user @${user.username}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[admin/users/ban]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
