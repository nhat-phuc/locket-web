import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error(error);
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
    const { title, slug, excerpt, content, category, categoryColor, author, image, tags, readTime, isFeatured } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        content,
        category: category || "Tin tức",
        categoryColor: categoryColor || "#a78bfa",
        author: author || "Admin",
        image: image || null,
        tags: tags || "",
        readTime: readTime || "5 phút",
        isFeatured: !!isFeatured,
        isPublished: true,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Create post error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "Slug đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
