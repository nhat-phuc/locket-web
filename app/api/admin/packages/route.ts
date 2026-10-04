import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  const packages = await prisma.servicePackage.findMany({
    include: { service: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, packages });
}
export async function POST(req: Request) {
  const b = await req.json();
  if (b.id) {
    const p = await prisma.servicePackage.update({ where: { id: b.id }, data: b });
    return NextResponse.json({ success: true, package: p });
  }
  const p = await prisma.servicePackage.create({ data: b });
  return NextResponse.json({ success: true, package: p });
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await prisma.servicePackage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
