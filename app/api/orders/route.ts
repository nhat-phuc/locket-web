import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Format orderCode theo gói: LKT-{TYPE}-{DURATION}-{RAND}
// VD: LKT-GOLD-1T-A3F9, LKT-VIP-VV-B7K2, LKT-LUX-15S-C9M4
function buildOrderCode(type: string, duration: string | null, packageName?: string | null): string {
  // 1. Chuẩn hóa type
  const typeMap: Record<string, string> = {
    gold: "GOLD",
    vip: "VIP",
    luxury: "LUX",
    adr: "ADR",
    agent: "AGT",
  };
  const typeCode = typeMap[type.toLowerCase()] || "LKT";

  // 2. Chuẩn hóa duration
  let durCode = "XX";
  const src = (duration || packageName || "").toLowerCase();
  if (src.includes("vĩnh viễn") || src.includes("vinh vien") || src === "vv") durCode = "VV";
  else if (src.includes("15s") || src.includes("15 s")) durCode = "15S";
  else if (src.includes("3s") || src.includes("3 s")) durCode = "3S";
  else if (src.includes("1 năm") || src.includes("12 tháng")) durCode = "1N";
  else if (src.includes("6 tháng") || src.includes("6t")) durCode = "6T";
  else if (src.includes("3 tháng") || src.includes("3t")) durCode = "3T";
  else if (src.includes("1 tháng") || src.includes("30 ngày") || src.includes("1t")) durCode = "1T";
  else if (src.includes("7 ngày") || src.includes("1 tuần")) durCode = "1W";

  // 3. Random 4 ký tự
  const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");

  return `LKT-${typeCode}-${durCode}-${rand}`;
}

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

    // 1. Lấy service
    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id: serviceId }, { slug: serviceId }],
        isActive: true,
      },
    });
    if (!service) {
      return NextResponse.json({ success: false, message: "Dịch vụ không tồn tại" }, { status: 404 });
    }

    // 2. Lấy package (nếu có) — quyết định giá + duration
    let pkg = null;
    if (packageId) {
      pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
      if (!pkg || pkg.serviceId !== service.id) {
        return NextResponse.json({ success: false, message: "Gói không hợp lệ" }, { status: 400 });
      }
    }

    // 3. Tính giá: ưu tiên package.price, fallback service.price
    let baseAmount = pkg ? pkg.price : service.price;
    let baseOriginal = pkg ? (pkg.originalPrice || pkg.price) : (service.originalPrice || service.price);
    let discount = 0;

    // 4. Áp mã giảm giá
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === "percent") {
          discount = Math.floor((baseAmount * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        if (discount > baseAmount) discount = baseAmount;
      }
    }

    const finalAmount = baseAmount - discount;

    // 5. Tạo orderCode theo gói: LKT-GOLD-1T-A3F9
    const duration = pkg?.duration || service.duration || null;
    const packageName = pkg?.name || null;
    const orderCode = buildOrderCode(service.type, duration, packageName);

    // 6. Đảm bảo orderCode không trùng (thử tối đa 5 lần)
    let finalCode = orderCode;
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.order.findUnique({ where: { orderCode: finalCode } });
      if (!existing) break;
      finalCode = buildOrderCode(service.type, duration, packageName);
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 7. Tên dịch vụ đầy đủ (bao gồm tên gói nếu có)
    const fullServiceName = pkg ? `${service.name} - ${pkg.name}` : service.name;

    const order = await prisma.order.create({
      data: {
        orderCode: finalCode,
        userId: session.userId,
        serviceId: service.id,
        packageId: pkg?.id || null,
        serviceName: fullServiceName,
        amount: baseAmount,
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
