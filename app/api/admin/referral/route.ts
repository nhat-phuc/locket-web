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
    const users = await prisma.user.findMany({
      where: { referralCode: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        referralCode: true,
        referredBy: true,
      },
    });

    const withCounts = await Promise.all(
      users.map(async (u) => {
        const count = await prisma.user.count({ where: { referredBy: u.referralCode || "" } });
        return { ...u, _count: { referredBy: count } };
      })
    );

    return NextResponse.json({ success: true, users: withCounts });
  } catch (error) {
    console.error("[admin/referral]", error);
    return NextResponse.json({ success: false, users: [] }, { status: 500 });
  }
}
