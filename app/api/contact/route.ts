import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const session = await getSession();

    await prisma.notification.create({
      data: {
        userId: session?.userId || null,
        title: `Liên hệ: ${subject || "Không có tiêu đề"}`,
        content: `Từ: ${name} (${email}${phone ? " - " + phone : ""})\n\n${message}`,
        type: "contact",
      },
    });

    return NextResponse.json({ success: true, message: "Đã gửi liên hệ, chúng tôi sẽ phản hồi sớm!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
