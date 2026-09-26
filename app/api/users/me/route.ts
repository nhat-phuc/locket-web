import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { hashPassword, comparePassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, email: true, username: true, name: true, picture: true,
        phone: true, balance: true, role: true, createdAt: true,
      },
    });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

    const body = await req.json();
    const { name, phone, picture, currentPassword, newPassword } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (picture !== undefined) updateData.picture = picture;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: "Cần nhập mật khẩu hiện tại" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

      const valid = await comparePassword(currentPassword, user.password);
      if (!valid) return NextResponse.json({ success: false, message: "Mật khẩu hiện tại không đúng" }, { status: 400 });

      updateData.password = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true, email: true, username: true, name: true, picture: true,
        phone: true, balance: true, role: true,
      },
    });

    return NextResponse.json({ success: true, user: updated, message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
