import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  if (!session?.userId) return false;
  const u = await prisma.user.findUnique({ 
    where: { id: session.userId }, 
    select: { role: true } 
  });
  return u?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    // Đọc từ bảng Report nếu có; nếu không, trả về mảng rỗng
    const reports = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "Report" ORDER BY "createdAt" DESC LIMIT 100`
    ).catch(() => []);
    return NextResponse.json({ success: true, reports });
  } catch {
    return NextResponse.json({ success: true, reports: [] });
  }
}
