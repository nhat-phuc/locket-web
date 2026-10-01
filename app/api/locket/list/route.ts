import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { displayName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const profiles = await prisma.locketProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const total = await prisma.locketProfile.count({ where });

    return NextResponse.json({ success: true, profiles, total });
  } catch (error) {
    console.error("[locket/list]", error);
    return NextResponse.json({ success: false, profiles: [], total: 0 }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu id" }, { status: 400 });
    }
    await prisma.locketProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[locket/list DELETE]", error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
