import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    const services = await prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("Admin GET services error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    const body = await req.json();
    const {
      name, slug, description, type, platform, price, originalPrice,
      discount, duration, features, image, badge, badgeColor,
      isActive, isFeatured, stock, sortOrder,
    } = body;

    if (!name || !slug || !type || !platform || !price) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description: description || "",
        type,
        platform,
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        discount: discount ? parseInt(discount) : null,
        duration: duration || null,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
        image: image || null,
        badge: badge || null,
        badgeColor: badgeColor || null,
        isActive: isActive !== false,
        isFeatured: !!isFeatured,
        stock: stock ? parseInt(stock) : null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });
    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Admin POST service error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "Slug đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
