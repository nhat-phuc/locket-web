import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: true, reviews: [] });

    const reviews = await prisma.review.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("[reviews/my]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
