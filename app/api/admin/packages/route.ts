import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const packages = await prisma.servicePackage.findMany({
      include: { service: { select: { name: true, slug: true, type: true } } },
      orderBy: [{ serviceId: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("[admin/packages GET]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const b = await req.json();
    const { id, name, duration, price, originalPrice, serviceId, order, isPopular, features } = b;

    // Validate
    if (!name || !price || !serviceId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    // Chuẩn bị data
    const featuresJson = Array.isArray(features)
      ? JSON.stringify(features.filter((f: string) => f && f.trim()))
      : typeof features === "string"
      ? features
      : "[]";

    const data: any = {
      name: String(name).trim(),
      duration: String(duration || "").trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      serviceId,
      order: Number(order) || 0,
      isPopular: Boolean(isPopular),
      features: featuresJson,
    };

    if (id) {
      const p = await prisma.servicePackage.update({
        where: { id },
        data,
      });
      return NextResponse.json({ success: true, package: p });
    }

    const p = await prisma.servicePackage.create({ data });
    return NextResponse.json({ success: true, package: p });
  } catch (error) {
    console.error("[admin/packages POST]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

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
