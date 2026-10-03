import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 12, 100);

    const profiles = await prisma.locketProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        cover: true,        // ← THÊM DÒNG NÀY
        bio: true,
        badge: true,
        profileUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error("[locket/list]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
