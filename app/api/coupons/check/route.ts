import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code, amount } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Mã không tồn tại" },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "Mã đã bị vô hiệu hóa" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Mã đã hết hạn" },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "Mã đã hết lượt sử dụng" },
        { status: 400 }
      );
    }

    if (coupon.minOrder && amount < coupon.minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString("vi-VN")}đ`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = Math.floor((amount * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > amount) discount = amount;

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalAmount: amount - discount,
    });
  } catch (error) {
    console.error("Coupon check error:", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}