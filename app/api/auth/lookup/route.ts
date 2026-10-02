import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Che email: phuc287@gmail.com → ph******@gmail.com
function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  const first = name.slice(0, 2);
  const last = name.slice(-1);
  return `${first}${"*".repeat(Math.max(3, name.length - 3))}${last}@${domain}`;
}

export async function POST(req: Request) {
  try {
    const { type, value } = await req.json();

    if (!type || !value) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu" }, { status: 400 });
    }

    let user = null;

    if (type === "phone") {
      // Chuẩn hóa SĐT (bỏ dấu cách, +84 → 0)
      let phone = String(value).replace(/\D/g, "");
      if (phone.startsWith("84")) phone = "0" + phone.slice(2);

      user = await prisma.user.findFirst({
        where: { phone },
      });
    } else if (type === "username") {
      user = await prisma.user.findFirst({
        where: { username: String(value).trim() },
      });
    } else if (type === "email") {
      user = await prisma.user.findFirst({
        where: { email: String(value).trim().toLowerCase() },
      });
    } else {
      return NextResponse.json({ success: false, message: "Loại không hợp lệ" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: type === "phone"
          ? "Không tìm thấy tài khoản với SĐT này"
          : type === "username"
          ? "Không tìm thấy tài khoản với username này"
          : "Không tìm thấy tài khoản",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      maskedEmail: maskEmail(user.email),
      name: user.name || user.username || "bạn",
    });
  } catch (error) {
    console.error("[auth/lookup]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
