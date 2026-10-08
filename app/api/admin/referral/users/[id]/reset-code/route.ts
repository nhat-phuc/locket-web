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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { codeChangedAt: null },
    });

    return NextResponse.json({
      success: true,
      message: `Đã reset. @${user.username} có thể đổi mã 1 lần nữa.`,
    });
  } catch (error) {
    console.error("[reset-code]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
