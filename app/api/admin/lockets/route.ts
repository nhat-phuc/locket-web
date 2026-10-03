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
}, select: { role: true } });
  return u?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ success: false }, { status: 403 });

  try {
    const lockets = await prisma.locketProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        cover: true,
        badge: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, profiles: lockets });
  } catch (error) {
    console.error("[admin/lockets]", error);
    return NextResponse.json({ success: false, profiles: [] }, { status: 500 });
  }
}
