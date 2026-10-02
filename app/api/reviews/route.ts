import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { orderId, rating, text, images } = await req.json();

    if (!text || !rating) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Đánh giá phải từ 1-5 sao" }, { status: 400 });
    }
    if (text.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Đánh giá phải có ít nhất 5 ký tự" }, { status: 400 });
    }

    if (orderId) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.userId, status: "paid" },
      });
      if (!order) {
        return NextResponse.json({ success: false, error: "Đơn hàng không hợp lệ" }, { status: 400 });
      }
      const existing = await prisma.review.findFirst({
        where: { userId: session.userId, orderId },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: "Bạn đã đánh giá đơn này rồi" }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, username: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Không tìm thấy user" }, { status: 404 });
    }

    // Tên thật, không mask
    const displayName = user.name || user.username || user.email.split("@")[0];
    const initial = displayName.charAt(0).toUpperCase();

    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        orderId: orderId || null,
        name: displayName,
        initial,
        text: text.trim(),
        rating,
        images: images ? JSON.stringify(images) : null,
        image: images && images[0] ? images[0] : null,
        time: "Vừa xong",
        status: "pending",
        isApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt.",
      review,
    });
  } catch (error) {
    console.error("[reviews/POST]", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 20);

    const reviews = await prisma.review.findMany({
      where: { status: "approved", isApproved: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        user: { select: { picture: true, name: true, username: true, email: true } },
      },
    });

    // Ghép tên thật từ user + avatar
    const reviewsWithData = reviews.map((r) => {
      // Nếu Review.name đã có (từ lúc tạo) → dùng
      // Nếu không → fallback từ user
      const realName = r.name || r.user?.name || r.user?.username || r.user?.email?.split("@")[0] || "User";
      return {
        id: r.id,
        name: realName,
        initial: r.initial,
        avatar: r.user?.picture || null,
        text: r.text,
        rating: r.rating,
        image: r.image,
        images: r.images,
        time: r.time,
        isFeatured: r.isFeatured,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ success: true, reviews: reviewsWithData });
  } catch (error) {
    console.error("[reviews/GET]", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
