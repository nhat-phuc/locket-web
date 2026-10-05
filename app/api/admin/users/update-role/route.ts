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
    const { userId, role } = await req.json();

    if (!userId || !["admin", "user"].includes(role)) {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // Không cho tự hạ chính mình
    const session = await getSession();
    if (session?.userId === userId && role === "user") {
      return NextResponse.json(
        { success: false, message: "Không thể tự hạ quyền chính mình!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: role === "admin" ? "Đã cấp quyền Admin" : "Đã hạ quyền User",
      user,
    });
  } catch (error) {
    console.error("[update-role]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
