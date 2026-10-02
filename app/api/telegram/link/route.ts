import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code, telegramId } = await req.json();

    if (!code || !telegramId) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Tìm user có telegramLinkCode = code
    const user = await prisma.user.findFirst({
      where: { telegramLinkCode: code.toUpperCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Mã không hợp lệ hoặc đã hết hạn" },
        { status: 404 }
      );
    }

    // Cập nhật telegramId + xóa linkCode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramId: String(telegramId),
        telegramLinkCode: null,
        telegramLinkedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      userName: user.name || user.username || user.email,
    });
  } catch (error) {
    console.error("[telegram/link]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
