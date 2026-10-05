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

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
  }

  try {
    const { userId, isBanned } = await req.json();

    if (!userId || typeof isBanned !== "boolean") {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const session = await getSession();
    if (session?.userId === userId && isBanned) {
      return NextResponse.json(
        { success: false, message: "Không thể tự ban chính mình!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: { id: true, username: true, isBanned: true },
    });

    return NextResponse.json({
      success: true,
      message: isBanned ? "Đã ban user" : "Đã bỏ ban",
      user,
    });
  } catch (error) {
    console.error("[toggle-ban]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
