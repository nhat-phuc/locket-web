import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { telegramId: null, telegramLinkedAt: null },
    });

    return NextResponse.json({ success: true, message: "Đã hủy liên kết" });
  } catch (error) {
    console.error("[telegram/unlink]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
