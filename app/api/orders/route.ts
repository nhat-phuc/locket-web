import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateOrderCode } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, packageId, locketUsername, locketLink, couponCode } = body;

    if (!serviceId || !locketUsername) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin đơn hàng" }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: {
        OR: [
          { id: serviceId },
          { slug: serviceId },
        ],
        isActive: true,
      },
    });
    if (!service) {
      return NextResponse.json({ success: false, message: "Dịch vụ không tồn tại" }, { status: 404 });
    }

    let finalAmount = service.price;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === "percent") {
          discount = Math.floor((finalAmount * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        if (discount > finalAmount) discount = finalAmount;
        finalAmount = finalAmount - discount;
      }
    }

    const orderCode = generateOrderCode("NPT");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: session.userId,
        serviceId: service.id,
        packageId: packageId || null,
        serviceName: service.name,
        amount: service.price,
        discount,
        finalAmount,
        couponCode: couponCode || null,
        status: "pending",
        paymentMethod: "bank_transfer",
        locketUsername,
        locketLink: locketLink || null,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
