import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "cover";

    if (!file) {
      return NextResponse.json({ success: false, message: "Thiếu file" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File quá lớn (max 5MB)" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Chỉ chấp nhận ảnh" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi upload" },
      { status: 500 }
    );
  }
}
