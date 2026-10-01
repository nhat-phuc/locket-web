import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET — lấy tất cả settings
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    return NextResponse.json({ success: true, settings: map });
  } catch (error) {
    console.error("[admin/settings]", error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}

// POST — cập nhật setting
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 401 });
    }

    const { key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ success: false, message: "Thiếu key" }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/settings]", error);
    return NextResponse.json({ success: false, message: "Lỗi" }, { status: 500 });
  }
}
