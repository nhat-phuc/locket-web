import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ success: false, error: "Không có file" }, { status: 400 });
    }

    // Validate
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Chỉ nhận ảnh" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ảnh tối đa 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file unique
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `review-${session.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "upload", "reviews");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      success: true,
      url: `/upload/reviews/${filename}`,
    });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ success: false, error: "Upload thất bại" }, { status: 500 });
  }
}
