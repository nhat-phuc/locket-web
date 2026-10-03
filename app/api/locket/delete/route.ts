import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // 1. Lấy session
    const session = await getSession();
    const userId = (session as any)?.userId || (session as any)?.sub;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    // 2. Lấy user + check role admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Chỉ admin mới có quyền xóa Locket" },
        { status: 403 }
      );
    }

    // 3. Lấy id từ body (khớp với frontend: { id })
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu id" },
        { status: 400 }
      );
    }

    // 4. Xóa — dùng LocketProfile (chữ L hoa, đúng tên model)
    await prisma.locketProfile.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Đã xóa Locket" });
  } catch (err: any) {
    console.error("[locket/delete]", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
