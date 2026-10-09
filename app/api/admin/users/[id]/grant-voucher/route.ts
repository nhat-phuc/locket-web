import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  try {
    const { id } = await params;
    const { code, discountType, discountValue, minOrder, maxDiscount, expiresAt } = await req.json();

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra code đã tồn tại chưa
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Mã đã tồn tại" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });

    // Tạo coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    // Thông báo cho user
    await prisma.notification.create({
      data: {
        userId: id,
        title: "🎁 Bạn nhận được voucher!",
        content: `Admin vừa tặng bạn voucher "${code}". ${
          discountType === "percent" ? `Giảm ${discountValue}%` : `Giảm ${Number(discountValue).toLocaleString("vi-VN")}đ`
        } cho đơn tiếp theo.`,
        type: "success",
      },
    });

    await prisma.log.create({
      data: {
        userId: auth.session!.userId,
        action: "ADMIN_GRANT_VOUCHER",
        detail: `Tặng voucher ${code} cho @${user.username}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tặng voucher ${code} cho @${user.username}`,
      coupon,
    });
  } catch (error) {
    console.error("[grant-voucher]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
