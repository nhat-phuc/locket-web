import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({ 
    where: { id: session.userId }, 
    select: { role: true } 
  });
  return u?.role === "admin";
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const { subject, content, role } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ success: false, message: "Thiếu nội dung" }, { status: 400 });
    }

    const where = role === "all" ? {} : { role };

    const users = await prisma.user.findMany({
      where,
      select: { email: true },
    });

    let sent = 0;
    for (const u of users) {
      const result = await sendEmail({
        to: u.email,
        subject,
        html: `<div style="font-family:Arial;font-size:14px;line-height:1.7;">${content}</div>`,
      });
      if (result.success) sent++;
    }

    // TODO: Gửi email qua Resend
    // const { Resend } = await import("resend");
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // for (const u of users) {
    //   await resend.emails.send({ from, to: u.email, subject, html: content });
    // }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("[admin/marketing]", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
