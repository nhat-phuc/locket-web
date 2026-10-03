import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULTS = {
  popup_enabled: "true",
  popup_title: "Thông Báo",
  popup_content: "Chúc mừng bạn đến với Locket Gold!",
  popup_icon: "🌟",
  popup_button: "Đã hiểu",
  popup_close_hours: "24",
};

export async function GET() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: Object.keys(DEFAULTS) } },
    });
    const map: Record<string, string> = { ...DEFAULTS };
    rows.forEach((s) => { map[s.key] = s.value; });
    return NextResponse.json({ success: true, popup: map });
  } catch {
    return NextResponse.json({ success: true, popup: DEFAULTS });
  }
}
