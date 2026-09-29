import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name, slug, description, type, platform, price, originalPrice, discount,
      duration, features, image, badge, badgeColor, isActive, isFeatured,
      stock, sortOrder, packages,
    } = body;

    // Update service + recreate packages
    const service = await prisma.$transaction(async (tx) => {
      // Xoá packages cũ
      await tx.servicePackage.deleteMany({ where: { serviceId: id } });

      // Update service + tạo packages mới
      return tx.service.update({
        where: { id },
        data: {
          name, slug, description, type, platform,
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
          packages: {
            create: (packages || []).map((p: any, i: number) => ({
              name: p.name,
              duration: p.duration || "",
              price: parseInt(p.price) || 0,
              isPopular: !!p.isPopular,
              order: i,
            })),
          },
        },
        include: { packages: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Update service error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete service error:", error);
    if (error.code === "P2003") {
      return NextResponse.json({ success: false, message: "Không xóa được — có đơn hàng liên quan" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
