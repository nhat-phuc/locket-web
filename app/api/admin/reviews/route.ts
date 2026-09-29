import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET — Admin xem tất cả reviews
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const where: Record<string, unknown> = {};
    if (status !== "all") where.status = status;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { email: true, username: true } },
      },
    });

    const counts = await prisma.review.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({ success: true, reviews, counts });
  } catch (error) {
    console.error("[admin/reviews/GET]", error);
    return NextResponse.json({ success: false, error: "Lỗi" }, { status: 500 });
  }
}

// PATCH — Duyệt / Từ chối / Feature
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 401 });
    }

    const { id, action, reason } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ success: false, error: "Thiếu dữ liệu" }, { status: 400 });
    }

    let data: Record<string, unknown> = {};

    switch (action) {
      case "approve":
        data = {
          status: "approved",
          isApproved: true,
          approvedBy: session.userId,
          approvedAt: new Date(),
          rejectReason: null,
        };
        break;
      case "reject":
        data = {
          status: "rejected",
          isApproved: false,
          approvedBy: session.userId,
          approvedAt: new Date(),
          rejectReason: reason || "Không phù hợp",
        };
        break;
      case "feature":
        const current = await prisma.review.findUnique({ where: { id } });
        data = { isFeatured: !current?.isFeatured };
        break;
      case "unfeature":
        data = { isFeatured: false };
        break;
      default:
        return NextResponse.json({ success: false, error: "Action không hợp lệ" }, { status: 400 });
    }

    const review = await prisma.review.update({ where: { id }, data });

    // Thông báo user
    if (review.userId && (action === "approve" || action === "reject")) {
      await prisma.notification.create({
        data: {
          userId: review.userId,
          title: action === "approve" ? "✅ Đánh giá được duyệt" : "⚠️ Đánh giá bị từ chối",
          content: action === "approve"
            ? "Đánh giá của bạn đã được hiển thị trên trang chủ!"
            : `Lý do: ${reason || "Không phù hợp"}`,
          type: action === "approve" ? "success" : "warning",
        },
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[admin/reviews/PATCH]", error);
    return NextResponse.json({ success: false, error: "Lỗi" }, { status: 500 });
  }
}

// DELETE — Xóa review
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Thiếu id" }, { status: 400 });

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/reviews/DELETE]", error);
    return NextResponse.json({ success: false, error: "Lỗi" }, { status: 500 });
  }
}
