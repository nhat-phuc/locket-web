import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, referrals: [] }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        referred: {
          select: { name: true, email: true, picture: true, username: true },
        },
      },
    });

    return NextResponse.json({ success: true, referrals });
  } catch (error) {
    console.error("[referral/my]", error);
    return NextResponse.json({ success: false, referrals: [] }, { status: 500 });
  }
}
