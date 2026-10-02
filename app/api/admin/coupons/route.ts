import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET — Danh sách coupons
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const coupons = await prisma.coupon.findMany({
      where: search ? { code: { contains: search.toUpperCase() } } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("[admin/coupons GET]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// POST — Tạo coupon mới
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const body = await req.json();
    const { code, discountType, discountValue, minOrder, maxDiscount, usageLimit, expiresAt } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    const normalizedCode = String(code).toUpperCase().trim();

    const existing = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Mã đã tồn tại" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discountType: String(discountType),
        discountValue: Number(discountValue),
        minOrder: Number(minOrder) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    await prisma.log.create({
      data: {
        userId: session.userId,
        action: "CREATE_COUPON",
        detail: `Tạo mã ${normalizedCode}: ${discountType === "percent" ? discountValue + "%" : discountValue.toLocaleString("vi-VN") + "đ"}`,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("[admin/coupons POST]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// PATCH — Bật/tắt coupon
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { id, isActive } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu id" }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("[admin/coupons PATCH]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

// DELETE — Xóa coupon
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu id" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    await prisma.log.create({
      data: {
        userId: session.userId,
        action: "DELETE_COUPON",
        detail: `Xóa mã coupon ${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/coupons DELETE]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
