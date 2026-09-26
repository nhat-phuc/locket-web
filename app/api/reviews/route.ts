import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, orderId, rating, text } = await req.json();

    if (!userId || !text || !rating) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Đánh giá phải từ 1-5 sao" },
        { status: 400 }
      );
    }

    if (text.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Đánh giá phải có ít nhất 5 ký tự" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy user" },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId,
        name: user.name || user.email.split("@")[0],
        initial: (user.name || user.email)[0].toUpperCase(),
        text: text.trim(),
        rating,
        time: "Vừa xong",
        isApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã gửi đánh giá!",
      review,
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, reviews });
  } catch {
    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}