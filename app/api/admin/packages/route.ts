import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const packages = await prisma.servicePackage.findMany({
      include: { service: { select: { name: true, slug: true } } },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("[admin/packages GET]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.id) {
      const p = await prisma.servicePackage.update({ where: { id: b.id }, data: b });
      return NextResponse.json({ success: true, package: p });
    }
    const p = await prisma.servicePackage.create({ data: b });
    return NextResponse.json({ success: true, package: p });
  } catch (error) {
    console.error("[admin/packages POST]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false }, { status: 400 });
    await prisma.servicePackage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/packages DELETE]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
