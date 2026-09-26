import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ success: false, balance: 0 });
      }
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { balance: true },
      });
      return NextResponse.json({ success: true, balance: user?.balance || 0 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { balance: true },
    });

    return NextResponse.json({ success: true, balance: user?.balance || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, balance: 0 });
  }
}
