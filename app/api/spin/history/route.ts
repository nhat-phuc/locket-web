import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const spins = await prisma.spin.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, spins });
  } catch (e) {
    console.error("[spin/history]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
